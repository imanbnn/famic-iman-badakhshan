import assert from "node:assert/strict";
import { tilePosition } from "../helpers/tiles.mjs";

export function checkCursorsOn(board) {
  const images = new Map();
  const fallback = { water: "crosshair", quay: "default", inspect: "zoom-in", blocked: "not-allowed" };
  return async function check(kind, icon = kind) {
    const actual = await board.evaluate((n) => {
      const surface = n.closest(".map-surface"),
        marker = document.getElementById("target-cell");
      return {
        intent: n.dataset.intent,
        css: getComputedStyle(n).cursor,
        description: n.getAttribute("aria-describedby"),
        tooltip: !!surface.querySelector('[role="tooltip"],[title]'),
        text: surface.innerText.trim(),
        mark: marker.hidden ? "" : marker.textContent
      };
    });
    assert.equal(actual.intent, kind);
    assert.ok(actual.css.endsWith(", " + (fallback[kind] ?? "pointer")), icon);
    const image = actual.css.match(/data:image\/png;base64,([a-z0-9+/=]+)/i)?.[1];
    assert.ok(image, "Pictogramme absent pour " + icon);
    assert.equal(actual.tooltip, false, "Une infobulle est présente sur la carte");
    assert.equal(actual.description, "status");
    assert.equal(actual.text, actual.mark, "Le survol affiche du texte sur la carte");
    assert.ok([...actual.mark].length <= 1, "Le repère de case doit rester un pictogramme");
    if (images.has(icon)) {
      assert.equal(image, images.get(icon), icon);
    } else {
      for (const [other, bitmap] of images)
        assert.notEqual(image, bitmap, icon + " utilise le même dessin que " + other);
      images.set(icon, image);
    }
  };
}

