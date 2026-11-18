import { Terrain } from "#game/terrain";
import { INK, box, oval, path, local } from "#render/canvas";
import { conduit } from "#render/board/fixtures";
import { TILE_SIZE as TILE } from "#render/board/viewport";

const stone = ["#d8c69c", "#dfcea6", "#d4c49f", "#dbca9d", "#d2c19a"];

export function drawQuays(c, board, point) {
  const { tiles, width } = board;
  const land = (p) => tiles[p] && tiles[p] !== Terrain.water && tiles[p] !== Terrain.bridge;
  for (const [p, tile] of tiles.entries()) {
    if (!land(p)) continue;
    const [cx, cy] = point(p),
      x = cx - TILE / 2,
      y = cy - TILE / 2;
    c.fillStyle = "#173541";
    c.fillRect(x - 2, y + 2, TILE + 4, TILE + 6);
    c.fillStyle = "#806e57";
    c.fillRect(x, y + 2, TILE, TILE + 3);
    c.fillStyle = stone[(p * 7 + Math.floor(p / width)) % stone.length];
    c.fillRect(x, y, TILE, TILE);
    c.strokeStyle = "#aa9d80";
    c.lineWidth = 1;
    c.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
    // Longitudinal joints keep the dock readable as a grid at phone size.
    for (const dy of [17, 35]) {
      path(
        c,
        [
          [x + 1, y + dy],
          [x + TILE - 1, y + dy]
        ],
        null,
        "#9d89643e",
        0.8,
        false
      );
      path(
        c,
        [
          [x + 2, y + dy + 1],
          [x + TILE - 2, y + dy + 1]
        ],
        null,
        "#fff0ba4a",
        0.8,
        false
      );
    }
    for (let grain = 0; grain < 3; grain++) {
      const dx = 4 + ((p * 13 + grain * 17) % 28),
        dy = 5 + grain * 16 + (p % 5);
      path(
        c,
        [
          [x + dx, y + dy],
          [x + dx + 5, y + dy - 0.7],
          [x + dx + 10, y + dy]
        ],
        null,
        "#95826448",
        0.8,
        false
      );
    }
    if (!land(p - width)) {
      c.fillStyle = "#f6e2b5";
      c.fillRect(x, y, TILE, 4);
      for (const dx of [5, 43]) oval(c, x + dx, y + 7, 1.4, 1.4, "#827663");
    }
    if (!land(p + width)) {
      c.fillStyle = "#b29c78";
      c.fillRect(x, y + TILE - 4, TILE, 4);
      for (const dx of [6, 42]) box(c, x + dx, y + TILE - 4, 4, 8, 1, INK);
    }
    if (p % width === 0 || !land(p - 1)) {
      c.fillStyle = "#eddab3";
      c.fillRect(x, y, 3, TILE);
    }
    if (p % width === width - 1 || !land(p + 1)) {
      c.fillStyle = "#a89573";
      c.fillRect(x + TILE - 3, y, 3, TILE);
    }
    if (tile === Terrain.quay && p % 4 === 1) {
      path(
        c,
        [
          [x + 7, y + 17],
          [x + 13, y + 16],
          [x + 15, y + 18]
        ],
        null,
        "#b4a384",
        1,
        false
      );
    }
    if (tile === Terrain.duct) local(c, cx, cy, 1, conduit);
  }
}
