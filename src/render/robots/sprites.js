import { INK, PAPER, ORANGE, MINT, box, oval, path, local } from "#render/canvas";
import { haulers } from "#render/robots/haulers";
import { scouts } from "#render/robots/scouts";

function lest(c) {
  box(c, -14, 10, 10, 9, 3, "#38515a", INK);
  box(c, 4, 10, 10, 9, 3, "#38515a", INK);
  box(c, -20, -3, 7, 15, 3, ORANGE, INK);
  box(c, 13, -3, 7, 15, 3, ORANGE, INK);
  box(c, -15, -17, 30, 32, [10, 10, 6, 6], "#e77a53", INK, 2.5);
  box(c, -13, -16, 26, 21, 8, ORANGE);
  box(c, -6, -19, 12, 4, 2, "#ffe0a4", INK, 1.5);
  box(c, -12, -10, 24, 15, 6, "#ffe0a4", INK, 1.8);
  box(c, -9, -7, 18, 9, 3, INK);
  box(c, -6, -5, 3, 4, 1, "#fff1c8");
  box(c, 3, -5, 3, 4, 1, "#fff1c8");
  path(
    c,
    [
      [-12, 9],
      [12, 9]
    ],
    null,
    INK,
    1.7,
    false
  );
  for (const x of [-10, 10]) oval(c, x, 12, 1.2, 1.2, PAPER);
}

function sonde(c) {
  path(
    c,
    [
      [-10, 1],
      [-20, 9],
      [-18, 15],
      [-7, 11]
    ],
    "#53ab9e",
    INK,
    2
  );
  path(
    c,
    [
      [10, 1],
      [20, 9],
      [18, 15],
      [7, 11]
    ],
    "#53ab9e",
    INK,
    2
  );
  path(
    c,
    [
      [0, 18],
      [-4, 13],
      [4, 13]
    ],
    PAPER,
    INK,
    1.5
  );
  path(
    c,
    [
      [-1, -19],
      [6, -13],
      [14, 5],
      [10, 13],
      [-10, 13],
      [-14, 5],
      [-6, -13]
    ],
    MINT,
    INK,
    2.5
  );
  path(
    c,
    [
      [-6, -12],
      [-2, -18],
      [2, -13]
    ],
    PAPER
  );
  oval(c, 0, 0, 9.5, 8, "#53aca1", INK, 2);
  oval(c, 0, 0, 6.8, 5.7, INK);
  oval(c, 1, -1, 3.5, 3.2, "#ddfff0");
  path(
    c,
    [
      [-5, 10],
      [5, 10]
    ],
    null,
    INK,
    1.5,
    false
  );
}

const sprites = { lest, sonde, ...haulers, ...scouts };
const chartSprites = new Map();
const PORTRAIT_VIEWBOX_SIZE = 46;
const SPRITE_SIZE = 64;
const SPRITE_DENSITY = 2;
export function robot(c, model, x, y, scale = 1) {
  local(c, x, y, scale, sprites[model]);
}

export function drawBoardRobot(context, model, x, y) {
  if (!chartSprites.has(model)) {
    const image = document.createElement("canvas");
    image.width = image.height = SPRITE_SIZE * SPRITE_DENSITY;
    robot(image.getContext("2d"), model, image.width / 2, image.height / 2, SPRITE_DENSITY);
    chartSprites.set(model, image);
  }
  context.drawImage(chartSprites.get(model), x - SPRITE_SIZE / 2, y - SPRITE_SIZE / 2, SPRITE_SIZE, SPRITE_SIZE);
}

export function portrait(canvas, hero) {
  const c = canvas.getContext("2d");
  c.clearRect(0, 0, canvas.width, canvas.height);
  robot(c, hero, canvas.width / 2, canvas.height / 2, canvas.height / PORTRAIT_VIEWBOX_SIZE);
}
