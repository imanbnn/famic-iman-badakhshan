import { Terrain, SPAWN_TILES } from "#game/terrain";
export const HEROES = ["lest", "sonde"];
export const STEPS = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };

export function readBoard(level) {
  const rows = level.map;
  const width = rows[0].length;
  if (rows.some((row) => row.length !== width)) throw new Error("Carte irrégulière");
  const tiles = [...rows.join("")];
  const positions = (symbol) => tiles.flatMap((tile, i) => (tile === symbol ? [i] : []));
  const starts = { lest: tiles.indexOf(Terrain.haulerStart), sonde: tiles.indexOf(Terrain.scoutStart) };
  return {
    width,
    height: rows.length,
    starts,
    watch: tiles.indexOf(Terrain.winch),
    exit: tiles.indexOf(Terrain.exit),
    relay: tiles.indexOf(Terrain.relay),
    bridgeSites: positions(Terrain.bridge),
    crates: positions(Terrain.crate),
    cells: positions(Terrain.battery),
    plates: positions(Terrain.plate),
    tiles: tiles.map((tile) => (SPAWN_TILES.includes(tile) ? Terrain.quay : tile))
  };
}

export function displayCoordinates(board, position) {
  return { col: (position % board.width) + 1, row: Math.floor(position / board.width) + 1 };
}

export function neighbor(board, pos, direction) {
  const [dx, dy] = STEPS[direction];
  const x = (pos % board.width) + dx;
  const y = Math.floor(pos / board.width) + dy;
  return x < 0 || x >= board.width || y < 0 || y >= board.height ? -1 : y * board.width + x;
}

export function newState(board, reserve, active = "lest") {
  return {
    active,
    heroes: { ...board.starts },
    energy: reserve,
    crates: [...board.crates],
    cells: [...board.cells],
    bridges: [],
    relay: false,
    won: false,
    moves: 0
  };
}

export const otherHero = (hero) => (hero === "lest" ? "sonde" : "lest");
export const activePlates = (board, state) => board.plates.filter((p) => state.crates.includes(p)).length;
export function watchHeld(board, state) {
  return board.watch < 0 || state.heroes.lest === board.watch || state.heroes.sonde === board.watch;
}

export function gateOpen(board, state) {
  return state.relay && activePlates(board, state) === board.plates.length && watchHeld(board, state);
}
