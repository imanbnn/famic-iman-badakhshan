import assert from "node:assert/strict";

function scrollAndMeasure(fraction) {
  const guide = document.getElementById("guide");
  const top = guide.querySelector(".modal-head"),
    close = top.querySelector("button");
  const next = document.getElementById("lesson-next"),
    footer = next.parentElement;
  const pane = guide.querySelector(".dialog-scroll");
  pane.scrollTop = (pane.scrollHeight - pane.clientHeight) * fraction;
  const header = top.getBoundingClientRect(),
    body = pane.getBoundingClientRect(),
    foot = footer.getBoundingClientRect();
  const hits = (button) => {
    const rect = button.getBoundingClientRect();
    return button.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
  };
  return {
    scroll: pane.scrollTop,
    overflow: pane.scrollHeight - pane.clientHeight,
    headerY: header.y,
    footerY: foot.y,
    headerBottom: header.bottom,
    bodyTop: body.top,
    bodyBottom: body.bottom,
    closeVisible: hits(close),
    nextVisible: hits(next),
    pageY: scrollY
  };
}

export async function checkGuideScroll(page) {
  const initial = page.viewportSize();
  for (const viewport of [
    { width: 1100, height: 560 },
    { width: 320, height: 640 },
    { width: 844, height: 390 }
  ]) {
    await page.setViewportSize(viewport);
    await page.locator("#guide-open").press("Enter");
    const first = await page.evaluate(scrollAndMeasure, 0);
    for (const fraction of [0.5, 1]) {
      const at = await page.evaluate(scrollAndMeasure, fraction);
      if (at.overflow > 1) assert.ok(at.scroll > 0, "Le contenu du guide doit défiler");
      assert.ok(
        at.headerBottom <= at.bodyTop + 1 && at.bodyBottom <= at.footerY + 1,
        "Le texte et les deux barres du guide occupent des zones distinctes " + JSON.stringify(at)
      );
      assert.ok(at.closeVisible && at.nextVisible);
      assert.ok(Math.abs(at.headerY - first.headerY) < 1 && Math.abs(at.footerY - first.footerY) < 1);
      assert.equal(at.pageY, first.pageY);
    }
    const symbols = page.locator("#guide-symbols"),
      cursors = page.locator("#guide-cursors");
    const boxes = await Promise.all([symbols.boundingBox(), cursors.boundingBox()]);
    assert.ok(Math.abs(boxes[0].y - boxes[1].y) < 1 && boxes[0].x + boxes[0].width <= boxes[1].x);
    assert.ok(boxes.every((box) => box.height >= 44 && box.x >= 0 && box.x + box.width <= viewport.width));
    await symbols.click();
    const reference = page.locator("#symbol-guide");
    assert.equal(await reference.getByRole("heading").innerText(), "Symboles de la carte");
    assert.equal(await reference.locator("li canvas").count(), 11);
    await reference.locator("li").last().scrollIntoViewIfNeeded();
    assert.ok(
      await reference.locator("[data-close]").evaluate((button) => {
        const r = button.getBoundingClientRect();
        return button.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      })
    );
    await page.keyboard.press("Escape");
    assert.ok(await symbols.evaluate((node) => node === document.activeElement));
    await page.locator("#lesson-next").click();
    assert.match(await page.locator("#lesson-counter").innerText(), /2/);
    assert.equal(await page.locator("#guide .dialog-scroll").evaluate((node) => node.scrollTop), 0);
    await page.locator("#guide [data-close]").click();
    assert.ok(await page.locator("#guide").isHidden());
    assert.ok(await page.locator("#guide-open").evaluate((node) => node === document.activeElement));
  }
  await page.setViewportSize(initial);
  await page.locator("#launch-guide").click();
  await page.locator("#lesson-next").click();
  const guide = page.locator("#guide"),
    cursorHelp = page.locator("#cursor-guide");
  await page.locator("#guide-cursors").press("Enter");
  assert.ok(await cursorHelp.isVisible());
  assert.ok(await guide.isVisible());
  await page.keyboard.press("Escape");
  assert.ok(await cursorHelp.isHidden());
  assert.ok(await page.locator("#guide-cursors").evaluate((n) => n === document.activeElement));
  assert.match(await page.locator("#lesson-counter").innerText(), /2/);
  await guide.locator("[data-close]").click();
  assert.ok(await page.locator("#launch").isVisible());
}
