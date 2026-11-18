import { otherHero } from "#game/board";
import { robot } from "#render/robots/sprites";
import { path, oval, box } from "#render/canvas";
import { skies, line, tower, ferry, crane, wash } from "#render/harbour/landmarks";

const POSTER_CREW = { mate: [205, 396, 1.14], pilot: [143, 407, 1.62] };

export const POSTER_SIZE = { width: 600, height: 500 };

export function departure(canvas, theme, crew, starter) {
  const c = canvas.getContext("2d"),
    { width: w, height: h } = POSTER_SIZE;
  const p = skies[{ midnight: 2, foam: 1, ember: 0 }[theme]];
  c.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
  c.fillStyle = wash(c, 0, 292, p.high, p.low);
  c.fillRect(0, 0, w, h);
  const glow = c.createRadialGradient(469, 177, 10, 469, 177, 115);
  glow.addColorStop(0, p.sun + "88");
  glow.addColorStop(1, p.sun + "00");
  c.fillStyle = glow;
  c.fillRect(345, 52, 255, 246);
  oval(c, 469, 177, 31, 31, p.sun);
  for (let i = 0; i < 38; i++) {
    const x = (i * 71) % w,
      y = 73 + ((i * 27) % 160);
    line(
      c,
      [
        [x, y],
        [x + 12 + (i % 28), y]
      ],
      p.low + "42",
      0.8
    );
  }
  path(
    c,
    [
      [0, 230],
      [42, 217],
      [79, 228],
      [127, 201],
      [155, 213],
      [194, 195],
      [225, 204],
      [255, 196],
      [303, 223],
      [331, 210],
      [352, 216],
      [394, 200],
      [431, 217],
      [462, 207],
      [497, 220],
      [547, 190],
      [578, 199],
      [600, 184],
      [600, 290],
      [0, 290]
    ],
    p.coast
  );
  path(
    c,
    [
      [0, 246],
      [42, 231],
      [66, 237],
      [94, 228],
      [147, 251],
      [191, 230],
      [233, 244],
      [276, 235],
      [316, 253],
      [357, 238],
      [391, 250],
      [432, 233],
      [472, 247],
      [505, 230],
      [553, 242],
      [600, 220],
      [600, 295],
      [0, 295]
    ],
    p.town
  );
  for (const [x, s] of [
    [29, 1.07],
    [66, 1.3],
    [113, 1.02],
    [146, 0.78]
  ])
    crane(c, x, 270, s, p);
  for (let i = 0; i < 20; i++) {
    const x = i * 10,
      y = 266 - ((i * 7) % 11);
    path(
      c,
      [
        [x, 272],
        [x, y],
        [x + 5, y - 3],
        [x + 10, y],
        [x + 10, 272]
      ],
      p.dock
    );
  }
  c.fillStyle = wash(c, 270, h, p.water, p.deep);
  c.fillRect(0, 270, w, h - 270);
  for (let i = 0; i < 370; i++) {
    const x = (i * 137) % w,
      y = 272 + ((i * 29) % 224);
    const bright = Math.abs(x - 468) < 8 + (y - 270) * 0.4;
    line(
      c,
      [
        [x, y],
        [x + 4 + (i % 18), y]
      ],
      bright ? p.sun + "9c" : "#d1dbcb40",
      0.6 + (i % 3) * 0.4
    );
  }
  path(
    c,
    [
      [350, 302],
      [384, 293],
      [402, 285],
      [422, 283],
      [436, 272],
      [459, 268],
      [482, 261],
      [503, 266],
      [531, 265],
      [552, 276],
      [574, 272],
      [600, 257],
      [600, 296],
      [567, 301],
      [524, 300],
      [499, 307],
      [455, 305],
      [418, 311],
      [387, 307]
    ],
    p.near
  );
  tower(c, 490, 263, 2.18, p, true);
  path(
    c,
    [
      [457, 268],
      [457, 258],
      [464, 252],
      [471, 258],
      [471, 267]
    ],
    p.near
  );
  for (const [x, y] of [
    [399, 174],
    [409, 171],
    [422, 179]
  ])
    line(
      c,
      [
        [x - 3, y - 1],
        [x, y + 1],
        [x + 3, y - 2]
      ],
      p.dock,
      1
    );
  ferry(c, 303, 327, p);
  path(
    c,
    [
      [0, 356],
      [59, 345],
      [93, 350],
      [137, 339],
      [167, 341],
      [194, 349],
      [226, 348],
      [238, 352],
      [196, 361],
      [153, 360],
      [111, 369],
      [64, 365],
      [0, 380]
    ],
    p.dock
  );
  path(
    c,
    [
      [0, 408],
      [137, 373],
      [352, 432],
      [193, 495],
      [0, 460]
    ],
    "#ba9777",
    "#344652",
    2
  );
  for (let i = 0; i < 13; i++) {
    const f = i / 13;
    line(
      c,
      [
        [137 + 215 * f, 374 + 59 * f],
        [-17 + 212 * f, 414 + 78 * f]
      ],
      "#735f55",
      1.2
    );
  }
  path(
    c,
    [
      [0, 438],
      [194, 485],
      [352, 432],
      [352, 445],
      [196, 500],
      [0, 452]
    ],
    "#4e504d",
    p.near,
    2
  );
  for (const [x, y] of [
    [26, 406],
    [143, 382],
    [317, 430]
  ]) {
    oval(c, x, y, 7, 3, "#453e37");
    box(c, x - 4, y - 9, 8, 9, 2, p.near);
    oval(c, x, y - 9, 6, 2.5, "#716652", p.near, 1);
  }
  robot(c, crew[otherHero(starter)], ...POSTER_CREW.mate);
  robot(c, crew[starter], ...POSTER_CREW.pilot);
}
