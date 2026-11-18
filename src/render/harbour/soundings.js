const waters = [
  ["#28575d", "#38666a", "#417174", "#4d7c79", "#5e8b81", "#78a096"],
  ["#31545e", "#3f616b", "#4a7076", "#598086", "#6b9191", "#89a69c"],
  ["#1e344e", "#283f59", "#304b64", "#3a5770", "#497083", "#6e8c97"]
];

export function soundings(c, board, point, tile, stage) {
  const colors = waters[stage];
  const quays = board.tiles.flatMap((symbol, p) => (!["~", "b"].includes(symbol) ? [point(p)] : []));
  const bands = [
    [58, 1],
    [56, 0],
    [37, 2],
    [35, 1],
    [21, 3],
    [19, 2],
    [10, 4],
    [8, 3],
    [3, 5]
  ];
  for (const [reach, shade] of bands) {
    c.beginPath();
    for (const [x, y] of quays) {
      const radius = tile / 2 + reach;
      c.roundRect(x - radius, y - radius, 2 * radius, 2 * radius, reach);
    }
    c.fillStyle = colors[shade];
    c.fill();
  }
}

export function lightBeam(c, x, y, angle) {
  c.save();
  c.translate(x, y - 15);
  c.rotate(angle);
  const gradient = c.createLinearGradient(0, 0, 144, 0);
  gradient.addColorStop(0, "#ffeba2b3");
  gradient.addColorStop(1, "#ffeba200");
  c.fillStyle = gradient;
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(144, -20);
  c.lineTo(144, 20);
  c.closePath();
  c.fill();
  c.restore();
}
