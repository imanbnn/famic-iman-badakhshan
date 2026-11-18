import { watchHeld } from "#game/board";

function targets(kind, board, state) {
  switch (kind) {
    case "plates":
      return board.plates.filter((p) => !state.crates.includes(p));
    case "relay":
      return state.relay || board.relay < 0 ? [] : [board.relay];
    case "watch":
      return watchHeld(board, state) ? [] : [board.watch];
    case "exit":
      return board.exit < 0 ? [] : [board.exit];
    case "firstBridge":
    case "lastBridge": {
      const tile = kind === "firstBridge" ? board.bridgeSites[0] : board.bridgeSites.at(-1);
      return tile === undefined || state.bridges.includes(tile) ? [] : [tile];
    }
    default:
      throw new Error("Indice inconnu : " + kind);
  }
}

export function availableClues(level, board, state) {
  const clues = level.hints
    .map(([kind, text]) => ({ kind, text, points: targets(kind, board, state) }))
    .filter((clue) => clue.points.length);
  const first = board.bridgeSites[0],
    last = board.bridgeSites.at(-1);
  if (first !== last && state.energy === 0 && state.bridges.includes(last) && !state.bridges.includes(first)) {
    clues.unshift({
      kind: "firstBridge",
      text: "Le pont du phare a pris la charge de l’aller. Utilisez Annuler jusqu’à récupérer cette charge, puis réparez le pont indiqué.",
      points: [first]
    });
  }
  return clues;
}
