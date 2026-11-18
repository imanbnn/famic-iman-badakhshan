import { INK, PAPER, oval } from "#render/canvas";

export const brass = "#edbd70";
export const steel = "#547985";
export const rubber = "#334d58";
export const glass = "#82dadd";
export const copper = "#ca7853";
const outlines = new Map();

export function contour(c, drawing, fill, stroke = INK, width = 2.2) {
  let outline = outlines.get(drawing);
  if (!outline) {
    outline = new Path2D(drawing);
    outlines.set(drawing, outline);
  }
  c.lineCap = c.lineJoin = "round";
  if (fill) {
    c.fillStyle = fill;
    c.fill(outline);
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.stroke(outline);
  }
}

export function line(c, drawing, color = INK, width = 1.5) {
  contour(c, drawing, null, color, width);
}

export function lens(c, x, y, radius, color = glass) {
  oval(c, x, y, radius, radius, INK);
  oval(c, x, y, radius * 0.65, radius * 0.65, color);
  oval(c, x - radius * 0.2, y - radius * 0.26, radius * 0.22, radius * 0.22, PAPER);
}

export function wheel(c, x, y, radius) {
  oval(c, x, y, radius, radius, rubber, INK, 1.8);
  oval(c, x, y, radius * 0.46, radius * 0.46, brass, INK, 1.2);
}
