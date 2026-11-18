import assert from "node:assert/strict";
import test from "node:test";
import { Sound } from "#audio/playback";

function output(t) {
  const contexts = [];
  const param = () => ({
    value: 0,
    setValueAtTime(value) {
      this.value = value;
    },
    linearRampToValueAtTime(value) {
      this.value = value;
    },
    setTargetAtTime(value) {
      this.value = value;
    }
  });
  const node = () => ({
    connect(next) {
      return next;
    },
    disconnect() {
      this.detached = true;
    }
  });
  class AudioContext {
    constructor() {
      this.state = "running";
      this.currentTime = 1;
      this.destination = {};
      this.sources = [];
      contexts.push(this);
    }
    createBuffer(channels, length, sampleRate) {
      const data = Array.from({ length: channels }, () => new Float32Array(length));
      return {
        duration: length / sampleRate,
        length,
        sampleRate,
        getChannelData(channel) {
          return data[channel];
        }
      };
    }
    createGain() {
      return { ...node(), gain: param() };
    }
    createDynamicsCompressor() {
      return { ...node(), threshold: param(), knee: param(), ratio: param(), attack: param(), release: param() };
    }
    createBiquadFilter() {
      return { ...node(), frequency: param(), Q: param() };
    }
    createBufferSource() {
      const source = {
        ...node(),
        start(time, offset) {
          this.offset = offset;
        },
        stop() {
          this.stopped = true;
          this.onended?.();
        }
      };
      this.sources.push(source);
      return source;
    }
  }
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { value: { AudioContext }, configurable: true });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else delete globalThis.window;
  });
  return contexts;
}

function levels(samples, from = 0, to = samples.length) {
  let power = 0,
    peak = 0;
  for (let i = from; i < to; i++) {
    const v = samples[i];
    power += v * v;
    peak = Math.max(peak, Math.abs(v));
  }
  return { rms: Math.sqrt(power / (to - from)), peak };
}

test("Les sons du quai sont distincts, mis en cache et immédiatement coupés", (t) => {
  const contexts = output(t),
    sound = new Sound();
  sound.music(false);
  sound.play("push", false);
  sound.play("inconnu", true);
  sound.mute();
  assert.equal(contexts.length, 0);
  for (const cue of ["step", "push", "bump", "plate", "cell", "bridge", "relay", "swap", "undo", "win"]) {
    sound.play(cue, true, "lest", 0);
  }
  sound.play("step", true, "sonde", 0);
  sound.play("step", true, "lest", 1);
  const [{ sources }] = contexts;
  const fingerprints = sources.map((source) => {
    const data = source.buffer.getChannelData(0),
      { rms, peak } = levels(data);
    assert.ok(rms > 0.016 && rms < 0.33 && peak < 0.95);
    return [data.length, rms.toFixed(7), peak.toFixed(7)].join("/");
  });
  assert.equal(new Set(fingerprints).size, 12);
  assert.ok(sources.filter((source) => !source.stopped).length <= 8);
  sound.play("step", true, "lest", 2);
  assert.equal(sources.at(-1).buffer, sources[0].buffer);
  sources.at(-1).onended();
  assert.ok(sources.at(-1).detached);
  sound.mute();
  assert.ok(sources.every((source) => source.detached));
});

test("La partition stéréo tourne sur une seule source et reprend au temps conservé", async (t) => {
  const contexts = output(t),
    sound = new Sound();
  t.after(() => sound.mute());
  sound.music(true);
  sound.music(false);
  await new Promise((resolve) => setTimeout(resolve, 12));
  const [ctx] = contexts;
  assert.equal(ctx.sources.length, 0);
  sound.music(true, 1);
  sound.music(true, 1);
  const deadline = Date.now() + 5000;
  while (!ctx.sources.length && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(ctx.sources.length, 1);
  const [song] = ctx.sources;
  assert.ok(song.loop);
  const { buffer } = song,
    left = buffer.getChannelData(0),
    right = buffer.getChannelData(1);
  assert.ok(buffer.duration > 24 && buffer.duration < 27);
  assert.notDeepEqual(left.subarray(0, 12000), right.subarray(0, 12000));
  const bar = Math.floor(buffer.length / 16),
    phrases = new Set();
  for (let i = 0; i < 16; i++) {
    const { rms, peak } = levels(left, i * bar, (i + 1) * bar);
    assert.ok(rms > 0.018 && peak < 0.65);
    phrases.add(rms.toFixed(4));
  }
  assert.ok(phrases.size >= 12);
  assert.ok(Math.abs(left[0] - left.at(-1)) < 0.015 && Math.abs(right[0] - right.at(-1)) < 0.015);
  sound.music(true, 2);
  assert.equal(ctx.sources.length, 1);
  sound.play("relay", true);
  ctx.currentTime += 3.25;
  sound.music(false);
  assert.ok(song.detached);
  assert.ok(!ctx.sources[1].detached);
  sound.music(true, 2);
  assert.equal(ctx.sources[2].buffer, buffer);
  assert.equal(ctx.sources[2].offset, 3.25);
  assert.equal(contexts.length, 1);
  sound.mute();
  assert.ok(ctx.sources.every((source) => source.detached));
});
