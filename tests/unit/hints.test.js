import test from "node:test";
import assert from "node:assert/strict";
import { availableClues } from "#game/hints";
import { LEVELS } from "#game/levels";
import { Session } from "#game/session";

test("Un indice cesse de marquer une plaque déjà lestée", () => {
  const level = LEVELS[0];
  const game = new Session(level);
  const clues = () => availableClues(level, game.board, game.state);
  assert.deepEqual(clues()[0].points, game.board.plates);
  for (let i = 0; i < 3; i++) game.input("right");
  assert.ok(clues().every((clue) => !clue.points.includes(game.board.plates[0])));
});

test("Dépenser la charge sur le pont du phare donne un indice de récupération", () => {
  const level = LEVELS[1];
  const game = new Session(level);
  for (const action of ["down", "right", "right", "right", "right", "act"]) game.input(action);
  const [hint] = availableClues(level, game.board, game.state);
  assert.match(hint.text, /Annuler/);
  assert.deepEqual(hint.points, [game.board.tiles.indexOf("b")]);
});
