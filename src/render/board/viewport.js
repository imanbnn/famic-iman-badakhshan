export const TILE_SIZE = 52;
export const CHART_MARGIN = 10;

const LANDSCAPE_HEIGHT = 245;
const LANDSCAPE_ASPECT = 2.4;
const MAX_PIXEL_RATIO = 2;

export function chartViewport(board, docks, rect, pixelRatio) {
  const worldWidth = board.width * TILE_SIZE + 2 * CHART_MARGIN;
  const compact = rect.height < LANDSCAPE_HEIGHT && rect.width / rect.height > LANDSCAPE_ASPECT;
  const rows = compact ? docks.count : board.height;
  const worldHeight = rows * TILE_SIZE + 2 * CHART_MARGIN;
  const scale = Math.min(rect.width / worldWidth, rect.height / worldHeight);
  const width = rect.width / scale,
    height = rect.height / scale;
  const density = Math.min(pixelRatio, MAX_PIXEL_RATIO);
  return {
    width,
    height,
    originX: (width - worldWidth) / 2,
    originY: (height - worldHeight) / 2 - (compact ? docks.first * TILE_SIZE : 0),
    pixelWidth: Math.max(1, Math.round(rect.width * density)),
    pixelHeight: Math.max(1, Math.round(rect.height * density))
  };
}
