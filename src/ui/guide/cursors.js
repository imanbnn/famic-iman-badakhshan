import { t } from "#i18n/translate";

const meanings = {
  move: ["Avancer", "Cliquez sur la case indiquée. Votre robot y avance d’un pas."],
  push: [
    "Pousser une caisse",
    "Cliquez sur la caisse. {hauler} la pousse d’une case dans le sens de la flèche, jusqu’au contour pointillé."
  ],
  inspect: ["Examiner un objet", "Cliquez sur l’objet avec la loupe pour lire son rôle sous la carte."],
  blocked: ["Passage bloqué", "Cliquez sur l’obstacle pour savoir ce qui bloque le passage."],
  swap: ["Changer de robot", "Cliquez sur votre équipier pour le piloter. Le premier robot reste sur sa case."],
  collect: [
    "Ramasser la pile",
    "Cliquez sur la pile pour la ramasser. Elle ajoute une charge à la réserve commune."
  ],
  relay: ["Brancher le relais", "Cliquez sur le relais. {scout} le branche et alimente le circuit de l’écluse."],
  bridge: [
    "Déployer le pont",
    "Cliquez sur le pont replié. Une charge de la réserve ouvre le passage pour les deux robots."
  ],
  hold: [
    "Maintenir la pédale",
    "Cliquez sur la pédale pour y placer votre robot. Laissez-le dessus pendant que son équipier passe."
  ],
  finish: ["Rallumer le phare", "Cliquez sur le phare pour y avancer et terminer l’escale."],
  water: ["Eau libre", "Les robots restent sur les quais. Choisissez une case de quai voisine pour avancer."],
  quay: ["Quai hors de portée", "Rapprochez-vous en cliquant sur les cases voisines du robot, une à la fois."]
};

export function cursorIcon(choice) {
  return choice.kind === "move" || choice.kind === "push" ? choice.kind + "-" + choice.action : choice.kind;
}

export function cursorEntries(cursors) {
  return Object.entries(meanings).map(([kind, [name, meaning]]) => {
    const row = document.createElement("li"),
      sample = document.createElement("span"),
      copy = document.createElement("div");
    const title = document.createElement("strong"),
      detail = document.createElement("p"),
      heading = document.createElement("div");
    const directional = kind === "move" || kind === "push";
    const icons = directional ? ["right", "up", "down", "left"].map((dir) => kind + "-" + dir) : [kind];
    sample.className = "cursor-sample";
    heading.className = "cursor-entry-title";
    heading.append(title);
    for (const id of icons) {
      const image = document.createElement("img");
      image.alt = "";
      image.src = cursors[id].src;
      if (id === icons[0]) sample.append(image);
      else heading.append(image);
    }
    title.textContent = t(name);
    detail.textContent = t(meaning);
    row.dataset.kind = kind;
    copy.append(heading, detail);
    row.append(sample, copy);
    return row;
  });
}
