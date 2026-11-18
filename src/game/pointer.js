import { Terrain } from "#game/terrain";
import { STEPS, gateOpen, neighbor, otherHero } from "#game/board";
import { nearbyDevice, play } from "#game/actions";

const descriptions = {
  [Terrain.plate]: "{hauler} peut pousser une caisse sur cette plaque.",
  [Terrain.duct]: "Utilisez {scout} pour traverser ce passage étroit.",
  [Terrain.bridge]: "Approchez un robot du tablier pour le déployer avec une charge.",
  [Terrain.relay]: "{scout} peut brancher le relais depuis sa case ou depuis une case voisine.",
  [Terrain.gate]: "Suivez la feuille de route pour ouvrir l’écluse.",
  [Terrain.winch]: "Laissez un robot sur la pédale pour tenir l’écluse ouverte.",
  [Terrain.exit]: "Une fois l’écluse ouverte, rejoignez le phare avec un robot."
};

export function pointAt(board, state, tile) {
  if (tile === state.heroes[otherHero(state.active)]) return { kind: "swap", action: "swap" };
  const direction = Object.keys(STEPS).find((dir) => neighbor(board, state.heroes[state.active], dir) === tile);
  const action = nearbyDevice(board, state) === tile ? "act" : direction;
  if (action) {
    const result = play(board, state, action);
    if (result.sound === "bump") return { kind: "blocked", action };
    if (result.sound === "relay" || result.sound === "bridge") return { kind: result.sound, action };
    if (state.crates.includes(tile)) return { kind: "push", action, landing: neighbor(board, tile, direction) };
    if (result.sound === "cell") return { kind: "collect", action };
    if (result.state.won) return { kind: "finish", action };
    if (board.watch === tile) return { kind: "hold", action };
    return { kind: "move", action };
  }
  const terrain = board.tiles[tile];
  let text = descriptions[terrain];
  if (state.crates.includes(tile))
    text =
      terrain === Terrain.plate
        ? "Cette caisse maintient la plaque enfoncée. Laissez-la ici pour que l’écluse puisse s’ouvrir."
        : "Placez {hauler} à côté de la caisse, du côté opposé à sa destination. Cliquez ensuite sur la caisse pour la pousser.";
  else if (state.cells.includes(tile))
    text = "Les deux robots peuvent ramasser cette pile pour la réserve commune.";
  else if (tile === state.heroes[state.active])
    text = "Vous pilotez déjà ce robot. Choisissez une case voisine pour avancer.";
  else if (state.bridges.includes(tile)) text = "Les deux robots peuvent traverser ce pont.";
  else if (terrain === Terrain.relay && state.relay) text = "Le circuit de l’écluse est alimenté.";
  else if (terrain === Terrain.gate && gateOpen(board, state))
    text = "Les deux robots peuvent franchir cette écluse pour rejoindre le phare.";
  else if (terrain === Terrain.exit && gateOpen(board, state))
    text = "L’écluse est ouverte. Amenez un robot ici pour terminer l’escale.";
  if (text) return { kind: "inspect", text };
  return { kind: terrain === Terrain.water ? "water" : "quay" };
}
