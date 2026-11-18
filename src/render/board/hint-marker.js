export function markClue(c, x, y) {
  c.save();
  c.translate(x, y);
  c.setLineDash([6, 4]);
  for (const [width, color] of [
    [4, "#193642"],
    [2, "#fff7ae"]
  ]) {
    c.strokeStyle = color;
    c.lineWidth = width;
    c.beginPath();
    c.roundRect(-24, -24, 48, 48, 8);
    c.stroke();
  }
  c.restore();
}
