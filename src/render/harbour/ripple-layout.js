import { Terrain } from "#game/terrain";
import { POSTER_SIZE } from "#render/harbour/poster";
import { skiffPosition } from "#render/harbour/sea";

const PHASE_GROUPS = 59;
const POSTER_WATER = { count: 140, top: 274, height: 220, xStride: 113, yStride: 41 };
// Bounds are measured in the poster illustration's own coordinates.
const posterScenery = [
  { left: 340, bottom: 313 },
  { right: 242, top: 334, bottom: 378 },
  { right: 355, top: 370 },
  { left: 269, right: 337, top: 318, bottom: 335 }
];

function overlapsPosterScenery(x, y) {
  return posterScenery.some(
    ({ left = -Infinity, right = Infinity, top = -Infinity, bottom = Infinity }) =>
      x > left && x < right && y > top && y < bottom
  );
}

export function placePosterRipples(addRipple) {
  for (let index = 0; index < POSTER_WATER.count; index++) {
    const x = (index * POSTER_WATER.xStride) % POSTER_SIZE.width;
    const y = POSTER_WATER.top + ((index * POSTER_WATER.yStride) % POSTER_WATER.height);
    if (!overlapsPosterScenery(x, y)) addRipple(x, y, index % PHASE_GROUPS);
  }
}

const GRID = { left: 15, top: 17, spacingX: 47, spacingY: 24, stagger: 24, margin: 12 };
const DRIFT = { xStride: 7, yStride: 13, horizontal: 7, vertical: 3 };
const boatBounds = { halfWidth: 40, halfHeight: 25 };
const compassBounds = { width: 80, height: 78 };
const captionBounds = { width: 150, height: 39 };
const clearWater = { halfWidth: 15, halfHeight: 19 };

function hasRoomOnTile(chart, x, y) {
  const tile = chart.tileAtPoint(x, y);
  if (tile === null) return true;
  if (chart.board.tiles[tile] !== Terrain.water) return false;
  const [centerX, centerY] = chart.point(tile);
  return Math.abs(x - centerX) <= clearWater.halfWidth && Math.abs(y - centerY) <= clearWater.halfHeight;
}

export function placeChartRipples(chart, addRipple) {
  const { width, height } = chart.view;
  const [boatX, boatY] = skiffPosition(chart.stage, width, height);
  for (let y = GRID.top, row = 0; y < height - GRID.margin; y += GRID.spacingY, row++) {
    const start = GRID.left + (row % 2) * GRID.stagger;
    for (let x = start; x < width - GRID.margin; x += GRID.spacingX) {
      const seed = Math.round(x * DRIFT.xStride + y * DRIFT.yStride) % PHASE_GROUPS;
      const rippleX = x + (seed % (2 * DRIFT.horizontal + 1)) - DRIFT.horizontal;
      const rippleY = y + (seed % (2 * DRIFT.vertical + 1)) - DRIFT.vertical;
      const overBoat =
        Math.abs(rippleX - boatX) < boatBounds.halfWidth && Math.abs(rippleY - boatY) < boatBounds.halfHeight;
      const overCompass = rippleX > width - compassBounds.width && rippleY < compassBounds.height;
      const overCaption = rippleX < captionBounds.width && rippleY > height - captionBounds.height;
      if (!overBoat && !overCompass && !overCaption && hasRoomOnTile(chart, rippleX, rippleY))
        addRipple(rippleX, rippleY, seed);
    }
  }
}
