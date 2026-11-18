import assert from "node:assert/strict";
import test from "node:test";
import { Logbook } from "#game/logbook";

test("Le carnet conserve le trajet le plus court et reprend à l’escale suivante", () => {
  const values = new Map();
  const store = { getItem: (key) => values.get(key), setItem: (key, v) => values.set(key, v) };
  const book = new Logbook(store);
  book.record(0, 23);
  book.record(0, 19);
  book.record(0, 25);
  assert.deepEqual(new Logbook(store).best, [19, null, null]);
  assert.equal(new Logbook(store).next, 1);
  book.record(1, 26);
  book.record(2, 34);
  assert.equal(new Logbook(store).next, 0);
});

test("Le carnet reste utilisable si la sauvegarde est illisible ou indisponible", () => {
  const book = new Logbook({
    getItem: () => "?",
    setItem: () => {
      throw Error();
    }
  });
  assert.deepEqual(book.best, [null, null, null]);
  book.record(0, 18);
  assert.equal(book.next, 1);
});

test("Recommencer une traversée conserve les anciens records et permet de rallumer chaque feu", () => {
  const values = new Map([["contreflot.traversees.v1", "[20,28,null]"]]);
  const store = { getItem: (key) => values.get(key), setItem: (key, v) => values.set(key, v) };
  const imported = new Logbook(store);
  assert.equal(imported.next, 2);
  imported.restartVoyage();
  const fresh = new Logbook(store);
  assert.deepEqual(fresh.lights, [false, false, false]);
  assert.deepEqual(fresh.best, [20, 28, null]);
  assert.equal(fresh.next, 0);
  fresh.record(0, 24);
  assert.equal(new Logbook(store).next, 1);
  assert.deepEqual(new Logbook(store).best, [20, 28, null]);
  fresh.record(1, 26);
  fresh.record(2, 33);
  assert.deepEqual(new Logbook(store).lights, [true, true, true]);
  assert.deepEqual(new Logbook(store).best, [20, 26, 33]);
});
