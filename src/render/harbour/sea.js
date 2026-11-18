import { INK, PAPER, ORANGE, box, oval, path, local } from "#render/canvas";

const SKIFF_POSITIONS = [
  [0.72, 0.82],
  [0.79, 0.45],
  [0.46, 0.78]
];
export function skiffPosition(stage, width, height) {
  const [x, y] = SKIFF_POSITIONS[stage];
  return [x * width, y * height];
}

function compass(c) {
  oval(c, 0, 0, 16, 16, null, "#7e9a9d", 1);
  path(
    c,
    [
      [0, -23],
      [5, 5],
      [0, 1]
    ],
    "#f4dcb5"
  );
  path(
    c,
    [
      [0, -23],
      [-5, 5],
      [0, 1]
    ],
    "#8eaaaa"
  );
  path(
    c,
    [
      [0, 18],
      [4, 4],
      [0, 7],
      [-4, 4]
    ],
    "#78949a"
  );
  c.fillStyle = PAPER;
  c.font = "bold 10px monospace";
  c.textAlign = "center";
  c.fillText("N", 0, -29);
}

function skiff(c) {
  c.rotate(-0.42);
  oval(c, 3, 6, 35, 13, "#13303a");
  path(
    c,
    [
      [-35, 0],
      [-21, -10],
      [20, -10],
      [33, 0],
      [19, 11],
      [-22, 9]
    ],
    "#d3956a",
    INK,
    2
  );
  path(
    c,
    [
      [-28, 0],
      [-18, -6],
      [18, -6],
      [26, 0],
      [15, 6],
      [-17, 6]
    ],
    "#4c6c70",
    INK,
    1
  );
  for (const x of [-12, 7]) box(c, x, -7, 5, 15, 1, "#e1bd8a", INK, 1);
  path(
    c,
    [
      [-8, 10],
      [14, -13]
    ],
    null,
    "#efc696",
    2,
    false
  );
  oval(c, 14, -13, 3.5, 2.2, ORANGE);
}

export function sea(c, w, h, region, stage, paintShelf) {
  const color = ["#28575d", "#31545e", "#1e344e"][stage];
  const depth = c.createLinearGradient(0, 0, w, h);
  depth.addColorStop(0, color);
  depth.addColorStop(0.52, ["#24505b", "#2d505a", "#233d53"][stage]);
  depth.addColorStop(1, ["#183e4c", "#213e49", "#172b41"][stage]);
  c.fillStyle = depth;
  c.fillRect(0, 0, w, h);
  paintShelf();

  c.strokeStyle = "#54788439";
  c.lineWidth = 1;
  for (let x = 24; x < w; x += 52) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, h);
    c.stroke();
  }
  for (let y = 24; y < h; y += 52) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(w, y);
    c.stroke();
  }
  for (let i = 0; i < 8; i++) {
    c.beginPath();
    c.moveTo(-25, 65 + i * 11);
    c.bezierCurveTo(72, 49 + i * 9, 135, 108 + i * 8, 202 + i * 9, -12);
    c.moveTo(w + 8, h - 110 + i * 9);
    c.bezierCurveTo(w - 131, h - 162 + i * 12, w - 168, h - 24 + i * 9, w - 240, h + 10 + i * 10);
    c.strokeStyle = "#729c982d";
    c.stroke();
  }
  for (let i = 0; i < 75; i++) {
    const x = (i * 193 + 67) % w,
      y = (i * 79 + 49) % h;
    path(
      c,
      [
        [x - 4, y],
        [x, y + 1],
        [x + 4, y - 1],
        [x + 8, y]
      ],
      null,
      "#82a69d45",
      1.1,
      false
    );
  }
  local(c, w - 43, 48, 0.86, compass);
  local(c, ...skiffPosition(stage, w, h), 0.85, skiff);
  c.fillStyle = "#b6cbc0";
  c.font = "10px monospace";
  c.textAlign = "left";
  c.fillText(region.toLocaleUpperCase("fr"), 18, h - 17);
  path(
    c,
    [
      [18, h - 34],
      [47, h - 34],
      [47, h - 37]
    ],
    null,
    "#c0caba",
    1,
    false
  );
  for (const [x, y, sx, sy] of [
    [10, 10, 1, 1],
    [w - 10, 10, -1, 1],
    [10, h - 10, 1, -1],
    [w - 10, h - 10, -1, -1]
  ]) {
    path(
      c,
      [
        [x + sx * 8, y],
        [x, y],
        [x, y + sy * 8]
      ],
      null,
      "#819a98",
      1.2,
      false
    );
  }
}
