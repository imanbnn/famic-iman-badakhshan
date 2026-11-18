import { byId } from "#ui/dom";
const RESUME_EDGE_MARGIN_PX = 35;

export function wirePiloting(canPlay, onChange) {
  const board = byId("board"),
    hint = byId("map-hint");
  const resume = byId("resume-play"),
    pause = byId("pilot-pause");
  const ownsKeyboard = (node) => node === board || (node && !hint.hidden && hint.contains(node));
  let pointerControl = null,
    frame = 0;
  function positionResume() {
    frame = 0;
    if (pause.hidden) return;
    const rect = board.getBoundingClientRect(),
      center = rect.top + rect.height / 2;
    pause.classList.toggle(
      "off-chart",
      center < RESUME_EDGE_MARGIN_PX || center > innerHeight - RESUME_EDGE_MARGIN_PX
    );
  }
  function schedulePosition() {
    if (!pause.hidden && !frame) frame = requestAnimationFrame(positionResume);
  }
  window.addEventListener("scroll", schedulePosition, { passive: true });
  window.addEventListener("resize", schedulePosition);
  function set(active) {
    const mode = !canPlay()
      ? "idle"
      : active && !document.hidden && !document.querySelector("dialog[open]")
        ? "playing"
        : "paused";
    if (document.body.dataset.pilot === mode) return;
    document.body.dataset.pilot = mode;
    pause.hidden = mode !== "paused";
    if (mode === "paused") positionResume();
    onChange();
  }
  function focus() {
    const rect = board.getBoundingClientRect(),
      center = rect.top + rect.height / 2;
    if (rect.height && (center < 0 || center > innerHeight))
      board.scrollIntoView({ block: "center", behavior: "instant" });
    board.focus({ preventScroll: true });
    set(true);
  }
  resume.onclick = () => {
    if (pause.classList.contains("off-chart")) board.scrollIntoView({ block: "center", behavior: "instant" });
    focus();
  };
  board.addEventListener("focus", () => set(true));
  document.addEventListener("focusin", (event) =>
    set(ownsKeyboard(event.target) || event.target === pointerControl)
  );
  document.addEventListener(
    "pointerdown",
    (event) => {
      pointerControl = event.target.closest(".commands button,.swap,[data-hero],#hint");
      set(ownsKeyboard(event.target) || Boolean(pointerControl));
    },
    true
  );
  for (const type of ["pointerup", "pointercancel"])
    document.addEventListener(
      type,
      () => {
        pointerControl = null;
      },
      true
    );
  window.addEventListener("blur", () => set(false));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) set(false);
  });
  return { focus, update: () => set(ownsKeyboard(document.activeElement)) };
}
