import { CHART_MARGIN, TILE_SIZE } from "#render/board/viewport";
import { LEVELS } from "#game/levels";

const firstMap = LEVELS[0].map;
const defaultRows = firstMap.length,
  defaultColumns = firstMap[0].length;
const span = (tiles) => 2 * CHART_MARGIN + tiles * TILE_SIZE;

export function tileScale(bounds, rows = defaultRows, columns = defaultColumns) {
  return Math.min(bounds.width / span(columns), bounds.height / span(rows));
}

export function tilePosition(bounds, column, row, firstRow = 0, rows = defaultRows, columns = defaultColumns) {
  const scale = tileScale(bounds, rows, columns);
  return {
    x: (bounds.width - span(columns) * scale) / 2 + (CHART_MARGIN + (column + 0.5) * TILE_SIZE) * scale,
    y: (bounds.height - span(rows) * scale) / 2 + (CHART_MARGIN + (row - firstRow + 0.5) * TILE_SIZE) * scale
  };
}
