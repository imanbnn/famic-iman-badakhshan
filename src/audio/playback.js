import { LEVELS, FIRST_STAGE } from "#game/levels";
import { SAMPLE_RATE } from "#audio/synthesizer";
import { composeMusic } from "#audio/music";
import { createEffect, hasEffect } from "#audio/effects";

const FILTER_HZ = { dryDock: 4_200, twinChannels: 2_750, lastLight: 3_650 };
const MAX_EFFECT_VOICES = 8;
const COMPRESSOR = { thresholdDb: -9, kneeDb: 7, ratio: 12, attackSeconds: 0.003, releaseSeconds: 0.11 };
const MIX = {
  effectsGain: 0.83,
  musicGain: 0.82,
  fadeInSeconds: 0.17,
  filterQ: 0.58,
  filterTransitionSeconds: 0.38
};

function disconnect(voice) {
  voice.source.onended = null;
  voice.source.disconnect();
  voice.gain.disconnect();
  voice.filter?.disconnect();
}

function stop(voice) {
  if (!voice) return;
  // Disconnect even when an interrupted context cannot advance to an onended event.
  disconnect(voice);
  voice.source.stop();
}

export class Sound {
  constructor() {
    this.effects = new Map();
    this.playing = new Set();
    this.stage = LEVELS[FIRST_STAGE].id;
    this.offset = 0;
  }

  context() {
    const Audio = globalThis.window?.AudioContext || globalThis.window?.webkitAudioContext;
    if (!Audio) return null;
    if (!this.ctx) {
      this.ctx = new Audio();
      const limiter = this.ctx.createDynamicsCompressor();
      limiter.threshold.value = COMPRESSOR.thresholdDb;
      limiter.knee.value = COMPRESSOR.kneeDb;
      limiter.ratio.value = COMPRESSOR.ratio;
      limiter.attack.value = COMPRESSOR.attackSeconds;
      limiter.release.value = COMPRESSOR.releaseSeconds;
      limiter.connect(this.ctx.destination);
      this.output = limiter;
    }
    if (this.ctx.state === "suspended" || this.ctx.state === "interrupted") {
      const gesture = Boolean(globalThis.navigator?.userActivation?.isActive);
      if (!this.waking || (gesture && !this.waking.gesture)) {
        const request = { gesture };
        this.waking = request;
        Promise.resolve(this.ctx.resume())
          .catch(() => {})
          .finally(() => {
            if (this.waking === request) this.waking = null;
          });
      }
    }
    return this.ctx;
  }

  play(event, enabled, role = "lest", moves = 0) {
    if (!enabled || !hasEffect(event)) return;
    try {
      const ctx = this.context();
      if (!ctx) return;
      const variant = event === "step" ? moves % 2 : 0;
      const pilot = (event === "step" || event === "swap") && role === "sonde" ? "sonde" : "lest";
      const key = event + "-" + pilot + "-" + variant;
      if (!this.effects.has(key)) this.effects.set(key, createEffect(ctx, event, pilot, variant));
      if (this.playing.size >= MAX_EFFECT_VOICES) {
        const oldest = this.playing.values().next().value;
        stop(oldest);
        this.playing.delete(oldest);
      }
      const source = ctx.createBufferSource(),
        gain = ctx.createGain(),
        voice = { source, gain };
      source.buffer = this.effects.get(key);
      gain.gain.value = MIX.effectsGain;
      source.connect(gain).connect(this.output);
      source.onended = () => {
        disconnect(voice);
        this.playing.delete(voice);
      };
      this.playing.add(voice);
      source.start();
    } catch {
      /* Audio output is optional. */
    }
  }

  music(enabled, stage = 0) {
    this.musicEnabled = enabled;
    if (!enabled) {
      if (this.loop) {
        this.offset = (this.offset + Math.max(0, this.ctx.currentTime - this.started)) % this.score.duration;
        stop(this.loop);
        this.loop = null;
      }
      return;
    }
    try {
      const ctx = this.context();
      if (!ctx) return;
      const location = (LEVELS[stage] ?? LEVELS[FIRST_STAGE]).id;
      if (this.loop) {
        if (location !== this.stage)
          this.loop.filter.frequency.setTargetAtTime(
            FILTER_HZ[location],
            ctx.currentTime,
            MIX.filterTransitionSeconds
          );
        this.stage = location;
        return;
      }
      this.stage = location;
      if (!this.score) {
        this.preparing ??= this.prepareMusic(ctx);
        return;
      }
      this.startLoop();
    } catch {
      /* A browser may deny audio until the first gesture. */
    }
  }

  async prepareMusic(ctx) {
    try {
      const { left, right } = await composeMusic();
      const buffer = ctx.createBuffer(2, left.length, SAMPLE_RATE);
      buffer.getChannelData(0).set(left);
      buffer.getChannelData(1).set(right);
      this.score = buffer;
      if (this.musicEnabled) this.startLoop();
    } catch {
      /* The game remains playable if the audio device is unavailable. */
    } finally {
      this.preparing = null;
    }
  }

  startLoop() {
    const ctx = this.ctx,
      source = ctx.createBufferSource(),
      filter = ctx.createBiquadFilter(),
      gain = ctx.createGain();
    source.buffer = this.score;
    source.loop = true;
    filter.type = "lowpass";
    filter.Q.value = MIX.filterQ;
    filter.frequency.value = FILTER_HZ[this.stage];
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(MIX.musicGain, ctx.currentTime + MIX.fadeInSeconds);
    source.connect(filter).connect(gain).connect(this.output);
    this.started = ctx.currentTime;
    this.loop = { source, filter, gain };
    source.start(this.started, this.offset);
  }

  mute() {
    this.music(false);
    for (const voice of this.playing) stop(voice);
    this.playing.clear();
  }
}
