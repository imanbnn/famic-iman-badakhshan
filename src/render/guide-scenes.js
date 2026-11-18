import { local, box, path, oval } from "#render/canvas";
import { robot } from "#render/robots/sprites";
import { battery, gate, beacon, bridge, relay, crate, plate, conduit, winch } from "#render/board/fixtures";

export function drawLesson(canvas, scene, models) {
  const c = canvas.getContext("2d");
  const width = 440,
    height = 160;
  c.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  const wash = c.createLinearGradient(0, 0, width, height);
  wash.addColorStop(0, "#1d4050");
  wash.addColorStop(1, "#2e6666");
  c.fillStyle = wash;
  c.fillRect(0, 0, width, height);
  for (let i = 0; i < 76; i++) {
    const x = (i * 89) % width,
      y = (i * 31) % 158;
    path(
      c,
      [
        [x, y],
        [x + 4, y + 1],
        [x + 9, y]
      ],
      null,
      "#aac9be48",
      1,
      false
    );
  }
  const positions = [46, 96, 146, 292, 342, 392],
    y = 86;
  positions.forEach((x, i) => {
    if (scene === "bridge" && i === 2) return;
    box(c, x - 25, y - 24, 50, 53, 3, "#7b7766", "#182e36", 1.4);
    box(c, x - 25, y - 26, 50, 49, 2, "#dbcca5", "#ab9b7c", 1);
    for (const dy of [-10, 8])
      path(
        c,
        [
          [x - 24, y + dy],
          [x + 24, y + dy]
        ],
        null,
        "#aa997b66",
        1,
        false
      );
  });
  const prop = (i, fn, arg, scale = 1) => local(c, positions[i], y, scale, (ctx) => fn(ctx, arg));
  const crew = (i, role, dy = 0) => robot(c, models[role], positions[i], y + dy, 1);
  const marker = (i) =>
    path(
      c,
      [
        [positions[i] - 5, y - 38],
        [positions[i] + 5, y - 38],
        [positions[i], y - 32]
      ],
      "#ffe1a8"
    );
  if (scene === "switch") {
    crew(0, "lest");
    crew(2, "sonde");
    marker(0);
    crew(3, "lest");
    crew(5, "sonde");
    marker(5);
  }
  if (scene === "push") {
    crew(0, "lest");
    prop(1, crate);
    prop(2, plate, false);
    crew(4, "lest");
    prop(5, plate, true);
    prop(5, crate, null, 0.72);
  }
  if (scene === "relay") {
    crew(0, "sonde");
    prop(1, conduit);
    prop(2, relay, false);
    prop(3, conduit);
    crew(4, "sonde");
    prop(5, relay, true);
  }
  if (scene === "bridge") {
    crew(0, "sonde");
    prop(1, battery);
    prop(2, bridge, false);
    crew(3, "lest");
    prop(4, bridge, true);
    prop(5, beacon, false);
  }
  if (scene === "finish") {
    prop(0, winch, true);
    crew(0, "sonde", -4);
    prop(2, gate, true);
    crew(3, "lest");
    prop(5, beacon, true);
    marker(5);
  }
  oval(c, 220, 84, 16, 16, "#152f3a", "#6c9897", 1);
  path(
    c,
    [
      [211, 84],
      [228, 84],
      [222, 78]
    ],
    null,
    "#ffe0a3",
    2,
    false
  );
  path(
    c,
    [
      [228, 84],
      [222, 90]
    ],
    null,
    "#ffe0a3",
    2,
    false
  );
}
