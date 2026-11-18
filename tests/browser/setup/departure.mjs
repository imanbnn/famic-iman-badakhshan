import assert from "node:assert/strict";
import { offlineContext } from "../helpers/offline.mjs";
import { playOnMap } from "../helpers/play-route.mjs";

export async function checkDeparture(browser, url) {
  const context = await offlineContext(browser, {
    viewport: { width: 1440, height: 900 },
    reducedMotion: "no-preference"
  });
  try {
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (/^https?:/.test(r.url())) errors.push(r.url());
    });
    await page.goto(url);
    await page.bringToFront();
    const id = (name) => page.locator("#" + name),
      board = id("board");
    const pressed = async (selector) => page.locator(selector).getAttribute("aria-pressed");
    await page.keyboard.press("ArrowRight");
    assert.ok(await id("game").isHidden());
    const fr = id("language").getByRole("radio", { name: "Français" }),
      en = id("language").getByRole("radio", { name: "English" });
    await fr.focus();
    await page.keyboard.press("ArrowRight");
    assert.ok(await en.isChecked());
    assert.equal(await id("language").locator("select").count(), 0);
    assert.equal(await id("setup-title").innerText(), "Before you cast off");
    await page.locator('#launch [data-theme-choice="foam"]').click();
    await id("sound").hover();
    assert.equal(await id("sound-tip").innerText(), "Mute sound");
    assert.ok(await id("sound-tip").isVisible());
    await page.locator('[data-starter="sonde"]').click();
    assert.equal(await page.locator("html").getAttribute("data-theme"), "foam");
    await id("launch-guide").click();
    assert.ok(await id("lesson-prev").isDisabled());
    const titles = [],
      pictures = new Set();
    const visibleKeys = [
      ["←", "↑", "↓", "→", "Space"],
      ["→", "U"],
      ["Space", "E"],
      ["←", "↑", "↓", "→", "E"],
      ["Space", "R"]
    ];
    const symbols = [
      ["Lest", "Sonde"],
      ["Crate", "Pressure plate"],
      ["Duct", "Relay"],
      ["Battery", "Folded bridge"],
      ["Winch pedal", "Lock", "Lighthouse"]
    ];
    for (let i = 0; i < 5; i++) {
      assert.equal(await id("lesson-counter").textContent(), "Step " + (i + 1) + " of 5");
      titles.push(await id("lesson-title").innerText());
      pictures.add(await id("lesson-art").evaluate((c) => c.toDataURL()));
      assert.deepEqual(await id("lesson-keys").locator("kbd").allTextContents(), visibleKeys[i]);
      assert.deepEqual(await id("lesson-symbols").locator("strong").allTextContents(), symbols[i]);
      if (i === 1) {
        await id("lesson-prev").click();
        assert.equal(await id("lesson-title").innerText(), titles[0]);
        await id("lesson-next").click();
      }
      await id("lesson-next").click();
    }
    assert.equal(pictures.size, 5);
    assert.equal(titles[4], "Relight the lighthouse");
    assert.ok(await id("guide").isHidden());
    await id("start-game").click();
    assert.match(await board.getAttribute("aria-label"), /Active robot Sonde/);
    const gameBounds = await id("game").boundingBox();
    assert.ok(gameBounds.width >= 1438 && gameBounds.y + gameBounds.height >= 899);
    await board.press("ArrowRight");
    assert.equal(await id("move-count").innerText(), "One step");
    await id("sound").click();
    await page.keyboard.press("r");
    assert.match(await board.getAttribute("aria-label"), /column 7, row 4/);
    assert.ok(await id("sound").evaluate((n) => document.activeElement === n));
    assert.equal(await board.evaluate((n) => getComputedStyle(n).outlineStyle), "none");
    const soundState = await id("sound").getAttribute("aria-pressed");
    await page.keyboard.press("Space");
    assert.notEqual(await id("sound").getAttribute("aria-pressed"), soundState);
    assert.match(await board.getAttribute("aria-label"), /Active robot Sonde, column 7, row 4/);
    await page.locator(".swap").focus();
    await page.keyboard.press("Tab");
    assert.ok(await board.evaluate((n) => n === document.activeElement));
    assert.ok(await page.locator(".key-focus").isVisible());
    await board.press("Control+ArrowRight");
    assert.equal(await id("move-count").innerText(), "One step");
    const go = (n) =>
      id("progress")
        .getByRole("button")
        .nth(n - 1)
        .click();
    await go(2);
    assert.equal(await id("title").innerText(), "The twin channels");
    await go(1);
    assert.equal(await id("move-count").innerText(), "One step");
    await id("journal-open").click();
    await id("journal").getByRole("button", { name: "Resume · The twin channels" }).click();
    assert.equal(await id("title").innerText(), "The twin channels");
    await go(1);
    await board.press("u");
    assert.match(await board.getAttribute("aria-label"), /Active robot Sonde, column 6, row 4/);
    await id("hint").click();
    assert.equal(await id("hint-counter").innerText(), "Hint 1/4");
    assert.match(await id("hint-text").innerText(), /Push the crate/);
    assert.ok(await id("map-hint").getByRole("button", { name: "Close hint", exact: true }).isVisible());
    const water = id("water-motion"),
      pixels = (c) => c.toDataURL();
    const initial = await water.evaluate(pixels);
    await page.waitForFunction((value) => document.getElementById("water-motion").toDataURL() !== value, initial, {
      timeout: 3000
    });
    await id("settings-open").click();
    assert.equal(await id("settings").getByRole("checkbox").count(), 0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator('#settings [data-theme-choice="ember"]').click();
    await id("settings").getByRole("button", { name: "Close", exact: true }).click();
    const still = await water.evaluate(pixels);
    await page.waitForTimeout(260);
    assert.equal(await water.evaluate(pixels), still);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.waitForFunction((value) => document.getElementById("water-motion").toDataURL() !== value, still, {
      timeout: 3000
    });
    await page.reload();
    assert.equal(await pressed('[data-starter="sonde"]'), "true");
    assert.ok(await en.isChecked());
    assert.equal(await page.locator("html").getAttribute("data-theme"), "ember");
    await page.locator('[data-starter="lest"]').click();
    await id("start-game").click();
    await go(3);
    await playOnMap(page, 2);
    assert.equal(await id("finish-title").innerText(), "Beacon relit!");
    assert.match(await id("finish-kicker").textContent(), /Stop 03 complete/);
    await id("next").click();
    assert.equal(await id("title").innerText(), "The dry dock");
    await fr.check();
    assert.equal(await id("title").innerText(), "La cale sèche");
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}
