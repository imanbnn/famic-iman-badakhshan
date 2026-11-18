export const lessons = [
  {
    scene: "switch",
    title: "Piloter les deux robots",
    body: "Cliquez sur une case voisine ou utilisez les touches de déplacement. Cliquez sur l’autre robot ou utilisez Relève pour en prendre les commandes.",
    alt: "{hauler} et {scout} sur deux quais voisins, avec une flèche de relève.",
    symbols: ["lest", "sonde"],
    controls: [
      ["Déplacer d’une case", "left", "up", "down", "right"],
      ["Changer de robot", "swap"]
    ]
  },
  {
    scene: "push",
    title: "Lester une plaque",
    body: "Placez {hauler} à côté de la caisse. Survolez-la pour voir sa destination en pointillés. Cliquez sur la caisse ou avancez contre elle au clavier pour la pousser sur la plaque rayée.",
    alt: "{hauler} pousse une caisse vers une plaque, puis la caisse repose sur la plaque.",
    symbols: ["crate", "plate"],
    controls: [
      ["Pousser vers la droite", "right"],
      ["Annuler la dernière poussée", "undo"]
    ]
  },
  {
    scene: "relay",
    title: "Atteindre le relais",
    body: "{scout} se glisse dans les conduits. Arrêtez-vous sur le relais ou juste à côté, puis utilisez Action.",
    alt: "{scout} traverse un conduit et le relais passe de gris à vert.",
    symbols: ["conduit", "relay"],
    controls: [
      ["Passer à {scout}", "swap"],
      ["Brancher le relais à portée", "act"]
    ]
  },
  {
    scene: "bridge",
    title: "Partager les charges",
    body: "Une pile alimente les deux robots. Au bord du pont, utilisez Action pour dépenser une charge et déployer le passage.",
    alt: "Une pile, un pont replié, puis le même pont déployé.",
    symbols: ["battery", "bridge"],
    controls: [
      ["Marcher sur la pile", "left", "up", "down", "right"],
      ["Déployer le pont depuis le bord", "act"]
    ]
  },
  {
    scene: "finish",
    title: "Rallumer le phare",
    body: "Lorsque les plaques et le relais sont actifs, rejoignez le phare. À la dernière escale, laissez aussi un robot sur la pédale du treuil.",
    alt: "{scout} tient la pédale, pendant que {hauler} atteint le phare allumé.",
    symbols: ["winch", "gate", "beacon"],
    controls: [
      ["Passer la main sur le treuil", "swap"],
      ["Recommencer cette escale", "restart"]
    ]
  }
];
