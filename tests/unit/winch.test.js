import test from "node:test";
import assert from "node:assert/strict";
import { gateOpen } from "#game/board";
import { Session } from "#game/session";

test("Le treuil tient pendant la relève et retombe quand le robot quitte la pédale", () => {
  const game = new Session({ map: ["LgE~vSw"], reserve: 0 });
  const open = () => gateOpen(game.board, game.state);
  game.input("swap");
  game.input("act");
  assert.equal(open(), false);
  game.input("right");
  assert.equal(open(), true);
  game.input("swap");
  game.input("right");
  assert.equal(game.state.heroes.lest, 1);
  game.input("swap");
  game.input("left");
  assert.equal(open(), false);
  game.input("undo");
  assert.equal(open(), true);
  game.input("swap");
  game.input("right");
  assert.equal(game.state.won, true);
  game.restart();
  assert.equal(open(), false);
});

test("Une caisse sur la pédale ne remplace pas un équipier", () => {
  const game = new Session({ map: ["Lcw~Sv"], reserve: 0 });
  game.input("swap");
  game.input("act");
  game.input("swap");
  assert.equal(game.input("right").sound, "bump");
  assert.equal(gateOpen(game.board, game.state), false);
});
