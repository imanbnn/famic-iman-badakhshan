import assert from "node:assert/strict";
import test from "node:test";
import { chartViewport } from "#render/board/viewport";

const board = { width: 15, height: 9 };
const docks = { first: 1, count: 6 };

test("La densité de l’écran change la résolution du dessin et conserve les coordonnées du jeu", () => {
  const rect = { width: 1000, height: 488 };
  const normal = chartViewport(board, docks, rect, 1);
  const retina = chartViewport(board, docks, rect, 2);
  assert.deepEqual([normal.pixelWidth, normal.pixelHeight], [1000, 488]);
  assert.deepEqual([retina.pixelWidth, retina.pixelHeight], [2000, 976]);
  assert.deepEqual(chartViewport(board, docks, rect, 3), retina);
  assert.equal(normal.originX, 100);
  assert.equal(normal.originX, retina.originX);
  assert.equal(normal.originY, retina.originY);
});

test("En paysage compact, la première rangée de quai reste dans le cadre", () => {
  const view = chartViewport(board, docks, { width: 800, height: 200 }, 1);
  assert.ok(Math.abs(view.height - 332) < 1e-6);
  assert.ok(Math.abs(view.originY + 52) < 1e-6);
  assert.ok(view.originX >= 0);
});
