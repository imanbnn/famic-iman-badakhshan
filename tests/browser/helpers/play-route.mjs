import assert from "node:assert/strict";
import { neighbor, otherHero } from "#game/board";
import { nearbyDevice } from "#game/actions";
import { LEVELS } from "#game/levels";
import { Session } from "#game/session";
import { tilePosition } from "./tiles.mjs";
import { checkCursorsOn } from "../controls/pointer.mjs";
import { routes, routeActions } from "../../fixtures/routes.js";

const cues = { relay: "relay", bridge: "bridge", cell: "collect", win: "finish" };

export async function playOnMap(page, stage, touch = false, names = { lest: "Lest", sonde: "Sonde" }) {
  const expected = new Session(LEVELS[stage]),
    canvas = page.locator("#board");
  const bounds = await canvas.boundingBox();
  const en = (await page.locator("html").getAttribute("lang")) === "en";
  const check = checkCursorsOn(canvas),
    visited = new Set();
  for (const key of routes[stage].replaceAll(" ", "")) {
    const { board, state } = expected,
      action = routeActions[key];
    let tile;
    if (action === "swap") tile = state.heroes[otherHero(state.active)];
    else if (action === "act") tile = nearbyDevice(board, state);
    else tile = neighbor(board, state.heroes[state.active], action);
    const position = tilePosition(
      bounds,
      tile % board.width,
      Math.floor(tile / board.width),
      0,
      board.height,
      board.width
    );
    const result = expected.input(action);
    const cue = cues[result.sound] ?? (result.sound === "step" && tile === board.watch ? "hold" : undefined);
    if (!touch && cue && !visited.has(cue)) {
      const status = page.locator("#status"),
        before = await status.innerText();
      await canvas.hover({ position });
      await check(cue);
      assert.equal(await status.innerText(), before);
      visited.add(cue);
    }
    if (touch) await canvas.tap({ position });
    else await canvas.click({ position });
    const active = expected.state.active,
      pos = expected.state.heroes[active];
    const report =
      (en ? "Active robot " : "Robot actif ") +
      names[active] +
      (en ? ", column " : ", colonne ") +
      ((pos % board.width) + 1) +
      (en ? ", row " : ", ligne ") +
      (Math.floor(pos / board.width) + 1) +
      ".";
    assert.ok((await canvas.getAttribute("aria-label")).endsWith(report), LEVELS[stage].name + " · " + action);
    assert.equal(
      await page.locator("#move-count").innerText(),
      en
        ? expected.state.moves === 1
          ? "One step"
          : expected.state.moves + " steps"
        : expected.state.moves + " pas"
    );
  }
  assert.ok(expected.state.won);
  assert.ok(await page.locator("#finish").isVisible());
}
