import assert from "node:assert/strict";
import test from "node:test";
import { Session } from "#game/session";
import { LEVELS } from "#game/levels";
import { allowedKey, defaultKeys } from "#ui/controls/bindings";
import { preferences } from "#app/preferences";

test("Sonde peut prendre le premier quart sans consommer de coup ni créer d’annulation", () => {
  const game = new Session(LEVELS[0], "sonde"),
    initial = structuredClone(game.state);
  assert.equal(initial.active, "sonde");
  assert.equal(game.history.length, 0);
  assert.equal(initial.moves, 0);
  game.input("right");
  game.input("undo");
  assert.deepEqual(game.state, initial);
  game.input("swap");
  game.input("right");
  game.restart();
  assert.deepEqual(game.state, initial);
});

test("Les raccourcis du navigateur et les touches de navigation restent disponibles", () => {
  for (const key of ["Escape", "Tab", "Control", "Meta", "Alt", "Shift", "Enter", "F7", "/"])
    assert.equal(allowedKey(key), false);
  for (const key of ["e", "é", "3", " ", "ArrowUp"]) assert.equal(allowedKey(key), true);
});

test("Les anciennes touches majuscules sont jouables et les doublons restituent les commandes par défaut", (t) => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const saved = { keys: { ...defaultKeys(), right: "D" } };
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => JSON.stringify(saved) }
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  });
  assert.equal(preferences().keys.right, "d");
  saved.keys.left = "d";
  assert.deepEqual(preferences().keys, defaultKeys());
});
