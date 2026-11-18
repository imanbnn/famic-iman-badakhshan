export const SAMPLE_RATE = 22_050;
const CONCERT_A_HZ = 440;
const CONCERT_A_MIDI = 69;
export const SEMITONES_PER_OCTAVE = 12;
const VIBRATO_RATE_HZ = 5.1;
const VIBRATO_ONSET_SECONDS = 0.17;
const DEFAULT_ATTACK_SECONDS = 0.006;
const DEFAULT_RELEASE_SECONDS = 0.045;

// A seeded generator gives each mechanical sound the same grain on every playback.
const NOISE_SEED = 191_905;
const NOISE_MULTIPLIER = 1_664_525;
const NOISE_INCREMENT = 1_013_904_223;
const NOISE_MIDPOINT = 2 ** 31;
const NOISE_ENVELOPE = {
  attackSeconds: 0.013,
  releaseSeconds: 0.043,
  lowCutoffRatio: 0.22,
  dryGain: 0.72,
  grainGain: 0.28
};
const TABLE_SIZE = 2048;
const tables = new Map();

const harmonics = {
  sine: [1],
  reed: [1, 0.32, 0.18, 0.07, 0.058, 0.023, 0.025],
  string: [1, 0.33, 0.13, 0.14, 0.04, 0.025],
  bass: [1, 0.29, 0.11, 0.045],
  wood: [1, 0.22, 0.11, 0.045, 0.018],
  servo: [1, 0.18, 0.23, 0.07, 0.06]
};

function wave(name) {
  if (tables.has(name)) return tables.get(name);
  const weights = harmonics[name],
    sum = weights.reduce((a, b) => a + b);
  const table = new Float32Array(TABLE_SIZE);
  for (let i = 0; i < table.length; i++) {
    const angle = (2 * Math.PI * i) / TABLE_SIZE;
    for (let h = 0; h < weights.length; h++) table[i] += (weights[h] * Math.sin((h + 1) * angle)) / sum;
  }
  tables.set(name, table);
  return table;
}

export const pitch = (midi) => CONCERT_A_HZ * 2 ** ((midi - CONCERT_A_MIDI) / SEMITONES_PER_OCTAVE);
export const lengthFor = (seconds) => Math.ceil(seconds * SAMPLE_RATE);

export function tone(track, start, seconds, hz, level, timbre, options = {}) {
  const { left, right } = track,
    table = wave(timbre),
    sine = wave("sine");
  const {
    to = hz,
    attack = DEFAULT_ATTACK_SECONDS,
    release = DEFAULT_RELEASE_SECONDS,
    fall = 0,
    pan = 0,
    vibrato = 0
  } = options;
  const count = lengthFor(seconds),
    attackStep = 1 / (attack * SAMPLE_RATE),
    releaseStep = 1 / (release * SAMPLE_RATE);
  const leftGain = right ? Math.sqrt((1 - pan) / 2) * level : level;
  const rightGain = Math.sqrt((1 + pan) / 2) * level;
  const decay = Math.exp(-fall / SAMPLE_RATE),
    phaseMask = TABLE_SIZE - 1;
  const glide = ((to - hz) * TABLE_SIZE) / (SAMPLE_RATE * count),
    vibratoStep = (VIBRATO_RATE_HZ * TABLE_SIZE) / SAMPLE_RATE;
  let frame = Math.round(start * SAMPLE_RATE) % left.length,
    phase = 0,
    vibratoPhase = 0,
    amplitude = 1,
    step = (hz * TABLE_SIZE) / SAMPLE_RATE;
  // The power-of-two table lets the oscillator wrap without a division per audio sample.
  for (let i = 0; i < count; i++) {
    const end = Math.min(1, (count - 1 - i) * releaseStep);
    const sample = table[(phase | 0) & phaseMask] * Math.min(1, i * attackStep) * end * end * amplitude;
    left[frame] += sample * leftGain;
    if (right) right[frame] += sample * rightGain;
    phase += step;
    if (vibrato)
      phase +=
        step *
        vibrato *
        sine[(vibratoPhase | 0) & phaseMask] *
        Math.min(1, i / (SAMPLE_RATE * VIBRATO_ONSET_SECONDS));
    vibratoPhase += vibratoStep;
    step += glide;
    amplitude *= decay;
    if (++frame === left.length) frame = 0;
  }
}

export function scrape(target, start, seconds, level, cutoff, grain) {
  const count = lengthFor(seconds),
    at = Math.round(start * SAMPLE_RATE);
  const fast = 1 - Math.exp((-2 * Math.PI * cutoff) / SAMPLE_RATE),
    slow = 1 - Math.exp((-2 * Math.PI * cutoff * NOISE_ENVELOPE.lowCutoffRatio) / SAMPLE_RATE);
  const sine = wave("sine"),
    grainStep = (grain * TABLE_SIZE) / SAMPLE_RATE;
  let seed = NOISE_SEED + at,
    low = 0,
    mid = 0,
    phase = 0;
  for (let i = 0; i < count && at + i < target.length; i++) {
    seed = (Math.imul(NOISE_MULTIPLIER, seed) + NOISE_INCREMENT) >>> 0;
    const white = seed / NOISE_MIDPOINT - 1;
    low += slow * (white - low);
    mid += fast * (white - mid);
    const window = Math.min(
      1,
      i / (SAMPLE_RATE * NOISE_ENVELOPE.attackSeconds),
      (count - i - 1) / (SAMPLE_RATE * NOISE_ENVELOPE.releaseSeconds)
    );
    target[at + i] +=
      (mid - low) *
      window *
      (NOISE_ENVELOPE.dryGain + NOISE_ENVELOPE.grainGain * sine[(phase | 0) & (TABLE_SIZE - 1)]) *
      level;
    phase += grainStep;
  }
}
