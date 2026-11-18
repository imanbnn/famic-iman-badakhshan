import { SAMPLE_RATE, pitch, lengthFor, tone, scrape } from "#audio/synthesizer";

const durations = {
  step: 0.17,
  push: 0.37,
  bump: 0.23,
  plate: 0.62,
  cell: 0.64,
  bridge: 0.8,
  relay: 0.48,
  swap: 0.39,
  undo: 0.43,
  win: 1.86
};

export function createEffect(context, event, role, variation) {
  const buffer = context.createBuffer(1, lengthFor(durations[event]), SAMPLE_RATE);
  const left = buffer.getChannelData(0),
    track = { left };
  const add = (start, length, hz, level, timbre, opts) => tone(track, start, length, hz, level, timbre, opts);
  const knock = (start, hz, level) =>
    add(start, 0.105, hz, level, "wood", { to: hz * 0.52, attack: 0.002, fall: 23, release: 0.035 });
  const bell = (start, hz, level, length) => {
    add(start, length, hz, level, "sine", { attack: 0.004, fall: 4, release: 0.1 });
    add(start, length * 0.6, hz * 2.61, level * 0.24, "sine", { attack: 0.003, fall: 8, release: 0.06 });
  };
  switch (event) {
    case "step":
      if (role === "sonde") {
        add(0, 0.066, variation ? 505 : 466, 0.19, "servo", { to: variation ? 612 : 561, fall: 12 });
        scrape(left, 0.042, 0.064, 0.23, 2100, 26);
      } else {
        knock(0, variation ? 164 : 147, 0.36);
        scrape(left, 0.012, 0.105, 0.42, 790, 17);
        knock(0.051, variation ? 255 : 236, 0.085);
      }
      break;
    case "push":
      knock(0.002, 139, 0.29);
      scrape(left, 0.018, 0.236, 1.05, 1030, 23);
      add(0.03, 0.18, 143, 0.12, "wood", { to: 104, fall: 4 });
      knock(0.224, 181, 0.25);
      break;
    case "bump":
      knock(0, 119, 0.45);
      knock(0.089, 101, 0.17);
      break;
    case "plate":
      knock(0.004, 173, 0.41);
      scrape(left, 0.015, 0.044, 0.38, 2550, 39);
      bell(0.085, pitch(74), 0.3, 0.48);
      break;
    case "cell":
      add(0, 0.135, 390, 0.23, "servo", { to: 914, attack: 0.026, release: 0.032 });
      bell(0.116, pitch(76), 0.18, 0.32);
      bell(0.197, pitch(81), 0.22, 0.39);
      break;
    case "bridge":
      scrape(left, 0.012, 0.35, 0.83, 690, 15);
      for (const [at, hz] of [
        [0.005, 225],
        [0.117, 203],
        [0.214, 182],
        [0.296, 160]
      ])
        knock(at, hz, 0.28);
      knock(0.405, 121, 0.45);
      bell(0.441, pitch(62), 0.21, 0.31);
      break;
    case "relay":
      scrape(left, 0.002, 0.049, 0.55, 2050, 32);
      add(0.036, 0.054, 680, 0.19, "servo", { release: 0.019 });
      add(0.127, 0.079, 680, 0.21, "servo", { release: 0.027 });
      bell(0.206, 880, 0.19, 0.24);
      break;
    case "swap": {
      const scout = role === "sonde";
      add(0, 0.11, pitch(scout ? 62 : 69), 0.22, "string", { fall: 6 });
      bell(0.108, pitch(scout ? 69 : 62), 0.235, 0.25);
      break;
    }
    case "undo":
      add(0.008, 0.25, 730, 0.22, "sine", { to: 245, attack: 0.105, release: 0.065 });
      scrape(left, 0.035, 0.18, 0.27, 1560, 19);
      knock(0.255, 189, 0.23);
      break;
    case "win":
      add(0.009, 0.83, pitch(50), 0.235, "bass", { attack: 0.033, release: 0.21, fall: 1.9 });
      for (const [at, midi, length, level] of [
        [0.013, 69, 0.32, 0.24],
        [0.23, 66, 0.19, 0.18],
        [0.39, 69, 0.24, 0.19],
        [0.6, 74, 1.13, 0.31]
      ]) {
        bell(at, pitch(midi), level, length);
      }
      add(0.6, 0.93, pitch(66), 0.13, "reed", { attack: 0.085, release: 0.26, fall: 1.8 });
      break;
  }
  return buffer;
}

export const hasEffect = (name) => Object.hasOwn(durations, name);
