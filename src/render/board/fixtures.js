import { INK, PAPER, ORANGE, MINT, box, oval, path } from "#render/canvas";

function hatch(c, color, top, bottom) {
  for (let x = -14; x <= 10; x += 8)
    path(
      c,
      [
        [x, bottom],
        [x + 6, top]
      ],
      null,
      color,
      3,
      false
    );
}
export function crate(c) {
  box(c, -17, -14, 35, 33, 3, "#8d5f45", INK, 2);
  box(c, -17, -17, 34, 31, 3, "#c18b5d", INK, 2);
  box(c, -12, -12, 24, 21, 1, "#a06c4e", "#74513e", 1);
  path(
    c,
    [
      [-13, 6],
      [8, -12],
      [13, -8],
      [-9, 10]
    ],
    "#edbb83",
    INK,
    1.3
  );
  for (const x of [-13, 13]) for (const y of [-13, 10]) oval(c, x, y, 1.2, 1.2, INK);
}
export function plate(c, on) {
  box(c, -22, -18, 44, 37, 5, INK);
  box(c, -19, -16, 38, 31, 3, on ? MINT : "#ffe4a0");
  box(c, -14, -11, 28, 20, 2, on ? "#398775" : "#bea068");
  hatch(c, on ? MINT : "#ffe6a9", -6, 5);
  oval(c, 0, 13, 2, 1.6, INK);
}
export function winch(c, held) {
  oval(c, 0, 3, 22, 19, INK);
  oval(c, 0, 0, 21, 18, held ? MINT : "#d9cedc", INK, 1.5);
  oval(c, 0, 0, 15, 12, held ? "#338576" : "#70566f", INK, 1.4);
  path(
    c,
    [
      [-9, -2],
      [-4, 3],
      [0, -2],
      [4, 3],
      [9, -2]
    ],
    null,
    PAPER,
    2.3,
    false
  );
  for (const x of [-17, 17]) oval(c, x, 0, 1.5, 1.5, INK);
}

export function conduit(c) {
  box(c, -22, -24, 44, 48, 3, "#73aaad", INK, 1.5);
  box(c, -13, -23, 26, 46, 2, "#294e60");
  for (let y = -17; y <= 19; y += 9) box(c, -15, y, 30, 3, 1, "#9bd8cd", INK, 1);
}
export function battery(c) {
  path(
    c,
    [
      [0, -16],
      [13, -9],
      [13, 8],
      [0, 16],
      [-13, 8],
      [-13, -9]
    ],
    "#fff0ae",
    INK,
    2
  );
  path(
    c,
    [
      [2, -10],
      [-6, 1],
      [-1, 1],
      [-3, 9],
      [6, -3],
      [1, -3]
    ],
    INK
  );
}
export function relay(c, on) {
  box(c, -12, 1, 26, 16, 3, "#416574", INK);
  box(c, -11, -14, 22, 23, 4, on ? MINT : "#aacfc1", INK, 2);
  box(c, -7, -10, 14, 10, 2, INK);
  path(
    c,
    [
      [-5, -5],
      [-2, -5],
      [0, -8],
      [2, -3],
      [5, -5]
    ],
    null,
    on ? "#ffe594" : MINT,
    1.3,
    false
  );
  oval(c, 0, 5, 2, 2, on ? "#ffe594" : INK);
  path(
    c,
    [
      [-6, -14],
      [-9, -22]
    ],
    null,
    INK,
    2,
    false
  );
  oval(c, -9, -22, 2, 2, on ? ORANGE : MINT, INK, 1);
}
export function bridge(c, open, fraction = 1) {
  if (open) {
    c.save();
    c.beginPath();
    c.rect(-25, -25, 50, 50 * fraction);
    c.clip();
    for (let y = -22; y <= 21; y += 9) box(c, -23, y, 46, 7, 1, "#dfa46c", INK, 1);
    for (const x of [-20, 20]) box(c, x, -23, 2, 46, 1, "#fce2a2");
    c.restore();
  } else {
    c.setLineDash([4, 4]);
    box(c, -20, -18, 40, 36, 3, null, "#f4d2a7", 1.7);
    c.setLineDash([]);
    path(
      c,
      [
        [2, -10],
        [-6, 1],
        [-1, 1],
        [-3, 9],
        [6, -3],
        [1, -3]
      ],
      "#ffe2a2"
    );
  }
}
export function gate(c, open) {
  for (const x of [-21, 16]) {
    box(c, x, -15, 6, 32, 2, INK);
    box(c, x, -16, 6, 6, 2, open ? MINT : ORANGE, INK, 1);
  }
  if (open) {
    path(
      c,
      [
        [-7, 0],
        [0, 5],
        [8, -5]
      ],
      null,
      "#3a7465",
      3,
      false
    );
    return;
  }
  box(c, -20, -8, 40, 14, 2, "#ffac80", INK);
  hatch(c, INK, -5, 3);
}
export function beacon(c, on) {
  if (on) oval(c, 0, -14, 21, 19, "#fff0a666");
  oval(c, 0, 15, 17, 5, "#735e4b");
  path(
    c,
    [
      [-11, 14],
      [-5, -12],
      [5, -12],
      [11, 14]
    ],
    PAPER,
    INK,
    2
  );
  path(
    c,
    [
      [-9, 7],
      [-7, -1],
      [7, -4],
      [8, 3]
    ],
    "#e78a64"
  );
  box(c, -7, -19, 14, 9, 1, on ? "#ffe073" : "#65949b", INK, 1.5);
  path(
    c,
    [
      [-10, -19],
      [0, -26],
      [10, -19]
    ],
    ORANGE,
    INK,
    1.5
  );
  path(
    c,
    [
      [-9, -10],
      [9, -10]
    ],
    null,
    INK,
    2,
    false
  );
}
