import { path, box } from "#render/canvas";

export const skies = [
  {
    high: "#75858e",
    low: "#ffca99",
    sun: "#ffedbd",
    coast: "#aa9290",
    town: "#877a79",
    dock: "#555c63",
    near: "#344652",
    water: "#829391",
    deep: "#486773"
  },
  {
    high: "#71888c",
    low: "#dce1c6",
    sun: "#f6e8bc",
    coast: "#a3b4ab",
    town: "#839b96",
    dock: "#587a7c",
    near: "#314e5c",
    water: "#8aa5a0",
    deep: "#4f7378"
  },
  {
    high: "#28394e",
    low: "#ae8b90",
    sun: "#f8d5a1",
    coast: "#726879",
    town: "#665f71",
    dock: "#414756",
    near: "#263744",
    water: "#65677b",
    deep: "#394b62"
  }
];
export const line = (c, points, color, weight = 0.8) => path(c, points, null, color, weight, false);

export function wash(c, y1, y2, a, b) {
  const gradient = c.createLinearGradient(0, y1, 0, y2);
  gradient.addColorStop(0, a);
  gradient.addColorStop(1, b);
  return gradient;
}
export function tower(c, x, y, s, p, lit) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  if (lit) {
    const beam = c.createLinearGradient(-115, 0, 0, 0);
    beam.addColorStop(0, "#ffefb200");
    beam.addColorStop(1, "#fff0badd");
    path(
      c,
      [
        [-2, -33],
        [-115, -45],
        [-115, -29],
        [-2, -31]
      ],
      beam
    );
  }
  path(
    c,
    [
      [-8, 0],
      [-4.5, -28],
      [4, -28],
      [8, 0]
    ],
    "#e6d8ba",
    p.near,
    1
  );
  path(
    c,
    [
      [1, -28],
      [4, -28],
      [8, 0],
      [3, 0]
    ],
    "#b9ab9c"
  );
  path(
    c,
    [
      [-6.4, -11],
      [-5.5, -18],
      [5, -20],
      [6, -13]
    ],
    "#b56651"
  );
  box(c, -1, -8, 2, 4, 0, p.near);
  box(c, -4.8, -35, 9.6, 6.5, 0, lit ? "#ffe29b" : "#b7c3b5", p.near, 1);
  line(
    c,
    [
      [-1.5, -35],
      [-1.5, -29]
    ],
    p.near,
    0.6
  );
  path(
    c,
    [
      [-7, -35],
      [0, -40],
      [7, -35]
    ],
    p.near
  );
  line(
    c,
    [
      [0, -40],
      [0, -42]
    ],
    p.near,
    1
  );
  line(
    c,
    [
      [-7, -28],
      [7, -28]
    ],
    p.near,
    1.8
  );
  for (const xx of [-6, -3, 0, 3, 6])
    line(
      c,
      [
        [xx, -31],
        [xx, -28]
      ],
      p.near,
      0.65
    );
  line(
    c,
    [
      [-7, -31],
      [7, -31]
    ],
    p.near,
    0.8
  );
  c.restore();
}

export function crane(c, x, y, s, p) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  line(
    c,
    [
      [-6, 0],
      [-3, -20],
      [0, -24],
      [1, -6],
      [5, 0]
    ],
    p.dock,
    1.8
  );
  line(
    c,
    [
      [-4, -12],
      [2, -7],
      [-3, -4],
      [5, 0]
    ],
    p.dock,
    0.9
  );
  path(
    c,
    [
      [-7, -22],
      [1, -25],
      [4, -21],
      [-7, -19]
    ],
    p.dock
  );
  line(
    c,
    [
      [-7, -22],
      [-10, -28],
      [16, -35],
      [23, -35],
      [0, -21]
    ],
    p.dock,
    1
  );
  line(
    c,
    [
      [-8, -24],
      [6, -31],
      [15, -31],
      [23, -35]
    ],
    p.dock,
    0.65
  );
  line(
    c,
    [
      [19, -34],
      [19, -16],
      [17.5, -15]
    ],
    p.dock,
    0.65
  );
  c.restore();
}

export function ferry(c, x, y, p) {
  c.save();
  c.translate(x, y);
  for (let i = 0; i < 3; i++)
    line(
      c,
      [
        [-34 - i * 4, 2 + i],
        [-20 + i * 2, 2 + i],
        [-16, 1]
      ],
      "#e8ddba96",
      0.7
    );
  path(
    c,
    [
      [-23, -3],
      [21, -3],
      [17, 1],
      [-17, 2]
    ],
    p.near
  );
  path(
    c,
    [
      [-15, -8],
      [10, -8],
      [15, -3],
      [-16, -3]
    ],
    "#ddd7ba",
    p.near,
    0.7
  );
  box(c, -7, -11, 12, 3, 0, p.near);
  for (const xx of [-12, -8, -4, 0, 4, 8]) box(c, xx, -7, 2.4, 2, 0, p.near);
  line(
    c,
    [
      [-16, -2],
      [17, -2]
    ],
    "#be735b",
    1
  );
  c.restore();
}
