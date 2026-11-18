import assert from "node:assert/strict";
import test from "node:test";
import { Session } from "#game/session";
import { pointAt } from "#game/pointer";
import { cursorIcon } from "#ui/guide/cursors";
import { t } from "#i18n/translate";

test("Sur la carte, un clic distingue déplacement, relève, pont et inspection", () => {
  const game = new Session({ map: ["Lb.S", "...."], reserve: 1 });
  const pick = (p) => pointAt(game.board, game.state, p);
  assert.equal(pick(4).action, "down");
  assert.equal(pick(3).action, "swap");
  assert.equal(pick(1).action, "act");
  assert.equal(pick(7).kind, "quay");
  game.input(pick(1).action);
  assert.equal(pick(1).action, "right");
});

test("La prévision d’une poussée indique sa destination sans déplacer la caisse", () => {
  const game = new Session({ map: ["Lcp~", "S..."], reserve: 0 });
  const before = structuredClone(game.state);
  const choice = pointAt(game.board, game.state, 1);
  assert.equal(choice.landing, 2);
  assert.equal(cursorIcon(choice), "push-right");
  assert.deepEqual(game.state, before);
  game.input(choice.action);
  assert.deepEqual(game.state.crates, [choice.landing]);
  assert.equal(pointAt(game.board, game.state, 2).kind, "blocked");
  assert.equal(game.history.length, 1);
});

test("Le clic sur un obstacle explique le blocage et l’eau lointaine reste inactive", () => {
  const game = new Session({ map: ["L~.b", "S~.v"], reserve: 0 });
  const pick = (tile) => pointAt(game.board, game.state, tile);
  assert.equal(pick(1).kind, "blocked");
  assert.match(game.input(pick(1).action).message, /Bord du quai/);
  assert.equal(pick(5).kind, "water");
  assert.equal(pick(6).kind, "quay");
  assert.equal(pick(7).kind, "inspect");
  game.input(pick(4).action);
  assert.equal(game.state.active, "sonde");
});

test("L’aperçu d’un pont suit la réserve commune", () => {
  const map = ["LbS", "..."];
  for (const reserve of [0, 1]) {
    const game = new Session({ map, reserve });
    const choice = pointAt(game.board, game.state, 1);
    assert.equal(choice.kind, reserve ? "bridge" : "blocked");
    const result = game.input(choice.action);
    if (!reserve) assert.match(result.message, /Réserve vide/);
    else assert.equal(pointAt(game.board, game.state, 1).kind, "move");
  }
});

test("Le curseur suit l’action possible pour le robot et la réserve du moment", () => {
  const crate = new Session({ map: ["L.c.S", "....."], reserve: 0 });
  const pick = () => pointAt(crate.board, crate.state, 2);
  assert.equal(pick().kind, "inspect");
  crate.input("right");
  assert.equal(pick().kind, "push");
  crate.input("swap");
  crate.input("left");
  assert.equal(pick().kind, "blocked");
  assert.match(crate.input(pick().action).message, /trop lourde/);
  crate.input("swap");
  assert.equal(pick().kind, "blocked");
  assert.match(crate.input(pick().action).message, /bloquée/);

  for (const [reserve, kind] of [
    [2, "collect"],
    [3, "move"]
  ]) {
    const game = new Session({ map: ["L+.S"], reserve });
    const preview = pointAt(game.board, game.state, 1);
    assert.equal(preview.kind, kind);
    game.input(preview.action);
    assert.equal(game.state.cells.includes(1), kind === "move");
  }
});

test("Les appareils, la relève et l’arrivée annoncent le résultat du clic", () => {
  const game = new Session({ map: ["LvSwE", "....."], reserve: 0 });
  const pick = (tile) => pointAt(game.board, game.state, tile);
  assert.equal(pick(1).kind, "blocked");
  game.input(pick(2).action);
  assert.equal(pick(1).kind, "relay");
  game.input(pick(1).action);
  assert.equal(pick(1).kind, "move");
  assert.equal(pick(3).kind, "hold");
  game.input(pick(3).action);
  // Le phare reste un déplacement ordinaire si le seul robot sur la pédale la quitte.
  assert.equal(pick(4).kind, "move");
  const free = new Session({ map: ["SvEL"], reserve: 0 }, "sonde");
  free.input(pointAt(free.board, free.state, 1).action);
  free.input("right");
  const end = pointAt(free.board, free.state, 2);
  assert.equal(end.kind, "finish");
  free.input(end.action);
  assert.equal(free.state.won, true);
});

test("La loupe permet d’inspecter une caisse jusqu’à ce que le robot puisse la pousser", () => {
  const game = new Session({ map: ["L..c..~", "...S..."], reserve: 0 });
  const pick = () => pointAt(game.board, game.state, 3);
  assert.equal(pick().kind, "inspect");
  assert.match(t(pick().text), /Placez Lest.*Cliquez ensuite/);
  game.input("right");
  game.input("right");
  assert.equal(cursorIcon(pick()), "push-right");
  game.input("swap");
  assert.equal(pick().kind, "blocked");
  assert.equal(game.history.length, 3);
});

test("L’inspection de l’écluse et du phare suit l’état du relais", () => {
  const game = new Session({ map: ["L+.SvbEg"], reserve: 3 });
  const inspect = (tile) => pointAt(game.board, game.state, tile).text;
  assert.match(inspect(7), /ouvrir l’écluse/);
  game.input("swap");
  game.input("act");
  assert.match(inspect(7), /peuvent franchir/);
  assert.match(inspect(6), /terminer l’escale/);
});

test("Une caisse sur plaque conserve sa destination de poussée et son renseignement à distance", () => {
  for (const next of [".", "p"]) {
    const game = new Session({ map: ["Lcp" + next + ".S"], reserve: 0 });
    game.input("right");
    const push = pointAt(game.board, game.state, 2);
    assert.equal(push.landing, 3);
    assert.equal(cursorIcon(push), "push-right");
    game.input("swap");
    const inspect = pointAt(game.board, game.state, 2);
    assert.equal(inspect.kind, "inspect");
    assert.match(inspect.text, /Laissez-la ici/);
  }
});
