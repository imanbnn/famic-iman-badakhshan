import { BARS } from "#audio/lantern-score";
import { pitch, lengthFor, tone, SEMITONES_PER_OCTAVE } from "#audio/synthesizer";

const TEMPO_BPM = 76;
const EIGHTHS_PER_BEAT = 3;
const EIGHTHS_PER_BAR = 6;
const SECONDS_PER_MINUTE = 60;
const EIGHTH = SECONDS_PER_MINUTE / (TEMPO_BPM * EIGHTHS_PER_BEAT);
const BAR = EIGHTHS_PER_BAR * EIGHTH;
export const BAR_COUNT = BARS.length;
const BARS_PER_PHRASE = 4;

export function scoreBar(track, index) {
  const { root, answer, chord, melody, upperHarmony, chime } = BARS[index],
    bar = index * BAR;
  const sound = (beat, length, midi, level, timbre, options) =>
    tone(track, bar + beat * EIGHTH, length * EIGHTH, pitch(midi), level, timbre, options);
  const bass = { attack: 0.022, release: 0.13, fall: 1.7, pan: -0.09 };
  sound(0, 2.9, root, 0.26, "bass", bass);
  sound(3.06, index === BAR_COUNT - 1 ? 1.95 : 2.35, answer, 0.17, "bass", bass);
  const string = { attack: 0.006, release: 0.1, fall: 5.7, pan: 0.42 };
  sound(1.06, 2.9, chord[0], 0.145, "string", string);
  sound(2.02, 2.7, chord[2], 0.115, "string", string);
  sound(4.04, 2.2, chord[1], 0.138, "string", string);
  if ((index + 1) % BARS_PER_PHRASE !== 0) sound(5.05, 1.85, chord[index % 2 ? 2 : 0], 0.09, "string", string);

  let beat = 0;
  for (const [midi, span] of melody) {
    if (midi) {
      const accent = beat === 0 || beat === 3 ? 0.202 : 0.167;
      sound(beat + 0.035, span * 0.94, midi, accent, "reed", {
        attack: 0.038,
        release: 0.092,
        fall: 0.46,
        pan: -0.23,
        vibrato: 0.0027
      });
    }
    beat += span;
  }
  // The second phrase opens up into a lightly doubled upper register.
  if (upperHarmony) {
    sound(3.08, 2.35, chord[1] + SEMITONES_PER_OCTAVE, 0.048, "sine", {
      attack: 0.084,
      release: 0.18,
      pan: 0.65,
      vibrato: 0.0015
    });
  }
  if (chime) {
    sound(4.58, 2.15, chime, 0.045, "sine", {
      attack: 0.008,
      release: 0.14,
      fall: 3.7,
      pan: 0.55
    });
  }
}

export function harbourReflection(track) {
  const { left, right } = track,
    early = lengthFor(0.079),
    late = lengthFor(0.126);
  const fromRight = right.slice(-early),
    fromLeft = left.slice(-late);
  for (let i = left.length - 1; i >= 0; i--) {
    left[i] += 0.12 * (i >= early ? right[i - early] : fromRight[i]);
    right[i] += 0.1 * (i >= late ? left[i - late] : fromLeft[i]);
  }
}

export function emptyTrack() {
  const frames = lengthFor(BAR_COUNT * BAR);
  return { left: new Float32Array(frames), right: new Float32Array(frames) };
}
