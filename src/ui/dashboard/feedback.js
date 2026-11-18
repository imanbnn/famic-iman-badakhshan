import { BRIDGE_COST } from "#game/rules";
import { Terrain } from "#game/terrain";
import { byId, setText } from "#ui/dom";
import { t } from "#i18n/translate";
import { activePlates, gateOpen, displayCoordinates } from "#game/board";
import { nearbyDevice } from "#game/actions";

let notice;
const tones = {
  info: ["Consigne", "›"],
  move: ["Navigation", "→"],
  swap: ["Relève", "⇄"],
  success: ["Manœuvre réussie", "✓"],
  blocked: ["Manœuvre impossible", "×"],
  inspect: ["Repérage", "i"],
  undo: ["Retour en arrière", "↶"]
};

export function renderNotice() {
  if (!notice) return;
  const { text, tone, values, tail } = notice,
    [heading, icon] = tones[tone];
  const args = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, typeof v === "string" ? t(v) : v]));
  const report = t(text, args) + (tail ? " " + t(tail) : "");
  byId("signal").dataset.tone = tone;
  setText(byId("signal-title"), t(heading));
  setText(byId("signal-icon"), icon);
  setText(byId("status"), report);
}

export function message(text, tone = "info", values = {}, tail = "") {
  notice = { text, tone, values, tail };
  renderNotice();
}

export function instruction(session) {
  const { state, board } = session;
  if (
    board.watch >= 0 &&
    state.heroes.sonde === board.watch &&
    state.active === "lest" &&
    gateOpen(board, state)
  ) {
    return "{scout} tient le treuil. Rejoignez le phare avec {hauler}.";
  }
  const target = nearbyDevice(board, state);
  if (target !== undefined) {
    if (board.tiles[target] === Terrain.bridge)
      return state.energy >= BRIDGE_COST
        ? "Pont à portée. Utilisez Action pour le déployer."
        : "Pont à portée. Une pile est nécessaire.";
    return state.active === "sonde"
      ? "Relais à portée. Utilisez Action pour le brancher."
      : "Relais à portée. Confiez la commande à {scout} pour le brancher.";
  }
  return state.active === "lest"
    ? "{hauler} aux commandes. Avancez contre une caisse pour la pousser."
    : "{scout} aux commandes. Empruntez un conduit pour rejoindre le relais.";
}

export function reportMove(session, result, before) {
  const { state, board } = session,
    note = result.message;
  switch (result.sound) {
    case "bump":
      message(note, "blocked");
      return;
    case "swap":
      message(instruction(session), "swap");
      return;
    case "undo":
      message(note, "undo");
      return;
  }
  const wasOpen = gateOpen(board, before),
    isOpen = gateOpen(board, state);
  if (wasOpen && !isOpen) message("Écluse refermée. Vérifiez la feuille de route.", "blocked");
  else if (!wasOpen && isOpen) message(note, "success", {}, "Rejoignez le phare.");
  else if (result.sound === "plate" && !state.relay && activePlates(board, state) === board.plates.length) {
    message(
      board.plates.length === 1 ? "Plaque lestée." : "Plaques lestées.",
      "success",
      {},
      "Passez à {scout} pour brancher le relais."
    );
  } else if (note) message(note, result.sound ? "success" : "info");
  else if (result.sound === "push") message("Caisse avancée d’une case.", "move");
  else if (nearbyDevice(board, state) !== undefined) message(instruction(session));
  else {
    const pos = state.heroes[state.active];
    message("{name} · Colonne {col}, ligne {row}.", "move", {
      name: state.active === "lest" ? "{hauler}" : "{scout}",
      ...displayCoordinates(board, pos)
    });
  }
}
