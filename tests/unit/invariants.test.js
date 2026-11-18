import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { MAX_CHARGES } from "#game/rules";
import { gateOpen } from "#game/board";
import { LEVELS } from "#game/levels";
import { Session } from "#game/session";

const actions = ["up", "right", "down", "left", "swap", "act", "undo"];
const trips = 80,
  turns = 500;

for (const level of LEVELS) {
  test("Les objets et les charges se conservent dans " + level.name, () => {
    const game = new Session(level);
    const initial = structuredClone(game.state);
    for (let trip = 0; trip < trips; trip++) {
      game.restart();
      assert.deepEqual(game.state, initial);
      const seed = level.name + "/" + trip;
      const choices = createHash("shake256", { outputLength: turns }).update(seed).digest();
      for (const choice of choices) {
        const action = actions[choice % actions.length];
        const previous = game.state,
          snapshot = JSON.stringify(previous);
        const { state } = game.input(action);
        assert.equal(JSON.stringify(previous), snapshot);
        const occupied = [...Object.values(state.heroes), ...state.crates];
        assert.equal(new Set(occupied).size, occupied.length);
        assert.ok(occupied.every((p) => p >= 0 && p < game.board.tiles.length && game.board.tiles[p] !== "~"));
        assert.equal(state.crates.length, initial.crates.length);
        assert.equal(
          state.energy,
          level.reserve + initial.cells.length - state.cells.length - state.bridges.length
        );
        assert.ok(state.energy >= 0 && state.energy <= MAX_CHARGES);
        assert.equal(new Set(state.bridges).size, state.bridges.length);
        assert.ok(state.bridges.every((p) => game.board.tiles[p] === "b"));
        if (state.won) {
          assert.ok(gateOpen(game.board, state));
          assert.equal(game.board.tiles[state.heroes[state.active]], "E");
        }
      }
    }
  });
}
