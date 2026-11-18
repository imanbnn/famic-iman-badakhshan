export const INK = "#132d39";
export const PAPER = "#fff0ce";
export const ORANGE = "#ff986a";
export const MINT = "#8ce0c4";

export function path(ctx, points, fill, stroke, width = 1, closed = true) {
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  if (closed) ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

export function box(ctx, x, y, w, h, radius, fill, stroke, width = 2) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

export function oval(ctx, x, y, rx, ry, fill, stroke, width = 2) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

export function local(ctx, x, y, scale, paint) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  paint(ctx);
  ctx.restore();
}
