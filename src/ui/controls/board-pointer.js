import { byId } from "#ui/dom";
import { pointAt } from "#game/pointer";
import { cursorIcon } from "#ui/guide/cursors";

const marks = {
  swap: "⇄",
  relay: "ϟ",
  bridge: "↔",
  collect: "+",
  hold: "↓",
  finish: "⚑",
  blocked: "×",
  inspect: "i"
};
const arrows = { up: "↑", down: "↓", left: "←", right: "→" };

export function boardInput(canvas, cursors, current, onAction, onInspect) {
  const target = byId("target-cell"),
    landing = byId("push-cell");
  const playArea = canvas.closest(".play-area");
  let pointer = null,
    lastTile,
    lastState,
    showPreview = true;
  function hidePreview() {
    target.hidden = landing.hidden = true;
  }
  function clear() {
    pointer = null;
    lastTile = lastState = undefined;
    showPreview = true;
    canvas.dataset.intent = "idle";
    canvas.style.cursor = cursors.quay.css;
    hidePreview();
  }
  function place(element, chart, tile) {
    const box = chart.cellBounds(tile);
    for (const [prop, value] of Object.entries(box)) element.style[prop] = value + "%";
    element.hidden = false;
  }
  function refresh() {
    if (!pointer) return;
    const { chart, session } = current();
    if (!session || session.state.won || document.querySelector("dialog[open]")) {
      clear();
      return;
    }
    const tile = chart.tileAt(pointer.x, pointer.y);
    if (tile === lastTile && session.state === lastState) return;
    lastTile = tile;
    lastState = session.state;
    hidePreview();
    const choice = tile === null ? { kind: "water" } : pointAt(session.board, session.state, tile);
    canvas.dataset.intent = choice.kind;
    canvas.style.cursor = cursors[cursorIcon(choice)].css;
    if (!showPreview) return;
    if (playArea.classList.contains("has-hint")) {
      lastState = undefined;
      return;
    }
    if (choice.action || choice.kind === "inspect") {
      place(target, chart, tile);
      target.textContent =
        choice.kind === "move" || choice.kind === "push" ? arrows[choice.action] : marks[choice.kind];
    }
    if (choice.landing !== undefined) place(landing, chart, choice.landing);
  }
  function track(event) {
    if (event.pointerType === "touch") {
      clear();
      return;
    }
    if (!showPreview) lastState = undefined;
    showPreview = true;
    pointer = { x: event.clientX, y: event.clientY };
    refresh();
  }
  canvas.addEventListener("pointerenter", track);
  canvas.addEventListener("pointermove", track);
  canvas.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") clear();
  });
  canvas.addEventListener("pointerleave", clear);
  canvas.addEventListener("pointercancel", clear);
  window.addEventListener("blur", clear);
  window.addEventListener("resize", clear);
  document.addEventListener("keydown", () => {
    showPreview = false;
    hidePreview();
  });
  document.addEventListener("scroll", clear, true);
  canvas.addEventListener("click", (event) => {
    const { chart, session } = current();
    const tile = chart.tileAt(event.clientX, event.clientY);
    if (tile === null || session.state.won) return;
    const choice = pointAt(session.board, session.state, tile);
    if (choice.action) onAction(choice.action);
    else if (choice.kind === "inspect") onInspect(tile, choice);
    if (!session.state.won && !document.querySelector("dialog[open]")) canvas.focus({ preventScroll: true });
    refresh();
  });
  clear();
  return { clear, refresh };
}
