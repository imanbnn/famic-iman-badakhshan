import { FixtureLayer } from "#render/board/fixture-layer";
import { Terrain } from "#game/terrain";
import { HEROES, STEPS, neighbor } from "#game/board";
import { INK, PAPER, ORANGE, MINT, oval, path, local } from "#render/canvas";
import { pointAt } from "#game/pointer";
import { soundings } from "#render/harbour/soundings";
import { Tide } from "#render/harbour/water";
import { t } from "#i18n/translate";
import { sea } from "#render/harbour/sea";
import { markClue } from "#render/board/hint-marker";
import { drawBoardRobot } from "#render/robots/sprites";
import { crate } from "#render/board/fixtures";
import { chartViewport, TILE_SIZE as TILE, CHART_MARGIN as MARGIN } from "#render/board/viewport";
import { drawQuays } from "#render/board/quays";

const MOVE_DURATION_MS = 155;
const MOVE_EASING_POWER = 3;
const BUMP_DISTANCE_PX = 3;
const FULL_TURN = 2 * Math.PI;
const ARROW_OFFSET_PX = 20;

export class Chart {
  constructor(canvas, board, level, stage, crew) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.backdrop = document.getElementById("chart-backdrop");
    this.fixtures = new FixtureLayer(document.getElementById("chart-fixtures"), board, level, (tile) =>
      this.point(tile)
    );
    this.board = board;
    this.crew = crew;
    this.level = level;
    this.stage = stage;
    const land = (tile) => tile !== Terrain.water;
    const first = Math.floor(board.tiles.findIndex(land) / board.width);
    const last = Math.floor(board.tiles.findLastIndex(land) / board.width);
    this.docks = { first, count: last - first + 1 };
    this.highlights = [];
    this.tide = new Tide(document.getElementById("water-motion"));
    this.resize();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
  }

  resize(force = false) {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const view = chartViewport(this.board, this.docks, rect, window.devicePixelRatio);
    if (!force && this.view && Object.keys(view).every((key) => view[key] === this.view[key])) return;
    this.view = view;
    this.fixtures.invalidate();
    for (const layer of [this.canvas, this.backdrop, this.fixtures.canvas]) {
      layer.width = view.pixelWidth;
      layer.height = view.pixelHeight;
      layer
        .getContext("2d")
        .setTransform(view.pixelWidth / view.width, 0, 0, view.pixelHeight / view.height, 0, 0);
    }
    const background = this.backdrop.getContext("2d");
    sea(background, view.width, view.height, t(this.level.region), this.stage, () =>
      soundings(background, this.board, (tile) => this.point(tile), TILE, this.stage)
    );
    drawQuays(background, this.board, (tile) => this.point(tile));
    this.tide.fit(this);
    if (this.current) {
      cancelAnimationFrame(this.frame);
      this.paint(this.current, this.current, 1, "", "");
    }
  }

  point(pos) {
    return [
      this.view.originX + MARGIN + ((pos % this.board.width) + 0.5) * TILE,
      this.view.originY + MARGIN + (Math.floor(pos / this.board.width) + 0.5) * TILE
    ];
  }

  cellBounds(pos) {
    const [x, y] = this.point(pos);
    const { width, height } = this.view;
    return {
      left: ((x - TILE / 2) * 100) / width,
      top: ((y - TILE / 2) * 100) / height,
      width: (TILE * 100) / width,
      height: (TILE * 100) / height
    };
  }

  tileAt(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return this.tileAtPoint(
      ((clientX - rect.left) * this.view.width) / rect.width,
      ((clientY - rect.top) * this.view.height) / rect.height
    );
  }

  tileAtPoint(mapX, mapY) {
    const x = Math.floor((mapX - this.view.originX - MARGIN) / TILE);
    const y = Math.floor((mapY - this.view.originY - MARGIN) / TILE);
    if (x < 0 || y < 0 || x >= this.board.width || y >= this.board.height) return null;
    return y * this.board.width + x;
  }

  show(state, before = state, sound = "", reduced = false, direction = "") {
    this.current = state;
    this.highlights = [];
    cancelAnimationFrame(this.frame);
    const started = performance.now();
    const draw = (now) => {
      const t = reduced || !sound ? 1 : Math.min(1, (now - started) / MOVE_DURATION_MS);
      this.paint(state, before, t, sound, direction);
      if (t < 1) this.frame = requestAnimationFrame(draw);
    };
    draw(started);
  }

  drawRoutes(c, state) {
    if (state !== this.routeState) {
      this.routeState = state;
      this.routes = [];
      for (const [direction, [dx, dy]] of Object.entries(STEPS)) {
        const tile = neighbor(this.board, state.heroes[state.active], direction);
        if (tile < 0) continue;
        const choice = pointAt(this.board, state, tile);
        if (choice.action === direction && choice.kind !== "blocked") this.routes.push({ tile, dx, dy });
      }
    }
    for (const { tile, dx, dy } of this.routes) {
      const [cx, cy] = this.point(tile),
        x = cx - dx * ARROW_OFFSET_PX,
        y = cy - dy * ARROW_OFFSET_PX;
      c.save();
      c.translate(x, y);
      c.rotate(Math.atan2(dy, dx));
      oval(c, 0, 0, 5.3, 5.3, "#29424afa", "#f2dab2", 0.8);
      path(
        c,
        [
          [-1.1, -2.1],
          [1.4, 0],
          [-1.1, 2.1]
        ],
        null,
        "#fff1c9",
        1.2,
        false
      );
      c.restore();
    }
  }

  movingPoint(from, to, travel) {
    const end = this.point(to);
    if (from === to || travel === 1) return end;
    const start = this.point(from);
    return [start[0] + (end[0] - start[0]) * travel, start[1] + (end[1] - start[1]) * travel];
  }

  drawPilot(hero, active, point, recoil, direction, blocked) {
    const context = this.context;
    let [x, y] = point;
    if (active && blocked) {
      if (direction === "up" || direction === "down") y += recoil;
      else x += recoil;
    }
    oval(context, x, y + 15, 19, 5, "#493f3b55");
    if (active) {
      oval(context, x, y + 9, 22, 13, null, INK, 3.8);
      oval(context, x, y + 9, 22, 13, null, PAPER, 1.8);
    }
    drawBoardRobot(context, this.crew[hero], x, y - 2);
    if (active) {
      const color = blocked ? "#ff694e" : hero === "lest" ? ORANGE : MINT;
      path(
        context,
        [
          [x - 5, y - 31],
          [x + 5, y - 31],
          [x, y - 25]
        ],
        color,
        INK,
        1.5
      );
    }
  }

  paint(state, before, progress, sound, direction) {
    const context = this.context;
    context.clearRect(0, 0, this.view.width, this.view.height);
    this.fixtures.draw(this.view, state, before, progress);
    const travel = 1 - (1 - progress) ** MOVE_EASING_POWER;
    state.crates.forEach((tile, index) => {
      local(context, ...this.movingPoint(before.crates[index], tile, travel), 1, crate);
    });
    if (!state.won && progress === 1) this.drawRoutes(context, state);
    const blocked = sound === "bump" && progress < 1;
    const recoil = blocked ? Math.sin(progress * FULL_TURN) * BUMP_DISTANCE_PX : 0;
    for (const hero of HEROES) {
      const point = this.movingPoint(before.heroes[hero], state.heroes[hero], travel);
      this.drawPilot(hero, hero === state.active, point, recoil, direction, blocked);
    }
    for (const tile of this.highlights) markClue(context, ...this.point(tile));
  }

  highlight(state, points) {
    cancelAnimationFrame(this.frame);
    this.current = state;
    this.highlights = points;
    this.paint(state, state, 1, "", "");
  }

  stop() {
    cancelAnimationFrame(this.frame);
    this.tide.run(false);
    this.observer.disconnect();
  }
}
