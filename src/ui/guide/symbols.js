import { local } from "#render/canvas";
import { crate, plate, conduit, battery, relay, bridge, gate, beacon, winch } from "#render/board/fixtures";
import { portrait } from "#render/robots/sprites";
import { crewName } from "#game/crew";
import { t } from "#i18n/translate";

const SYMBOL_SIZE_PX = 68;
const FIXTURE_SCALE = 1.18;

export const SYMBOLS = {
  crate: [crate, "Caisse", "{hauler} la pousse d’une case si la suivante est libre."],
  plate: [plate, "Plaque de lestage", "Une caisse doit rester dessus."],
  conduit: [conduit, "Conduit", "Le châssis de {scout} passe entre les barreaux."],
  relay: [relay, "Relais", "Avec {scout}, utilisez Action sur la case ou juste à côté."],
  battery: [battery, "Pile", "Marchez dessus pour récupérer une charge, jusqu’à trois."],
  bridge: [bridge, "Pont replié", "L’un ou l’autre robot peut le déployer avec Action depuis une case voisine."],
  gate: [
    gate,
    "Écluse",
    "Lestez les plaques et branchez le relais. À la dernière escale, un robot doit aussi tenir la pédale."
  ],
  winch: [winch, "Pédale du treuil", "Au cap, laissez un robot dessus pour tenir l’écluse ouverte."],
  beacon: [beacon, "Phare", "Rejoignez-le avec le robot de votre choix."]
};

export function symbolItem(id, crew, full = false) {
  const item = document.createElement("li"),
    icon = document.createElement("canvas"),
    copy = document.createElement("span");
  icon.width = icon.height = SYMBOL_SIZE_PX;
  icon.setAttribute("aria-hidden", "true");
  const name = document.createElement("strong"),
    detail = document.createElement("small");
  const isRobot = Object.hasOwn(crew, id);
  if (isRobot) {
    portrait(icon, crew[id]);
    name.textContent = crewName(crew, id);
    detail.textContent = t(id === "lest" ? "Pousse les caisses" : "Traverse les conduits");
  } else {
    const [draw, label, description] = SYMBOLS[id],
      c = icon.getContext("2d");
    if (id === "bridge") {
      c.fillStyle = "#24495a";
      c.fillRect(0, 0, icon.width, icon.height);
    }
    local(c, icon.width / 2, icon.height / 2, FIXTURE_SCALE, (ctx) => draw(ctx, false));
    name.textContent = t(label);
    detail.textContent = t(description);
  }
  copy.append(name);
  if (full || isRobot) copy.append(detail);
  item.append(icon, copy);
  return item;
}
