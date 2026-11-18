import assert from "node:assert/strict";
import { playOnMap } from "./helpers/play-route.mjs";
import { offlineContext } from "./helpers/offline.mjs";
import { tilePosition } from "./helpers/tiles.mjs";
import { checkHintAnchor } from "./controls/focus.mjs";

export async function checkTouch(browser, url) {
  const context = await offlineContext(browser, {
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    reducedMotion: "reduce"
  });
  try {
    const page = await context.newPage();
    const external = [];
    page.on("request", (request) => {
      if (/^https?:/.test(request.url())) external.push(request.url());
    });
    await page.goto(url);
    const sound = page.locator("#sound");
    await sound.tap();
    assert.equal(await sound.getAttribute("aria-pressed"), "false");
    assert.ok(await page.locator("#sound-tip").isHidden());
    await sound.tap();
    await page.getByRole("radio", { name: "English", exact: true }).tap();
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    await page.getByRole("radio", { name: "Français", exact: true }).tap();
    await page.locator("#launch-fleet").tap();
    await page.locator("#tab-sonde").tap();
    await page.getByRole("radio", { name: "Prisme", exact: true }).tap();
    await page.locator("#fleet [data-close]").tap();
    await page.setViewportSize({ width: 844, height: 390 });
    await page.locator("#start-game").tap();
    const board = page.locator("#board");
    const landscape = await board.boundingBox(),
      commands = await page.locator(".commands").boundingBox();
    assert.ok(
      landscape.height >= 150 && landscape.y >= 0 && commands.y + commands.height <= 390,
      "Carte et commandes en paysage : " + JSON.stringify({ landscape, commands })
    );
    await board.tap({ position: tilePosition(landscape, 3, 5, 1, 6) });
    assert.match(await board.getAttribute("aria-label"), /colonne 4, ligne 6/);
    await page.locator('.commands [data-action="undo"]').tap();
    await page.setViewportSize({ width: 390, height: 844 });
    const rect = await board.boundingBox();
    const tap = (x, y) => board.tap({ position: tilePosition(rect, x, y) });
    await tap(3, 5);
    assert.match(await board.getAttribute("aria-label"), /colonne 4, ligne 6/);
    assert.ok(await page.locator("#target-cell").isHidden());
    assert.ok(await page.locator("#push-cell").isHidden());
    await tap(5, 3);
    assert.match(await board.getAttribute("aria-label"), /actif Sonde/);
    await page.getByRole("button", { name: "Demander un indice" }).tap();
    assert.equal(await page.locator("#hint-counter").innerText(), "Indice 1/4");
    await checkHintAnchor(page, 6, 5);
    await page.setViewportSize({ width: 320, height: 640 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const brief = await page.locator("#brief").boundingBox();
    const stages = await page.locator("#progress").boundingBox();
    assert.ok(brief.y + brief.height <= stages.y, "Le texte et les escales occupent deux rangées distinctes");
    const arrows = page.locator(".arrows button");
    for (const arrow of await arrows.all()) {
      const bounds = await arrow.boundingBox();
      assert.ok(bounds.width >= 44 && bounds.height >= 44);
    }
    const position = async (dir) => page.locator('.arrows [data-action="' + dir + '"]').boundingBox();
    const up = await position("up"),
      down = await position("down");
    assert.ok(up.y < down.y && Math.abs(up.x - down.x) < 1);
    await page.getByRole("button", { name: "Demander un indice" }).tap();
    assert.match(await page.locator("#hint-text").innerText(), /Sonde/);
    const close = page.getByRole("button", { name: "Fermer l’indice", exact: true });
    const closeBox = await close.boundingBox(),
      soundBox = await sound.boundingBox(),
      panel = await page.locator("#map-hint").boundingBox();
    assert.ok(closeBox.width >= 44 && closeBox.height >= 44 && soundBox.width >= 44 && soundBox.height >= 44);
    assert.ok(closeBox.x >= panel.x && closeBox.x + closeBox.width <= panel.x + panel.width);
    await close.tap();
    assert.ok(await page.locator("#map-hint").isHidden());
    assert.ok(await board.evaluate((node) => node === document.activeElement));
    const visibleBoard = await board.boundingBox();
    assert.ok(visibleBoard.y >= 0 && visibleBoard.y + visibleBoard.height <= 640);
    const guideButton = page.locator("#board-cursors");
    const guideBox = await guideButton.boundingBox();
    assert.ok(guideBox.height >= 44, "Zone tactile du bouton Curseurs " + JSON.stringify(guideBox));
    const symbolsButton = page.locator("#board-symbols"),
      symbolsBox = await symbolsButton.boundingBox();
    assert.ok(symbolsBox.height >= 44 && Math.abs(symbolsBox.y - guideBox.y) < 1);
    assert.ok(symbolsBox.x + symbolsBox.width <= guideBox.x && guideBox.x + guideBox.width <= 320);
    await symbolsButton.tap();
    await page.locator("#symbol-guide [data-close]").tap();
    assert.ok(await board.evaluate((node) => node === document.activeElement));
    await guideButton.tap();
    const guide = page.locator("#cursor-guide"),
      closeGuide = guide.locator("[data-close]");
    const closeGuideBox = await closeGuide.boundingBox();
    assert.ok(closeGuideBox.height >= 44, "Zone tactile de fermeture " + JSON.stringify(closeGuideBox));
    assert.equal(await guide.locator("li").count(), 12);
    await guide.locator("li").last().scrollIntoViewIfNeeded();
    assert.ok(await guide.locator(".dialog-scroll").evaluate((n) => n.scrollTop > 0));
    assert.ok(
      await closeGuide.evaluate((n) => {
        const b = n.getBoundingClientRect();
        return n.contains(document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2));
      })
    );
    await closeGuide.tap();
    assert.ok(await board.evaluate((n) => n === document.activeElement));
    assert.ok(await page.locator("#target-cell").isHidden());
    await page.getByRole("button", { name: "Guide", exact: true }).tap();
    assert.ok(await page.getByRole("dialog", { name: "Guide de bord" }).isVisible());
    await page.getByRole("button", { name: "Fermer le guide" }).tap();
    await page.locator(".reserve h2").tap();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.locator("#pilot-pause.off-chart").waitFor({ state: "visible" });
    const paused = await page.locator("#resume-play").boundingBox();
    assert.ok(paused.y >= 0 && paused.y + paused.height <= 640, "La reprise reste accessible sous la carte");
    await page.locator("#resume-play").tap();
    const resumed = await board.boundingBox();
    assert.ok(resumed.y >= 0 && resumed.y + resumed.height <= 640);
    assert.equal(await page.locator("body").getAttribute("data-pilot"), "playing");
    await page.locator('.commands [data-action="restart"]').tap();
    await playOnMap(page, 0, true);
    await page.locator("#next").press("r");
    assert.ok(await board.evaluate((node) => document.activeElement === node));
    await page.keyboard.press("ArrowRight");
    assert.match(await board.getAttribute("aria-label"), /colonne 4, ligne 6/);
    assert.deepEqual(external, []);
  } finally {
    await context.close();
  }
}