export async function checkPointer(page) {
  const board = page.locator("#board"),
    target = page.locator("#target-cell"),
    landing = page.locator("#push-cell");
  const status = page.locator("#status");
  const check = checkCursorsOn(board);
  const commands = await page.locator(".commands").boundingBox();
  assert.ok(
    commands.y + commands.height <= page.viewportSize().height,
    "Les commandes doivent tenir dans la fenêtre de jeu"
  );
  const bounds = await board.boundingBox();
  const position = (x, y) => tilePosition(bounds, x, y);
  const hover = async (x, y) => {
    const before = await status.innerText();
    await board.hover({ position: position(x, y) });
    assert.equal(await status.innerText(), before, "Le survol a modifié le message sous la carte");
  };
  const click = (x, y) => board.click({ position: position(x, y) });
  const audio = page.locator("#sound"),
    title = page.locator("#title");
  await audio.click();
  assert.equal(await audio.getAttribute("aria-pressed"), "false");
  assert.equal(await page.locator("#sound-tip").innerText(), "Activer le son");
  await audio.click();
  await title.dblclick();
  assert.equal(await page.evaluate(() => getSelection().toString()), "");
  assert.equal(await title.evaluate((node) => getComputedStyle(node).caretColor), "rgba(0, 0, 0, 0)");
  await page.locator("#resume-play").click();
  const scenery = page.locator("#chart-backdrop"),
    fixtures = page.locator("#chart-fixtures");
  const pixels = (canvas) => canvas.toDataURL();
  const initialScenery = await scenery.evaluate(pixels),
    initialFixtures = await fixtures.evaluate(pixels);
  await hover(14, 8);
  await check("water");
  assert.ok(await target.isHidden());
  await hover(12, 5);
  await check("quay");
  assert.ok(await target.isHidden());
  for (const [x, y, direction] of [
    [2, 4, "up"],
    [3, 5, "right"],
    [2, 6, "down"],
    [1, 5, "left"]
  ]) {
    await hover(x, y);
    await check("move", "move-" + direction);
  }
  await title.hover();
  assert.ok(await target.isHidden());
  assert.equal(await board.getAttribute("aria-describedby"), "status");
  assert.equal(await board.getAttribute("data-intent"), "idle");
  assert.equal(await title.evaluate((n) => getComputedStyle(n).cursor), "default");
  assert.equal(await audio.evaluate((n) => getComputedStyle(n).cursor), "pointer");
  assert.equal(await page.locator("#move-count").innerText(), "0 pas");
  for (const [x, y] of [
    [2, 5],
    [4, 5],
    [6, 5],
    [3, 3],
    [8, 5],
    [12, 4],
    [6, 2],
    [10, 5],
    [8, 1]
  ]) {
    await hover(x, y);
    await check("inspect");
  }
  assert.equal(await target.innerText(), "i");
  await click(8, 1);
  assert.match(await status.innerText(), /Sonde peut brancher/);
  await hover(5, 3);
  await check("swap");
  assert.equal(await target.innerText(), "⇄");

  const pushes = [
    ["right", ["ArrowRight"], 5, 5, "→"],
    ["up", ["ArrowDown", "ArrowRight", "ArrowRight"], 4, 4, "↑"],
    ["down", ["ArrowUp", "ArrowRight", "ArrowRight"], 4, 6, "↓"],
    ["left", ["ArrowUp", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowDown"], 3, 5, "←"]
  ];
  for (const [direction, steps, x, y, arrow] of pushes) {
    await board.press("r");
    for (const step of steps) await board.press(step);
    await hover(4, 4);
    await hover(4, 5);
    await check("push", "push-" + direction);
    assert.equal(await target.innerText(), arrow);
    const ghost = await landing.boundingBox(),
      to = position(x, y);
    assert.ok(
      ghost &&
        Math.abs(ghost.x + ghost.width / 2 - bounds.x - to.x) < 2 &&
        Math.abs(ghost.y + ghost.height / 2 - bounds.y - to.y) < 2
    );
    await click(4, 5);
    await check("inspect");
    assert.equal(await page.locator("#move-count").innerText(), steps.length + 1 + " pas");
    if (direction === "right") {
      await hover(5, 5);
      await check("push", "push-right");
      assert.ok(await landing.isVisible());
      assert.equal(await fixtures.evaluate(pixels), initialFixtures);
      await click(5, 5);
      assert.notEqual(await fixtures.evaluate(pixels), initialFixtures, "La plaque lestée doit changer d’aspect");
      assert.equal(
        await scenery.evaluate(pixels),
        initialScenery,
        "Les quais restent identiques pendant une poussée"
      );
      await board.press("u");
      assert.equal(await fixtures.evaluate(pixels), initialFixtures);
      await hover(4, 5);
    }
    await board.press("u");
    await check("push", "push-" + direction);
    assert.ok(await target.isHidden());
    assert.ok(await landing.isHidden());
  }

  await board.press("r");
  for (const step of ["ArrowDown", "ArrowRight", "ArrowRight"]) await board.press(step);
  await click(4, 5);
  await click(4, 4);
  await hover(4, 3);
  await check("blocked");
  assert.equal(await target.innerText(), "×");
  assert.ok(await landing.isHidden());
  await click(4, 3);
  assert.match(await page.locator("#status").innerText(), /caisse est bloquée/);

  await board.press("r");
  await click(5, 3);
  await board.press("ArrowDown");
  await board.press("ArrowLeft");
  await hover(4, 5);
  await check("blocked");
  assert.ok(await landing.isHidden());
  await click(4, 5);
  assert.match(await status.innerText(), /trop lourde pour Sonde/);
  assert.equal(await page.locator("#move-count").innerText(), "2 pas");
  await board.press("r");
  await board.press("ArrowUp");
  await board.press("ArrowUp");
  await hover(3, 3);
  await check("collect");
  await click(3, 3);
  await check("inspect");
  assert.match(await status.innerText(), /charge ajoutée/);

  await board.press("r");
  assert.ok(await page.locator('[data-action="act"]').isDisabled());
  await click(1, 5);
  await hover(0, 5);
  await check("blocked");
  await click(0, 5);
  assert.equal(await page.locator("#signal").getAttribute("data-tone"), "blocked");
  assert.match(await page.locator("#status").innerText(), /Bord du quai/);
  assert.equal(await page.locator("#move-count").innerText(), "1 pas");
  await title.hover();
  assert.ok(await target.isHidden());
  await board.press("r");
  assert.equal(await page.locator("#goals button,#goals input").count(), 0);
  await page.locator("#goals li").first().click();
  assert.equal(await page.locator("#move-count").innerText(), "0 pas");
  assert.equal(await board.evaluate((n) => getComputedStyle(n).outlineStyle), "none");
  await page.getByRole("button", { name: "Demander un indice" }).click();
  assert.equal(await page.locator("#hint").getAttribute("aria-expanded"), "true");
  await board.press("Tab");
  assert.ok(await page.evaluate(() => document.activeElement.matches("button:focus-visible")));
  await page.getByRole("button", { name: "Guide", exact: true }).click();
  assert.ok(await page.locator("#map-hint").isHidden());
  await page.keyboard.press("Escape");
  await board.press("r");
}
