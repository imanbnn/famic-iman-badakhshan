import test from "node:test";
import assert from "node:assert/strict";
import { MAX_CHARGES } from "#game/rules";
import { HEROES, gateOpen, newState, readBoard } from "#game/board";
import { play } from "#game/actions";
import { LEVELS } from "#game/levels";
import { Session } from "#game/session";

import { routes, routeActions } from "../fixtures/routes.js";

function run(session, route) {
  const pushers = new Set(),
    relayOperators = new Set();
  for (const key of route.replaceAll(" ", "")) {
    const prior = session.state;
    const { state, message, sound } = session.input(routeActions[key]);
    assert.notEqual(state, prior, `Action ${key} at ${prior.heroes[prior.active]}: ${message}`);
    if (state.crates !== prior.crates) pushers.add(prior.active);
    if (sound === "relay") relayOperators.add(prior.active);
  }
  assert.deepEqual([...pushers], ["lest"]);
  assert.deepEqual([...relayOperators], ["sonde"]);
}

for (const [i, level] of LEVELS.entries()) {
  test(`Traversée complète de « ${level.name} » et redémarrage`, () => {
    for (const starter of HEROES) {
      const session = new Session(level, starter);
      const start = structuredClone(session.state);
      assert.ok(session.board.plates.some((tile) => !start.crates.includes(tile)));
      assert.equal(start.relay, false);
      if (starter === "sonde") session.input("swap");
      run(session, routes[i]);
      assert.ok(session.state.won);
      assert.equal(session.state.heroes[session.state.active], session.board.exit);
      assert.ok(gateOpen(session.board, session.state));
      assert.equal(session.state.bridges.length, session.board.bridgeSites.length);
      session.restart();
      assert.deepEqual(session.state, start);
      assert.equal(session.history.length, 0);
    }
  });
}

function fixture(map, reserve = 1) {
  const board = readBoard({ map });
  return { board, s: newState(board, reserve) };
}

test("Les positions survivent au changement de robot", () => {
  const { board, s } = fixture(["L..S"]);
  const moved = play(board, s, "right").state;
  const swapped = play(board, moved, "swap").state;
  assert.deepEqual(swapped.heroes, { lest: 1, sonde: 3 });
  assert.deepEqual(play(board, swapped, "swap").state.heroes, swapped.heroes);
});

test("Sonde passe dans le conduit, Lest seul pousse les caisses", () => {
  const { board, s } = fixture(["LnS", "pc."]);
  assert.equal(play(board, s, "right").state, s);
  const sonde = play(board, s, "swap").state;
  const inDuct = play(board, sonde, "left").state;
  assert.equal(inDuct.heroes.sonde, 1);
  assert.equal(play(board, inDuct, "down").state, inDuct);
});

test("Un choc contre un équipier ou une caisse coincée ne déplace rien", () => {
  const { board, s } = fixture(["LcS"]);
  assert.equal(play(board, s, "right").state, s);
  const other = fixture(["LS"]);
  assert.equal(play(other.board, other.s, "right").state, other.s);
});

test("La réserve est commune, plafonnée, et une pile pleine reste sur place", () => {
  const { board, s } = fixture(["L+bS"], MAX_CHARGES);
  const full = play(board, s, "right").state;
  assert.equal(full.energy, MAX_CHARGES);
  assert.deepEqual(full.cells, [1]);
  const sonde = play(board, full, "swap").state;
  const spent = play(board, sonde, "act").state;
  assert.equal(spent.energy, MAX_CHARGES - 1);
  assert.equal(play(board, spent, "act").state, spent);
  const lest = play(board, spent, "swap").state;
  const away = play(board, lest, "left").state;
  const refill = play(board, away, "right").state;
  assert.equal(refill.energy, MAX_CHARGES);
  assert.deepEqual(refill.cells, []);
});

test("Un pont sans charge reste fermé et un passage réparé reste stable", () => {
  const { board, s } = fixture(["LbS"], 0);
  assert.equal(play(board, s, "act").state, s);
  assert.equal(play(board, s, "right").state, s);
  const repaired = play(board, { ...s, energy: 1 }, "act").state;
  assert.equal(repaired.energy, 0);
  assert.equal(play(board, repaired, "right").state.heroes.lest, 1);
});

test("L’écluse exige le relais et toutes les plaques, même après un déplacement de caisse", () => {
  const { board, s } = fixture(["Lcp.pgvSE"]);
  assert.equal(gateOpen(board, { ...s, relay: true, crates: [2] }), false);
  assert.equal(gateOpen(board, { ...s, crates: [2, 4] }), false);
  const both = { ...s, relay: true, crates: [2, 4] };
  assert.equal(gateOpen(board, both), true);
  assert.equal(play(board, both, "right").state.heroes.lest, 1);
  const pushed = play(board, play(board, both, "right").state, "right").state;
  assert.equal(gateOpen(board, pushed), false);
});

test("Annuler restaure un pont, sa charge et le robot actif", () => {
  const session = new Session({ map: ["LbS"], reserve: 1 });
  const initial = structuredClone(session.state);
  session.input("swap");
  session.input("act");
  session.input("undo");
  session.input("undo");
  assert.deepEqual(session.state, initial);
});
