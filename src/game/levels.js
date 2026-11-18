export const FIRST_STAGE = 0;

export const LEVELS = [
  {
    id: "dryDock",
    name: "La cale sèche",
    region: "Bassin ouest",
    reserve: 1,
    brief: "Le traversier attend au large. Ouvrez-lui la première écluse.",
    order: "Poussez la caisse vers la droite avec {hauler}. Cliquez sur une case voisine ou utilisez les flèches.",
    hints: [
      ["plates", "Poussez la caisse vers la plaque rayée, à droite."],
      ["relay", "Avec {scout}, remontez le conduit bleu et branchez le relais."],
      ["firstBridge", "Depuis le bord, utilisez Action pour déployer le tablier du pont."],
      ["exit", "Quand l’écluse est ouverte, amenez un robot au phare."]
    ],
    map: [
      "~~~~~~~~~~~~~~~",
      "~~~~~~..v.~~~~~",
      "~~~~~~n~~~~~~~~",
      "~~.+.S.~~~~~~~~",
      "~.......~~~.E.~",
      "~.L.c.p.b.g...~",
      "~~.....~~~~..~~",
      "~~~~~~~~~~~~~~~",
      "~~~~~~~~~~~~~~~"
    ]
  },
  {
    id: "twinChannels",
    name: "Les deux passes",
    region: "Canal des brisants",
    reserve: 1,
    brief: "La brume tombe sur le chenal. Deux ponts en panne, une seule charge.",
    order: "Inspectez les deux ponts avant de dépenser la charge de départ.",
    hints: [
      ["firstBridge", "Réparez le pont nord en premier. La pile de rechange se trouve sur l’autre rive."],
      ["plates", "Poussez la caisse vers la droite. Glissez-vous dessous pour la pousser vers le haut."],
      ["relay", "Avec {scout}, franchissez le conduit du quai nord pour atteindre le relais."],
      ["lastBridge", "La pile du quai nord permet à {hauler} de déployer le second pont."],
      ["exit", "L’écluse donne sur le quai du phare, au sud-est."]
    ],
    map: [
      "~~~~~~~~~~~~~~~",
      "~~~~.+..~..v.~~",
      "~~~~b~..n...~~~",
      "~~S...~~~~.~~~~",
      "~....p.~~~~~..~",
      "~..Lc..~~~~~..~",
      "~~......b.g...~",
      "~~....~~~~~.E.~",
      "~~~~~~~~~~~~~~~"
    ]
  },
  {
    id: "lastLight",
    name: "Le dernier feu",
    region: "Pointe du levant",
    reserve: 0,
    brief: "Au cap, le treuil ne tient plus. Un robot devra rester de quart.",
    order: "Lestez les deux plaques. {scout} peut récupérer les piles pour alimenter les ponts.",
    hints: [
      ["plates", "Poussez une caisse vers le haut. Pour la seconde, commencez par la décaler vers la droite."],
      ["firstBridge", "Prenez la pile du quai de départ et déployez le pont est."],
      ["relay", "Envoyez {scout} au sud du conduit. Ramassez la seconde pile et branchez le relais."],
      [
        "watch",
        "Placez {scout} sur la pédale ronde au sud-est. Laissez le robot à son poste et passez à {hauler}."
      ],
      [
        "lastBridge",
        "Avec {hauler}, approchez du pont du phare. La pile prise par {scout} alimente les deux robots."
      ],
      ["exit", "Les deux robots restent en liaison. Rejoignez la pointe avec {hauler}."]
    ],
    map: [
      "~~~~~~~~~~~~~~~",
      "~~.p...S~~~...~",
      "~.Lc.c.+.b....~",
      "~.....p.~~...~~",
      "~~~~~g~~~~~n~~~",
      "~...b.~~~~..+.~",
      "~...~~~~~v....~",
      "~~E.~~~~~~..w~~",
      "~~~~~~~~~~~~~~~"
    ]
  }
];
