import { Terrain } from "#game/terrain";
import { MAX_CHARGES, BRIDGE_COST, CHARGE_PER_BATTERY } from "#game/rules";
import { STEPS, gateOpen, neighbor, otherHero, watchHeld } from "#game/board";

const unchanged = (state, message) => ({ state, sound: "bump", message });
const changed = (state, sound, message = "") => ({ state, sound, message });

function barrier(board, state, pos, actor) {
  switch (board.tiles[pos]) {
    case undefined:
    case Terrain.water:
      return "Bord du quai. Cherchez un passage à sec.";
    case Terrain.duct:
      return actor === "sonde" ? "" : "Conduit étroit. Passez avec {scout}.";
    case Terrain.bridge:
      return state.bridges.includes(pos) ? "" : "Pont replié. Utilisez Action au bord du pont.";
    case Terrain.gate:
      if (!watchHeld(board, state)) return "Écluse fermée. Un robot doit tenir la pédale du treuil.";
      return gateOpen(board, state) ? "" : "Écluse fermée. Vérifiez les plaques et le relais.";
    default:
      return "";
  }
}

const CRATE_SURFACES = [Terrain.quay, Terrain.plate, Terrain.bridge];

function crateCanEnter(board, state, tile, teammate) {
  return (
    CRATE_SURFACES.includes(board.tiles[tile]) &&
    !barrier(board, state, tile, "crate") &&
    !state.crates.includes(tile) &&
    !state.cells.includes(tile) &&
    tile !== teammate
  );
}

function move(board, state, direction) {
  const hero = state.active;
  const to = neighbor(board, state.heroes[hero], direction);
  const friend = state.heroes[otherHero(hero)];
  const obstacle = barrier(board, state, to, hero);
  if (obstacle) return unchanged(state, obstacle);
  if (to === friend) return unchanged(state, "Votre équipier occupe cette case.");

  let crates = state.crates;
  let sound = "step";
  let message = "";
  if (crates.includes(to)) {
    if (hero !== "lest") return unchanged(state, "Cette caisse est trop lourde pour {scout}.");
    const end = neighbor(board, to, direction);
    if (!crateCanEnter(board, state, end, friend)) {
      return unchanged(state, "La caisse est bloquée de ce côté.");
    }
    crates = crates.map((p) => (p === to ? end : p));
    sound = board.plates.includes(end) ? "plate" : "push";
    if (sound === "plate") message = "Plaque lestée.";
  }

  const next = { ...state, crates, heroes: { ...state.heroes, [hero]: to }, moves: state.moves + 1 };
  if (next.cells.includes(to) && next.energy < MAX_CHARGES) {
    next.energy = Math.min(MAX_CHARGES, next.energy + CHARGE_PER_BATTERY);
    next.cells = next.cells.filter((p) => p !== to);
    sound = "cell";
    message = "Une charge ajoutée à la réserve commune.";
  }
  const isOpen = gateOpen(board, next);
  if (board.tiles[to] === Terrain.exit && isOpen) {
    next.won = true;
    return changed(next, "win", "Balise rallumée.");
  }
  const wasOpen = gateOpen(board, state);
  if (wasOpen && !isOpen) message = "Écluse refermée.";
  if (board.watch === to) message = "Treuil maintenu. Passez la main en restant sur la pédale.";
  if (!wasOpen && isOpen) {
    message = board.watch === to ? "Treuil maintenu. Écluse ouverte pour l’autre robot." : "Écluse ouverte.";
  }
  return changed(next, sound, message);
}

export function nearbyDevice(board, state) {
  const here = state.heroes[state.active];
  const available = (pos) =>
    (board.tiles[pos] === Terrain.relay && !state.relay) ||
    (board.tiles[pos] === Terrain.bridge && !state.bridges.includes(pos));
  if (available(here)) return here;
  for (const direction of Object.keys(STEPS)) {
    const tile = neighbor(board, here, direction);
    if (available(tile)) return tile;
  }
}

function operate(board, state) {
  const target = nearbyDevice(board, state);
  if (target === undefined) return unchanged(state, "Approchez-vous d’un relais ou d’un pont replié.");
  if (board.tiles[target] === Terrain.relay) {
    if (state.active !== "sonde") return unchanged(state, "Utilisez {scout} pour brancher le relais.");
    const next = { ...state, relay: true };
    return changed(next, "relay", gateOpen(board, next) ? "Relais branché. Écluse ouverte." : "Relais branché.");
  }
  if (state.energy < BRIDGE_COST)
    return unchanged(state, "Réserve vide. Ramassez une pile ou annulez le dernier coup.");
  return changed(
    { ...state, bridges: [...state.bridges, target], energy: state.energy - BRIDGE_COST },
    "bridge",
    "Pont déployé. Une charge utilisée."
  );
}

export function play(board, state, action) {
  if (state.won) return { state };
  if (Object.hasOwn(STEPS, action)) return move(board, state, action);
  if (action === "swap") return changed({ ...state, active: otherHero(state.active) }, "swap");
  if (action === "act") return operate(board, state);
  return { state };
}
