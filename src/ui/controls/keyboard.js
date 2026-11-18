import { byId } from "#ui/dom";
import { STEPS } from "#game/board";
import { normalize } from "#ui/controls/bindings";

const KEY_REPEAT_MS = 110;
export function wireKeyboard(prefs, hasSession, act, focusBoard) {
  let lastRepeat = 0;
  function keyDown(event) {
    if (event.key === "Tab") document.body.classList.add("tab-navigation");
    if (
      !hasSession() ||
      event.defaultPrevented ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.shiftKey ||
      event.isComposing
    )
      return;
    const key = normalize(event.key),
      action = Object.keys(prefs.keys).find((id) => prefs.keys[id] === key);
    if (!action) return;
    const dialog = document.querySelector("dialog[open]");
    if (dialog) {
      if (dialog.id !== "finish" || action !== "restart" || key === " ") return;
    } else {
      const insideHint = byId("map-hint").contains(event.target);
      if (document.body.dataset.pilot !== "playing" || (event.target !== byId("board") && !insideHint)) return;
      if (insideHint && key === " ") return;
      if (insideHint) focusBoard();
    }
    event.preventDefault();
    if (event.repeat && (!Object.hasOwn(STEPS, action) || performance.now() - lastRepeat < KEY_REPEAT_MS)) return;
    lastRepeat = performance.now();
    act(action);
    if (dialog?.id === "finish") focusBoard();
  }
  document.addEventListener("keydown", keyDown);
  document.addEventListener("pointerdown", () => document.body.classList.remove("tab-navigation"), true);
}
