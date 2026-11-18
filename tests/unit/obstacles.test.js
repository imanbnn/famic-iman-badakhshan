import test from "node:test";
import assert from "node:assert/strict";
import { Session } from "#game/session";

function start(row, reserve = 1) {
  return new Session({ map: [row], reserve });
}

test("La rive empêche de sortir de la carte et les chocs ne remplissent pas l’historique", () => {
  const session = new Session({ map: ["..L", "S.."], reserve: 1 });
  const initial = structuredClone(session.state);
  for (const action of ["right", "up", "act", "undo"]) session.input(action);
  assert.deepEqual(session.state, initial);
  assert.equal(session.history.length, 0);
});

test("Lest ne peut pas brancher un relais même lorsqu’il est à portée", () => {
  const session = start("LvS");
  assert.equal(session.input("act").sound, "bump");
  session.input("swap");
  assert.equal(session.input("act").sound, "relay");
  assert.equal(session.state.relay, true);
  session.input("undo");
  assert.equal(session.state.relay, false);
});

test("Une caisse et une pile reprennent leur place après annulation", () => {
  const session = start("Lcp.S+");
  const initial = structuredClone(session.state);
  session.input("right");
  assert.deepEqual(session.state.crates, [2]);
  session.input("swap");
  session.input("right");
  assert.equal(session.state.energy, 2);
  assert.deepEqual(session.state.cells, []);
  session.input("undo");
  assert.equal(session.state.energy, 1);
  assert.deepEqual(session.state.cells, [5]);
  session.input("undo");
  session.input("undo");
  assert.deepEqual(session.state, initial);
});

test("Le phare attend la dernière condition et accepte aussi Sonde", () => {
  const session = start("Lcp.gEvS");
  session.input("swap");
  session.input("left");
  session.input("left");
  assert.equal(session.state.won, false);
  session.input("act");
  session.input("swap");
  session.input("right");
  session.input("swap");
  session.input("right");
  session.input("left");
  assert.equal(session.state.won, true);
  assert.equal(session.state.active, "sonde");
  const last = structuredClone(session.state);
  for (const action of ["left", "act", "swap"]) session.input(action);
  assert.deepEqual(session.state, last);
});

test("Un pont déployé depuis l’autre rive consomme la charge ramassée par Sonde", () => {
  const session = start("Lb.~.S+", 0);
  assert.equal(session.input("act").sound, "bump");
  session.input("swap");
  assert.equal(session.input("right").sound, "cell");
  session.input("swap");
  assert.equal(session.input("act").sound, "bridge");
  assert.deepEqual(session.state.bridges, [1]);
  assert.equal(session.state.energy, 0);
});
