import assert from "node:assert/strict";
import { offlineContext } from "../helpers/offline.mjs";
import { playOnMap } from "../helpers/play-route.mjs";
import { tilePosition } from "../helpers/tiles.mjs";

export async function checkFleet(browser, url) {
  const context = await offlineContext(browser, {
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce"
  });
  try {
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (/^https?:/.test(request.url())) errors.push(request.url());
    });
    await page.goto(url);
    const id = (name) => page.locator("#" + name),
      radio = (name) => id("fleet").getByRole("radio", { name, exact: true });
    const img = (canvas) => canvas.toDataURL();
    const board = id("board");
    await id("launch-guide").click();
    const standardLesson = await id("lesson-art").evaluate(img);
    await id("guide").locator("[data-close]").click();

    await id("launch-fleet").click();
    assert.equal(await id("fleet").getByRole("radio").count(), 12);
    assert.ok(await radio("Lest").isChecked());
    const images = await id("fleet")
      .locator(".fleet-card canvas")
      .evaluateAll((nodes) => nodes.map((c) => c.toDataURL()));
    assert.equal(new Set(images).size, 24);
    await radio("Cabestan").check();
    await id("tab-lest").press("ArrowRight");
    assert.ok(await radio("Sonde").isChecked());
    await radio("Manta").check();
    assert.equal(await id("fleet-summary").innerText(), "Cabestan + Manta");
    await page.keyboard.press("Escape");
    await id("launch-fleet").click();
    assert.ok(await radio("Lest").isChecked());
    await radio("Cabestan").check();
    await id("tab-sonde").click();
    await radio("Manta").check();
    await id("confirm-crew").click();
    await id("language").getByRole("radio", { name: "English" }).check();
    await page.getByRole("button", { name: "Start with Manta", exact: true }).click();
    await id("launch-guide").click();
    assert.notEqual(await id("lesson-art").evaluate(img), standardLesson);
    assert.match(await id("lesson-art").getAttribute("aria-label"), /Cabestan and Manta/);
    await id("lesson-next").click();
    assert.match(await id("lesson-text").innerText(), /Move Cabestan/);
    await id("guide").locator("[data-close]").click();
    await id("start-game").click();
    assert.equal(await id("pilot-name").innerText(), "Manta");
    await board.press("ArrowRight");
    const position = await board.getAttribute("aria-label");
    const before = await board.evaluate(img);
    await id("crew-fleet").click();
    await radio("Nautile").check();
    await id("confirm-crew").click();
    assert.equal(await id("pilot-name").innerText(), "Nautile");
    assert.equal(await board.getAttribute("aria-label"), position.replace("Manta", "Nautile"));
    assert.equal(await id("move-count").innerText(), "One step");
    assert.notEqual(await board.evaluate(img), before);
    await id("resume-play").click();
    await board.press("u");
    assert.match(await board.getAttribute("aria-label"), /Nautile, column 6, row 4/);
    const rect = await board.boundingBox();
    const initialStatus = await id("status").innerText();
    await board.hover({ position: tilePosition(rect, 2, 5) });
    assert.equal(await board.getAttribute("data-intent"), "swap");
    await board.hover({ position: tilePosition(rect, 8, 1) });
    assert.equal(await board.getAttribute("data-intent"), "inspect");
    assert.equal(await id("status").innerText(), initialStatus);
    await board.click({ position: tilePosition(rect, 8, 1) });
    assert.match(await id("status").innerText(), /Nautile can connect/);
    await board.press("ArrowDown");
    await board.press("ArrowLeft");
    await board.hover({ position: tilePosition(rect, 4, 5) });
    assert.equal(await board.getAttribute("data-intent"), "blocked");
    await board.click({ position: tilePosition(rect, 4, 5) });
    assert.match(await id("status").innerText(), /too heavy for Nautile/);
    await page.reload();
    assert.ok(await id("language").getByRole("radio", { name: "English" }).isChecked());
    assert.equal(
      await page.getByRole("button", { name: "Start with Nautile", exact: true }).getAttribute("aria-pressed"),
      "true"
    );
    await page.getByRole("button", { name: "Start with Cabestan", exact: true }).click();
    await id("start-game").click();
    await board.press("ArrowRight");
    const dock = await board.boundingBox();
    await board.hover({ position: tilePosition(dock, 4, 5) });
    assert.equal(await board.getAttribute("data-intent"), "push");
    assert.equal(await id("target-cell").innerText(), "→");
    assert.ok(await id("push-cell").isVisible());
    await board.press("u");
    for (let stage = 0; stage < 3; stage++) {
      await playOnMap(page, stage, false, { lest: "Cabestan", sonde: "Nautile" });
      if (stage < 2) await id("next").click();
    }
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}
