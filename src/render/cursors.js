import { INK, MINT, ORANGE, PAPER, oval, path } from "#render/canvas";

const CURSOR_SIZE_PX = 32;
const PUSH_CURSOR_SIZE_PX = 40;
const QUARTER_TURN = Math.PI / 2;

export function chartCursors() {
  const image = document.createElement("canvas");
  image.width = image.height = CURSOR_SIZE_PX;
  const pen = image.getContext("2d");
  pen.lineJoin = pen.lineCap = "round";
  const cursors = {};

  function save(name, x, y, fallback = "pointer") {
    const src = image.toDataURL();
    cursors[name] = { src, css: "url(" + src + ") " + x + " " + y + ", " + fallback };
    pen.clearRect(0, 0, image.width, image.height);
  }
  function stroke(d, colour, width) {
    pen.strokeStyle = colour;
    pen.lineWidth = width;
    pen.stroke(new Path2D(d));
  }
  function shape(d, fill) {
    const outline = new Path2D(d);
    pen.strokeStyle = PAPER;
    pen.lineWidth = 4;
    pen.stroke(outline);
    pen.fillStyle = fill;
    pen.fill(outline);
    pen.strokeStyle = INK;
    pen.lineWidth = 1.7;
    pen.stroke(outline);
  }

  // A quiet pointer on distant paving; the compass belongs over open water.
  shape("M5 4L23 18L15 18L12 25Z", PAPER);
  stroke("M8 9L11.5 18", "#4e817c", 1.5);
  save("quay", 5, 4, "default");
  oval(pen, 16, 16, 8, 8, null, PAPER, 4);
  oval(pen, 16, 16, 8, 8, null, INK, 1.8);
  const needle = [
    [20, 3],
    [19, 17],
    [12, 29],
    [13, 15]
  ];
  path(pen, needle, PAPER, PAPER, 3.5);
  path(
    pen,
    [
      [20, 3],
      [19, 17],
      [13, 15]
    ],
    ORANGE
  );
  path(pen, needle, null, INK, 1.8);
  oval(pen, 16, 16, 1.6, 1.6, INK);
  save("water", 16, 16, "crosshair");

  const bearings = [
    ["up", 0, 16, 3],
    ["right", 1, 29, 16],
    ["down", 2, 16, 29],
    ["left", 3, 3, 16]
  ];
  for (const [direction, turn, tipX, tipY] of bearings) {
    pen.save();
    pen.translate(16, 16);
    pen.rotate(turn * QUARTER_TURN);
    shape("M0 -13L9 1L3 0L3 10H-3V0L-9 1Z", MINT);
    pen.restore();
    save("move-" + direction, tipX, tipY);
  }

  shape("M3 11L9 5V8H24V14H9V17ZM29 21L23 15V18H8V24H23V27Z", MINT);
  save("swap", 15, 16);

  shape("M5 10H24V13H28V20H24V23H5Q3 23 3 21V12Q3 10 5 10Z", MINT);
  stroke("M13.5 12.5V20.5M9.5 16.5H17.5", INK, 2.4);
  save("collect", 14, 16);

  shape("M8 12H10V4H13V12H19V4H22V12H24V15Q24 21 18 22V26H22V29H17Q14 29 14 26V22Q8 21 8 15Z", MINT);
  save("relay", 16, 12);

  shape("M3 18H7V14H10V17H22V14H25V18H29V26H24V22H8V26H3Z", "#e8b37f");
  shape("M8 7H18V4L25 9L18 14V11H8Z", MINT);
  save("bridge", 16, 19);

  shape("M12 3H20V10H26L16 20L6 10H12Z", MINT);
  shape("M5 24L23 21L27 26L7 29Z", "#dfb58c");
  save("hold", 16, 20);

  shape("M7 28V4Q12 2 17 5Q21 8 27 5L25 17Q20 20 15 17Q12 15 10 16V28Z", PAPER);
  stroke("M10 6V13", INK, 2);
  pen.fillStyle = INK;
  pen.fill(new Path2D("M13 6L17 7L16 11L12 10ZM17 11L21 12L20 16L16 15ZM22 8L25 7L24 11L21 12Z"));
  save("finish", 8, 27);

  oval(pen, 16, 16, 9, 9, INK, PAPER, 2.5);
  oval(pen, 16, 16, 7, 7, null, ORANGE, 2);
  path(
    pen,
    [
      [11, 21],
      [21, 11]
    ],
    null,
    ORANGE,
    2.5,
    false
  );
  save("blocked", 16, 16, "not-allowed");
  for (const [colour, width] of [
    [PAPER, 6],
    [INK, 3]
  ]) {
    path(
      pen,
      [
        [16, 16],
        [23, 23]
      ],
      null,
      colour,
      width,
      false
    );
    oval(pen, 10, 10, 7, 7, null, colour, width);
  }
  oval(pen, 10, 10, 4.9, 4.9, INK);
  oval(pen, 10, 7.8, 1, 1, PAPER);
  stroke("M10 10.5V13", PAPER, 1.8);
  save("inspect", 10, 10, "zoom-in");

  // The hand touches the near face of the crate; the hotspot stays on the crate in all four bearings.
  image.width = image.height = PUSH_CURSOR_SIZE_PX;
  pen.lineJoin = pen.lineCap = "round";
  for (const [direction, turn] of bearings) {
    const angle = (turn - 1) * QUARTER_TURN;
    pen.save();
    const center = PUSH_CURSOR_SIZE_PX / 2;
    pen.translate(center, center);
    pen.rotate(angle);
    pen.translate(-center, -center);
    shape("M18 7H29V3L37 10L29 17V13H18Z", ORANGE);
    shape("M20 17H34V31H20Z", "#e2a16d");
    stroke("M22.5 28L31 19.5", INK, 2);
    shape(
      "M3 23L8 22L12 18L14 14Q15 12.5 16.5 14Q18 15 16.5 17.5L14.5 20L19.5 19.5Q21.5 19.5 21.5 21.5V26Q21.5 28.5 19.5 29.5L15 32Q12 33 8 30.5L4.5 31Z",
      PAPER
    );
    stroke("M17 23H20.5M17.5 26H20M6.7 23.5L8.5 29", INK, 1.45);
    const hotspot = pen.getTransform().transformPoint({ x: 27, y: 24 });
    pen.restore();
    save("push-" + direction, Math.round(hotspot.x), Math.round(hotspot.y));
  }
  return cursors;
}
