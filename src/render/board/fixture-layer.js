import { Terrain, FIXTURE_TILES } from "#game/terrain";
import { gateOpen, watchHeld } from "#game/board";
import { local } from "#render/canvas";
import { plate, battery, relay, bridge, gate, beacon, winch } from "#render/board/fixtures";
import { lightBeam } from "#render/harbour/soundings";

const BEAM_ANGLES = { dryDock: -0.45, twinChannels: -2.7, lastLight: -0.65 };

export class FixtureLayer {
  constructor(canvas, board, level, point) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.board = board;
    this.point = point;
    this.fixtures = board.tiles.flatMap((tile, position) =>
      FIXTURE_TILES.includes(tile) ? [{ tile, position }] : []
    );
    this.beamAngle = BEAM_ANGLES[level.id];
  }

  invalidate() {
    this.lastState = null;
  }

  draw(view, state, before, progress) {
    const last = this.lastState;
    const bridgeOpening = progress < 1 && state.bridges.length > before.bridges.length;
    if (
      !bridgeOpening &&
      last &&
      last.cells === state.cells &&
      last.crates === state.crates &&
      last.bridges === state.bridges &&
      last.relay === state.relay &&
      watchHeld(this.board, last) === watchHeld(this.board, state)
    )
      return;
    this.lastState = bridgeOpening ? null : state;
    const context = this.context;
    context.clearRect(0, 0, view.width, view.height);
    const open = gateOpen(this.board, state);
    if (open) lightBeam(context, ...this.point(this.board.exit), this.beamAngle);
    for (const { position, tile } of this.fixtures) {
      const [x, y] = this.point(position);
      local(context, x, y, 1, (pen) => {
        switch (tile) {
          case Terrain.plate:
            plate(pen, state.crates.includes(position));
            break;
          case Terrain.bridge:
            bridge(pen, state.bridges.includes(position), before.bridges.includes(position) ? 1 : progress);
            break;
          case Terrain.relay:
            relay(pen, state.relay);
            break;
          case Terrain.gate:
            gate(pen, open);
            break;
          case Terrain.winch:
            winch(pen, watchHeld(this.board, state));
            break;
          case Terrain.exit:
            beacon(pen, open);
            break;
        }
      });
    }
    for (const tile of state.cells) local(context, ...this.point(tile), 1, battery);
  }
}
