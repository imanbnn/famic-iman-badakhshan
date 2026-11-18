export const Terrain = {
  water: "~",
  quay: ".",
  duct: "n",
  plate: "p",
  bridge: "b",
  relay: "v",
  gate: "g",
  winch: "w",
  exit: "E",
  crate: "c",
  battery: "+",
  haulerStart: "L",
  scoutStart: "S"
};

export const SPAWN_TILES = [Terrain.crate, Terrain.battery, Terrain.haulerStart, Terrain.scoutStart];
export const FIXTURE_TILES = [
  Terrain.plate,
  Terrain.bridge,
  Terrain.relay,
  Terrain.gate,
  Terrain.winch,
  Terrain.exit
];
