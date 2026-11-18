import { byId } from "#ui/dom";
import { beacon, crate } from "#render/board/fixtures";
import { local } from "#render/canvas";

const strokes = {
  book: "M3 4H9L12 6L15 4H21V19H15L12 21L9 19H3ZM12 6V20",
  buoy: "M21 12A9 9 0 1 1 3 12A9 9 0 1 1 21 12ZM16 12A4 4 0 1 1 8 12A4 4 0 1 1 16 12ZM5.5 5.5L9 9M15 15L18.5 18.5M5.5 18.5L9 15M15 9L18.5 5.5",
  sliders: "M3 6H8M13 6H21M3 12H15M20 12H21M3 18H6M11 18H21M8 3V9M15 9V15M6 15V21",
  audio: "M3 9H7L12 5V19L7 15H3ZM16 8Q21 12 16 16M19 5Q27 12 19 19",
  swap: "M3 8H19M16 4L20 8L16 12M21 16H5M8 12L4 16L8 20",
  undo: "M8 4L3 9L8 14M4 9H14Q21 9 21 15Q21 20 15 20",
  restart: "M4 10A8 8 0 1 1 5 17M3 4V10H9",
  locate: "M19 12A7 7 0 1 1 5 12A7 7 0 1 1 19 12ZM12 2V7M12 17V22M2 12H7M17 12H22"
};

export function drawInstruments() {
  for (const icon of document.querySelectorAll("canvas[data-icon]")) {
    icon.width = icon.height = 48;
    icon.setAttribute("aria-hidden", "true");
    const c = icon.getContext("2d");
    c.scale(2, 2);
    c.lineWidth = 1.65;
    c.lineJoin = c.lineCap = "round";
    c.strokeStyle = "#d9e3e6";
    c.stroke(new Path2D(strokes[icon.dataset.icon]));
  }
  const ghost = document.querySelector("#push-cell canvas").getContext("2d");
  local(ghost, 52, 52, 2, crate);
  const c = byId("brand-signet").getContext("2d");
  local(c, 36, 41, 1.27, (ctx) => beacon(ctx, true));
}
