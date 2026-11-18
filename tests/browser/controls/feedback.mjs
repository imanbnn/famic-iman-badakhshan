import assert from "node:assert/strict";

const colour = (button) => button.evaluate((node) => getComputedStyle(node).backgroundColor);
const hasFocus = (button) => button.evaluate((node) => node === document.activeElement);

export async function checkControlSurfaces(page) {
  const id = (name) => page.locator("#" + name);
  const sound = id("sound"),
    tip = id("sound-tip"),
    hint = id("map-hint"),
    close = id("close-hint"),
    board = id("board");
  const initialSound = await colour(sound);
  await sound.hover();
  const rounded = await sound.evaluate((n) => parseFloat(getComputedStyle(n).borderTopRightRadius) > 0);
  await id("hint").click();
  const initialClose = await colour(close);
  await close.hover();
  const inHeading = await close.evaluate((n) => Boolean(n.closest(".hint-heading")));
  assert.deepEqual(
    { rounded, hasTooltip: (await tip.count()) === 1, inHeading },
    { rounded: true, hasTooltip: true, inHeading: true },
    "Le survol du son et la fermeture de l’indice ont leurs propres commandes"
  );

  assert.notEqual(await colour(close), initialClose);
  assert.equal(await close.getAttribute("aria-keyshortcuts"), "Escape");
  const closeBox = await close.boundingBox(),
    copy = await id("hint-text").boundingBox(),
    hintBox = await hint.boundingBox();
  assert.ok(closeBox.y + closeBox.height <= copy.y && closeBox.x + closeBox.width <= hintBox.x + hintBox.width);
  assert.ok(
    await close.evaluate((n) => {
      const r = n.getBoundingClientRect();
      return n.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    })
  );
  await close.click();
  assert.ok((await hint.isHidden()) && (await hasFocus(board)));
  assert.equal(await page.locator("body").getAttribute("data-pilot"), "playing");

  await sound.hover();
  assert.notEqual(await colour(sound), initialSound);
  assert.ok(await tip.isVisible());
  assert.equal(await tip.innerText(), "Couper le son");
  assert.equal(await sound.getAttribute("title"), null);
  assert.equal(await sound.getAttribute("aria-describedby"), "sound-tip");
  const on = await sound.boundingBox(),
    tooltip = await tip.boundingBox();
  assert.ok(tooltip.y >= on.y + on.height && tooltip.x + tooltip.width <= page.viewportSize().width);
  await sound.click();
  assert.equal(await tip.innerText(), "Activer le son");
  assert.deepEqual(await sound.boundingBox(), on, "Le son garde la même surface après la bascule");
  await sound.click();
  await page.mouse.move(1, 1);
  await id("settings-open").focus();
  await page.keyboard.press("Tab");
  assert.ok((await hasFocus(sound)) && (await tip.isVisible()));
  await page.keyboard.press("Escape");
  assert.ok((await hasFocus(sound)) && (await tip.isHidden()));
  await page.keyboard.press("Space");
  assert.equal(await sound.getAttribute("aria-pressed"), "false");
  await page.keyboard.press("Space");
  await id("resume-play").click();
}
