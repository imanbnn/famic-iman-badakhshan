import { path, oval, box } from "#render/canvas";
import { skies, line, tower, ferry, crane, wash } from "#render/harbour/landmarks";

export const HARBOUR_SIZE = { width: 400, height: 94 };

export function port(canvas, stage, lights) {
  const count = lights.filter(Boolean).length;
  const c = canvas.getContext("2d"),
    p = skies[stage],
    { width: w, height: h } = HARBOUR_SIZE;
  c.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
  c.fillStyle = wash(c, 0, 59, p.high, p.low);
  c.fillRect(0, 0, w, h);
  const sunX = [250, 222, 282][stage],
    sunY = [30, 31, 20][stage];
  const glow = c.createRadialGradient(sunX, sunY, 3, sunX, sunY, 60);
  glow.addColorStop(0, p.sun + "c4");
  glow.addColorStop(1, p.sun + "00");
  c.fillStyle = glow;
  c.fillRect(sunX - 60, 0, 120, 74);
  oval(c, sunX, sunY, stage === 2 ? 7 : 15, stage === 2 ? 7 : 15, p.sun);
  for (let i = 0; i < 26; i++) {
    const x = (i * 47) % w,
      y = 12 + ((i * 13) % 32);
    line(
      c,
      [
        [x, y],
        [x + 7 + (i % 19), y]
      ],
      p.low + "50",
      0.7
    );
  }
  path(
    c,
    [
      [0, 48],
      [22, 39],
      [51, 45],
      [79, 33],
      [100, 38],
      [135, 29],
      [167, 46],
      [195, 34],
      [210, 38],
      [225, 32],
      [257, 45],
      [288, 31],
      [318, 37],
      [342, 29],
      [359, 34],
      [385, 26],
      [400, 27],
      [400, 61],
      [0, 61]
    ],
    p.coast
  );
  path(
    c,
    [
      [0, 50],
      [38, 46],
      [74, 52],
      [103, 44],
      [152, 47],
      [173, 40],
      [199, 45],
      [233, 39],
      [260, 48],
      [282, 43],
      [310, 49],
      [350, 41],
      [381, 45],
      [400, 39],
      [400, 60],
      [0, 60]
    ],
    p.town
  );
  for (let i = 0; i < 22; i++) {
    const x = 52 + i * 10 + (i % 4),
      y = 52 - ((i * 5) % 7);
    path(
      c,
      [
        [x, y],
        [x + 4, y - 2],
        [x + 8, y],
        [x + 8, 56],
        [x, 56]
      ],
      p.dock
    );
    if (i % 4 === 0) box(c, x + 1, y - 7, 1.7, 7, 0, p.dock);
  }
  for (const [x, s] of [
    [107, 0.63],
    [128, 0.76],
    [152, 0.66],
    [179, 0.84]
  ])
    crane(c, x, 56, s, p);
  c.fillStyle = wash(c, 55, h, p.water, p.deep);
  c.fillRect(0, 55, w, 39);
  for (let i = 0; i < 145; i++) {
    const x = (i * 97) % w,
      y = 56 + ((i * 17) % 37);
    line(
      c,
      [
        [x, y],
        [x + 2 + (i % 9), y]
      ],
      Math.abs(x - sunX) < 13 + (y - 55) * 0.6 ? p.sun + "ae" : "#c2d1c642",
      0.55 + (i % 3) * 0.18
    );
  }
  path(
    c,
    [
      [0, 64],
      [31, 61],
      [49, 60],
      [62, 56],
      [77, 56],
      [89, 60],
      [106, 64],
      [121, 68],
      [76, 69],
      [35, 67],
      [0, 72]
    ],
    p.dock
  );
  path(
    c,
    [
      [157, 69],
      [181, 63],
      [194, 57],
      [204, 58],
      [222, 65],
      [244, 68],
      [250, 70],
      [196, 72]
    ],
    p.dock
  );
  path(
    c,
    [
      [274, 81],
      [296, 75],
      [312, 68],
      [328, 67],
      [342, 57],
      [352, 54],
      [366, 57],
      [380, 58],
      [400, 49],
      [400, 80],
      [367, 83],
      [340, 80],
      [304, 83]
    ],
    p.near
  );
  for (const [index, [x, y, s]] of [
    [72, 57, 0.61],
    [196, 58, 0.77],
    [351, 55, 1.08]
  ].entries()) {
    tower(c, x, y, s, p, lights[index]);
    path(
      c,
      [
        [x - 12 * s, y],
        [x - 12 * s, y - 4 * s],
        [x - 8 * s, y - 7 * s],
        [x - 4 * s, y - 4 * s],
        [x - 4 * s, y]
      ],
      p.near
    );
  }
  for (let i = 0; i < 5; i++)
    line(
      c,
      [
        [307 + i * 4, 71 - i],
        [307 + i * 4, 65 - i]
      ],
      p.near,
      0.9
    );
  line(
    c,
    [
      [307, 67],
      [324, 63]
    ],
    p.near,
    0.7
  );
  ferry(c, [228, 258, 274, 373][count], 84, p);
  if (stage === 2)
    for (const [x, y] of [
      [88, 12],
      [114, 19],
      [208, 10],
      [228, 22],
      [311, 9],
      [376, 16]
    ])
      oval(c, x, y, 0.65, 0.65, p.sun);
  else
    for (const [x, y] of [
      [206, 19],
      [215, 15],
      [301, 23]
    ])
      line(
        c,
        [
          [x - 2.5, y - 1],
          [x, y + 0.8],
          [x + 2.7, y - 1.3]
        ],
        p.dock,
        0.7
      );
}
