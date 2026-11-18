import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, firefox, webkit } from "playwright-core";
import { offlineContext } from "./helpers/offline.mjs";
import { playOnMap } from "./helpers/play-route.mjs";
import { checkPointer } from "./controls/pointer.mjs";
import { checkCursorGuide } from "./controls/legends.mjs";
import { checkControlSurfaces } from "./controls/feedback.mjs";
import { tilePosition } from "./helpers/tiles.mjs";
import { checkDeparture } from "./setup/departure.mjs";
import { checkGuideScroll } from "./setup/guide.mjs";
import { checkFleet } from "./setup/hangar.mjs";
import { checkTouch } from "./touch.mjs";
import { checkPiloting } from "./controls/focus.mjs";
import { routes, routeKeys, routeActions } from "../fixtures/routes.js";

const channels = { win32: "msedge", linux: "chrome", darwin: "chrome" };
const channel = process.env.CONTREFLOT_BROWSER || channels[process.platform];
const engines = { chrome: chromium, msedge: chromium, firefox, webkit };
const engine = engines[channel];
if (!engine) throw new Error("Navigateur inconnu : " + channel);
const browser = await engine.launch(engine === chromium ? { channel } : {});
const folder = await mkdtemp(join(tmpdir(), "Contreflot – essai "));
try {
  const file = join(folder, "Jouer.html");
  await writeFile(file, await readFile(new URL("../../dist/index.html", import.meta.url)));
  const context = await offlineContext(browser, { viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  const errors = [],
    requests = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (/^https?:/.test(request.url())) requests.push(request.url());
  });
  await page.goto(pathToFileURL(file).href);
  const button = (name) => page.getByRole("button", { name, exact: true });
  const board = page.locator("#board");
  await checkGuideScroll(page);
  await button("Embarquer").click();
  await checkControlSurfaces(page);
  await checkCursorGuide(page);
  await checkPointer(page);
  const journal = page.getByRole("dialog", { name: "Journal de bord" });
  await button("Journal de bord").click();
  assert.ok(await journal.getByRole("button", { name: "Embarquer · Le dernier feu" }).isEnabled());
  await journal.getByRole("button", { name: "Fermer" }).click();
  await button("Demander un indice").click();
  assert.match(await page.locator("#hint-text").innerText(), /plaque rayée/);
  const bounds = await board.boundingBox();
  const clickTile = (x, y) => board.click({ position: tilePosition(bounds, x, y) });
  await clickTile(3, 5);
  assert.match(await board.getAttribute("aria-label"), /colonne 4, ligne 6/);
  await clickTile(5, 3);
  assert.match(await board.getAttribute("aria-label"), /actif Sonde/);
  await board.press("r");
  await button("Réglages").click();
  const binding = button("Changer la touche pour aller à droite");
  await binding.click();
  await binding.press("e");
  assert.match(await page.locator("#binding-status").innerText(), /déjà attribuée/);
  await binding.press("d");
  await button("Fermer").click();
  await page.locator("#guide-open").click();
  assert.equal(await page.locator('#lesson-keys [data-key="right"]').innerText(), "D");
  await page.locator("#lesson-next").click();
  assert.equal(await page.locator('#lesson-keys [data-key="right"]').innerText(), "D");
  await page.locator("#guide [data-close]").click();
  await page.locator("#resume-play").click();
  await board.hover({ position: tilePosition(await board.boundingBox(), 3, 5) });
  assert.equal(await board.getAttribute("data-intent"), "move");
  await board.press("d");
  assert.match(await board.getAttribute("aria-label"), /colonne 4, ligne 6/);
  await board.press("u");
  assert.match(await board.getAttribute("aria-label"), /colonne 3, ligne 6/);
  await button("Réglages").click();
  await button("Rétablir les touches par défaut").click();
  await button("Fermer").click();

  for (const [index, route] of routes.entries()) {
    const steps = route.replaceAll(" ", "");

    for (const key of steps) {
      if (index === 1) await page.locator('[data-action="' + routeActions[key] + '"]').click();
      else await board.press(routeKeys[key]);
    }
    const finish = page.getByRole("dialog");
    await finish.waitFor({ state: "visible" });
    const last = index === routes.length - 1;
    assert.equal(
      await finish.getByRole("heading").innerText(),
      last ? "Le port est rallumé." : "Balise rallumée !"
    );
    await finish.getByRole("button", { name: last ? "Reprendre du début" : "Escale suivante →" }).click();
    if (index === routes.length - 2) {
      // Reopen with two recorded stops and the final stop still unplayed.
      await page.reload();
      await button("Embarquer").click();
      assert.equal(await page.locator("#title").innerText(), "La cale sèche");
      assert.equal(await page.locator("#progress [aria-current]").innerText(), "01");
      assert.equal(await page.locator("#move-count").innerText(), "0 pas");
      await button("Journal de bord").click();
      assert.equal(await journal.getByText(/Meilleur trajet/).count(), 2);
      await journal.locator("[data-close]").click();
      await playOnMap(page, 0);
      await page.locator("#next").click();
      assert.equal(await page.locator("#title").innerText(), "Les deux passes");
      await page.locator("#progress button").last().click();
    }
  }
  assert.equal(await page.getByRole("heading", { level: 1 }).innerText(), "La cale sèche");
  await page.reload();
  await button("Embarquer").click();
  assert.equal(await page.locator("#title").innerText(), "La cale sèche");
  await button("Journal de bord").click();
  assert.equal(await journal.getByText(/Meilleur trajet/).count(), 3);
  await journal.getByRole("button", { name: "Rejouer · Le dernier feu" }).click();
  assert.equal(await page.getByRole("heading", { level: 1 }).innerText(), "Le dernier feu");
  for (const width of [320, 360, 375, 390, 414, 600, 680, 768, 1366]) {
    await page.setViewportSize({ width, height: 768 });
    const overflow = await page.evaluate(() => ({
      extra: document.documentElement.scrollWidth - innerWidth,
      elements: [...document.querySelectorAll("body *")]
        .filter((n) => n.getBoundingClientRect().right > innerWidth + 1)
        .slice(0, 12)
        .map((n) => [n.tagName, n.id || n.className, Math.round(n.getBoundingClientRect().right)])
    }));
    assert.ok(overflow.extra <= 0, "Débordement à " + width + " px " + JSON.stringify(overflow));
  }
  await button("Journal de bord").click();
  await journal.getByRole("button", { name: "Reprendre · La cale sèche" }).click();
  for (const stage of routes.keys()) {
    await playOnMap(page, stage);
    if (stage < routes.length - 1) await page.locator("#next").click();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(requests, []);
  await checkPiloting(browser, pathToFileURL(file).href);
  await checkDeparture(browser, pathToFileURL(file).href);
  await checkFleet(browser, pathToFileURL(file).href);
  if (engine !== firefox) await checkTouch(browser, pathToFileURL(file).href);
  console.log("Trois escales terminées hors ligne avec " + channel + " " + browser.version());
} finally {
  await browser.close();
  await rm(folder, { recursive: true, force: true });
}
