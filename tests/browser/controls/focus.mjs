import assert from "node:assert/strict";
import { offlineContext } from "../helpers/offline.mjs";
import { routes, routeKeys } from "../../fixtures/routes.js";
import { tilePosition, tileScale } from "../helpers/tiles.mjs";
import { TILE_SIZE } from "#render/board/viewport";

export async function checkHintAnchor(page, column, row) {
  const board = await page.locator("#board").boundingBox(),
    panel = page.locator("#map-hint");
  const cell = tilePosition(board, column, row),
    x = board.x + cell.x,
    y = board.y + cell.y;
  const half = (tileScale(board) * TILE_SIZE) / 2;
  const box = await panel.boundingBox(),
    side = await panel.getAttribute("data-side");
  assert.ok(box, "L’indice doit être visible sur la carte");
  const gap = {
    right: box.x - x - half,
    left: x - half - box.x - box.width,
    above: y - half - box.y - box.height,
    below: box.y - y - half
  };
  assert.ok(
    gap[side] >= 5 && gap[side] <= 13,
    "Bulle à côté de l’objet " + JSON.stringify({ column, row, side, gap, box, board })
  );
  assert.ok(box.x >= 0 && box.x + box.width <= page.viewportSize().width + 1);
}

export async function checkPiloting(browser, url) {
  const context = await offlineContext(browser, {
    viewport: { width: 1280, height: 800 },
    colorScheme: "light",
    reducedMotion: "no-preference"
  });
  try {
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (r) => {
      if (/^https?:/.test(r.url())) errors.push(r.url());
    });
    await page.addInitScript(() => {
      window.musicTransfers = 0;
      if (typeof Worker === "function") {
        const NativeWorker = Worker;
        window.Worker = class extends NativeWorker {
          constructor(url, options) {
            super(url, options);
            if (options?.name === "contreflot-musique")
              this.addEventListener("message", ({ data }) => {
                if (data.left instanceof Float32Array && data.right.length === data.left.length)
                  window.musicTransfers++;
              });
          }
        };
      }
      const proto = AudioBufferSourceNode.prototype,
        start = proto.start,
        stop = proto.stop;
      window.audioEvents = [];
      proto.start = function (...args) {
        window.audioEvents.push({
          kind: this.loop ? "music" : "effect",
          duration: this.buffer.duration,
          channels: this.buffer.numberOfChannels
        });
        return start.apply(this, args);
      };
      proto.stop = function (...args) {
        if (this.loop) window.audioEvents.push({ kind: "pause" });
        return stop.apply(this, args);
      };
    });
    await page.goto(url);
    await page.bringToFront();
    const id = (name) => page.locator("#" + name),
      board = id("board"),
      mode = () => page.locator("body").getAttribute("data-pilot");
    const resume = () => id("resume-play").click();
    assert.equal(await page.locator("html").getAttribute("data-theme"), "midnight");
    assert.equal(await page.locator("html").evaluate((n) => getComputedStyle(n).colorScheme), "dark");
    assert.equal(
      await id("start-game").evaluate((n) => getComputedStyle(n).backgroundColor),
      "rgb(255, 172, 108)"
    );
    await id("home").hover();
    await page.waitForFunction(() => {
      const transform = getComputedStyle(document.getElementById("home")).transform;
      return transform !== "none" && new DOMMatrixReadOnly(transform).a > 1.04;
    });
    assert.ok(await id("home-tip").isVisible());
    assert.match(await id("home-tip").innerText(), /départ/);
    await id("home").click();
    assert.ok(await id("return-home").isHidden());
    assert.ok(await id("setup-title").evaluate((n) => n === document.activeElement));
    assert.equal(await id("launch-music").getAttribute("aria-pressed"), "false");
    await id("launch-music").click();
    assert.deepEqual(await page.evaluate(() => window.audioEvents), []);
    await id("start-game").click();
    await page.mouse.move(600, 370);
    assert.equal(await mode(), "playing");
    await page.waitForFunction(() => getComputedStyle(document.querySelector(".deck>aside")).opacity < 0.9);
    await page.waitForFunction(() =>
      window.audioEvents.some((e) => e.kind === "music" && e.channels === 2 && e.duration > 25)
    );
    if (browser.browserType().name() === "chromium")
      assert.equal(await page.evaluate(() => window.musicTransfers), 1);
    await page.keyboard.press("ArrowRight");
    assert.equal(await id("move-count").innerText(), "1 pas");
    assert.ok(await page.evaluate(() => window.audioEvents.some((e) => e.kind === "effect")));
    await id("settings-open").click();
    assert.equal(await mode(), "paused");
    assert.equal(await id("music").getAttribute("aria-pressed"), "true");
    assert.ok(await page.evaluate(() => window.audioEvents.some((e) => e.kind === "pause")));
    await id("music").click();
    await id("settings").locator('[data-theme-choice="ember"]').click();
    await id("settings").locator("[data-close]").click();
    await id("resume-play").waitFor({ state: "visible" });
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("r");
    assert.equal(await id("move-count").innerText(), "1 pas");
    await resume();
    assert.ok(await board.evaluate((n) => n === document.activeElement));
    await page.keyboard.press("ArrowRight");
    assert.equal(await id("move-count").innerText(), "2 pas");
    assert.equal(await page.evaluate(() => window.audioEvents.filter((e) => e.kind === "music").length), 1);
    await board.press("r");
    await id("hint").click();
    assert.equal(await id("hint-counter").innerText(), "Indice 1/4");
    await checkHintAnchor(page, 6, 5);
    await id("more-hints").click();
    assert.equal(await id("hint-object").innerText(), "Relais");
    await checkHintAnchor(page, 8, 1);
    await page.keyboard.press("Escape");
    assert.equal(await id("hint").getAttribute("aria-expanded"), "false");
    assert.ok(await board.evaluate((n) => n === document.activeElement));
    await id("hint").press("Enter");
    assert.ok(await id("more-hints").evaluate((n) => n === document.activeElement));
    await id("close-hint").click();
    assert.ok(await id("map-hint").isHidden());

    const route = routes[0].replaceAll(" ", "");
    for (const key of route.slice(0, -1)) await board.press(routeKeys[key]);
    await id("hint").press("Enter");
    assert.ok(await id("more-hints").isHidden());
    assert.ok(await id("close-hint").evaluate((n) => n === document.activeElement));
    await id("close-hint").press("Enter");
    assert.ok(await board.evaluate((n) => n === document.activeElement));
    await board.press(routeKeys[route.at(-1)]);
    await id("next").click();
    assert.equal(await id("title").innerText(), "Les deux passes");
    await board.press("ArrowRight");
    await id("language").getByRole("radio", { name: "English" }).check();
    assert.equal(await mode(), "paused");
    await id("home").hover();
    assert.match(await id("home-tip").innerText(), /start a new voyage/);
    await id("home").click();
    assert.equal(await page.getByRole("alertdialog").getByRole("heading").innerText(), "Start a new voyage?");
    assert.ok(await id("keep-playing").evaluate((n) => n === document.activeElement));
    await page.keyboard.press("Escape");
    assert.ok(await id("return-home").isHidden());
    assert.equal(await id("move-count").innerText(), "One step");
    assert.equal(await page.locator("#progress .done").count(), 1);
    await id("home").click();
    await id("keep-playing").click();
    assert.equal(await id("title").innerText(), "The twin channels");
    await id("home").click();
    await id("confirm-home").click();
    assert.ok(await id("launch").isVisible());
    assert.equal(await page.locator("html").getAttribute("data-theme"), "ember");
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    await id("start-game").click();
    assert.equal(await id("title").innerText(), "The dry dock");
    assert.equal(await id("move-count").innerText(), "0 steps");
    assert.equal(await page.locator("#progress .done").count(), 0);
    assert.ok(await page.locator('.commands [data-action="undo"]').isDisabled());
    await id("journal-open").click();
    assert.equal(
      await id("journal")
        .getByText(/Best route/)
        .count(),
      1
    );
    assert.equal(await id("journal").getByText("Resume", { exact: true }).count(), 0);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}
