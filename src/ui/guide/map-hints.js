import { byId } from "#ui/dom";
import { availableClues } from "#game/hints";
import { LEVELS } from "#game/levels";
import { t } from "#i18n/translate";

const objects = {
  plates: "Plaque rayée",
  relay: "Relais",
  watch: "Pédale du treuil",
  exit: "Phare",
  firstBridge: "Pont replié",
  lastBridge: "Pont replié"
};
const PANEL_GAP_PX = 9;
const MAP_INSET_PX = 5;
const VIEWPORT_INSET_PX = 4;
const TAIL_INSET_PX = 12;
const PERCENT = 100;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(n, hi));

export function mapHints(current, focusBoard, clearPointer) {
  const panel = byId("map-hint"),
    area = panel.parentElement,
    board = byId("board");
  let index = 0,
    cue = null,
    frame = 0;

  function place() {
    if (!cue) return;
    const { chart } = current(),
      rect = board.getBoundingClientRect(),
      parent = area.getBoundingClientRect();
    const box = chart.cellBounds(cue.tile);
    const left = rect.left + (rect.width * box.left) / PERCENT,
      top = rect.top + (rect.height * box.top) / PERCENT;
    const right = left + (rect.width * box.width) / PERCENT,
      bottom = top + (rect.height * box.height) / PERCENT;
    const cx = (left + right) / 2,
      cy = (top + bottom) / 2,
      gap = PANEL_GAP_PX;
    const width = panel.offsetWidth,
      height = panel.offsetHeight;
    const xMin = parent.left + MAP_INSET_PX,
      xMax = parent.right - MAP_INSET_PX;
    const yMin = Math.max(parent.top + MAP_INSET_PX, VIEWPORT_INSET_PX),
      yMax = Math.min(parent.bottom - MAP_INSET_PX, innerHeight - VIEWPORT_INSET_PX);
    const candidates = [
      { side: "right", room: xMax - right - gap - width, x: right + gap, y: cy - height / 2 },
      { side: "left", room: left - xMin - gap - width, x: left - gap - width, y: cy - height / 2 },
      { side: "below", room: yMax - bottom - gap - height, x: cx - width / 2, y: bottom + gap },
      { side: "above", room: top - yMin - gap - height, x: cx - width / 2, y: top - gap - height }
    ];
    const pick =
      candidates.find((option) => option.room >= 0) ??
      candidates.reduce((best, option) => (option.room > best.room ? option : best));
    const x = clamp(pick.x, xMin, xMax - width),
      y = clamp(pick.y, yMin, yMax - height);
    panel.style.left = x - parent.left - area.clientLeft + "px";
    panel.style.top = y - parent.top - area.clientTop + "px";
    panel.dataset.side = pick.side;
    const vertical = pick.side === "left" || pick.side === "right";
    panel.style.setProperty(
      "--tail",
      clamp(vertical ? cy - y : cx - x, TAIL_INSET_PX, (vertical ? height : width) - TAIL_INSET_PX) + "px"
    );
  }

  function schedule() {
    if (!cue || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      place();
    });
  }
  new ResizeObserver(schedule).observe(area);
  new ResizeObserver(schedule).observe(panel);
  document.addEventListener("scroll", schedule, true);
  window.addEventListener("resize", schedule);

  function render() {
    if (!cue) return;
    byId("hint-counter").textContent = t("Indice {n}/{total}", { n: index + 1, total: cue.total });
    byId("hint-object").textContent = t(objects[cue.clue.kind]);
    byId("hint-text").textContent = t(cue.clue.text);
    byId("more-hints").hidden = cue.total < 2;
    place();
  }

  function dismiss() {
    if (!cue) return false;
    cue = null;
    index = 0;
    cancelAnimationFrame(frame);
    frame = 0;
    panel.hidden = true;
    area.classList.remove("has-hint");
    byId("hint").setAttribute("aria-expanded", "false");
    const { chart, session } = current();
    chart.highlight(session.state, []);
    return true;
  }

  function show(event) {
    const { stage, session, chart, reduced } = current();
    if (!session || session.state.won) return;
    const clues = availableClues(LEVELS[stage], session.board, session.state);
    if (!clues.length) return;
    index = cue ? (index + 1) % clues.length : 0;
    const clue = clues[index],
      width = session.board.width,
      active = session.state.heroes[session.state.active];
    const distance = (tile) =>
      Math.abs((tile % width) - (active % width)) +
      Math.abs(Math.floor(tile / width) - Math.floor(active / width));
    const tile = clue.points.reduce((a, b) => (distance(a) <= distance(b) ? a : b));
    cue = { clue, tile, total: clues.length };
    clearPointer();
    chart.highlight(session.state, clue.points);
    area.classList.add("has-hint");
    panel.hidden = false;
    byId("hint").setAttribute("aria-expanded", "true");
    render();
    const rect = board.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > innerHeight)
      board.scrollIntoView({ block: "center", behavior: reduced ? "instant" : "smooth" });
    if (event.detail === 0) {
      const action = byId("more-hints").hidden ? byId("close-hint") : byId("more-hints");
      action.focus({ preventScroll: true });
    } else focusBoard();
  }

  function close() {
    if (dismiss()) focusBoard();
  }
  byId("hint").onclick = show;
  byId("more-hints").onclick = show;
  byId("close-hint").onclick = close;
  function leaveHint(event) {
    const target = event.target;
    if (cue && target !== board && !byId("hint").contains(target) && !panel.contains(target)) dismiss();
  }
  document.addEventListener("pointerdown", leaveHint, true);
  document.addEventListener("focusin", leaveHint);
  window.addEventListener("blur", dismiss);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cue && !document.querySelector("dialog[open]")) {
      event.preventDefault();
      close();
    }
  });
  return { dismiss, render };
}
