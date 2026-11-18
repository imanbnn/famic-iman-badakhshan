import assert from "node:assert/strict";
import { tilePosition } from "../helpers/tiles.mjs";

export async function checkCursorGuide(page) {
  const board = page.locator("#board"),
    dialog = page.locator("#cursor-guide"),
    rows = dialog.locator("li");
  const open = page.locator("#board-cursors"),
    bounds = await board.boundingBox();
  const before = await board.getAttribute("aria-label");
  await board.hover({ position: tilePosition(bounds, 3, 5) });
  const arrow = await board.evaluate(
    (n) => getComputedStyle(n).cursor.match(/data:image\/png;base64,[a-z0-9+/=]+/i)?.[0]
  );
  await open.click();
  assert.ok(await dialog.isVisible());
  assert.equal(await rows.count(), 12);
  const sprites = await dialog.locator("li img").evaluateAll((images) => images.map((i) => i.src));
  assert.equal(new Set(sprites).size, 18);
  assert.ok(
    (await dialog.locator('[data-kind="move"] img').evaluateAll((images) => images.map((i) => i.src))).includes(
      arrow
    )
  );
  assert.match(await dialog.locator('[data-kind="push"]').innerText(), /Cliquez sur la caisse.*Lest/);
  assert.match(await dialog.locator('[data-kind="inspect"]').innerText(), /Cliquez.*sous la carte/);
  await page.keyboard.press("ArrowRight");
  assert.equal(await board.getAttribute("aria-label"), before);
  await page.keyboard.press("Escape");
  assert.ok(await dialog.isHidden());
  assert.ok(await board.evaluate((n) => n === document.activeElement));
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.locator("#move-count").innerText(), "1 pas");
  await page.keyboard.press("u");
  await page.locator("#board-symbols").click();
  await page.keyboard.press("Escape");
  await page.locator("#language input[value=en]").check();
  await open.press("Enter");
  assert.equal(await dialog.getByRole("heading").innerText(), "What the cursors mean");
  assert.match(await dialog.locator('[data-kind="bridge"]').innerText(), /One charge.*both robots/);
  assert.match(await dialog.locator('[data-kind="inspect"]').innerText(), /Click.*below the map/);
  await dialog.getByRole("button", { name: "Close the cursor guide" }).click();
  await page.locator("#board-symbols").click();
  const symbols = page.locator("#symbol-guide");
  assert.equal(await symbols.getByRole("heading").innerText(), "Chart symbols");
  assert.equal(await symbols.locator("li").count(), 11);
  assert.equal(await symbols.getByText("Pressure plate", { exact: true }).count(), 1);
  await symbols.getByRole("button", { name: "Close the chart symbols" }).click();
  assert.ok(await board.evaluate((node) => node === document.activeElement));
  await page.locator("#language input[value=fr]").check();
  await page.locator("#resume-play").click();
}
