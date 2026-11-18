# Contreflot

Un traversier attend au large. Pour le ramener au port, deux robots doivent rallumer trois phares. L’un pousse les caisses. L’autre traverse les conduits et branche les relais. Ils partagent la même réserve de charges.

## Jouer

1. Ouvrez [le fichier du jeu](dist/index.html) sur GitHub et cliquez sur **Download raw file** (la flèche de téléchargement).
2. Ouvrez le fichier HTML téléchargé dans votre navigateur. Le jeu fonctionne hors ligne.

[Voir la démonstration de Contreflot en vidéo](video/contreflot-demonstration.mp4)

Choisissez un duo parmi les 24 robots du **Hangar**, puis le robot qui prend le premier quart. **Embarquer** ouvre toujours **La cale sèche**, même si vous avez déjà joué. Le journal conserve vos meilleurs trajets. Les numéros 01, 02 et 03 permettent de changer d’escale pendant une partie.

## Commandes

| Geste | Clavier par défaut | Souris ou écran tactile |
| --- | --- | --- |
| Avancer ou pousser une caisse | Flèches | Sélectionnez la case voisine ou la caisse. |
| Changer de robot | Espace | Sélectionnez votre équipier ou **Relève**. |
| Brancher un relais ou déployer un pont à portée | E | Sélectionnez l’objet ou **Action**. |
| Annuler le dernier coup | U | **Annuler** |
| Recommencer l’escale | R | **Rejouer** |

Les touches sont modifiables dans **Réglages**. Après un passage dans les menus, **Reprendre le jeu** rend les commandes au robot. Une flèche et une caisse en pointillés indiquent la destination d’une poussée. La loupe permet d’examiner un objet.

Le **Guide pas à pas** illustre les manœuvres et affiche les touches choisies. **Symboles de la carte** et **Signification des curseurs** ouvrent les deux légendes. **Échap** ferme la légende et ramène à l’étape en cours. En jeu, **Demander un indice** place une explication près de l’objet concerné.

Le sélecteur **FR | EN** change la langue. Le jeu propose trois thèmes, dont **Minuit** au départ, des bruitages et une musique activable. Il respecte la préférence de mouvement de l’appareil.

## Règles et escales

- Le robot de manutention pousse une caisse d’une case. Une caisse doit rester sur chaque plaque pour la maintenir enfoncée.
- Le robot d’exploration peut emprunter les conduits et brancher le relais. La relève conserve la position des deux robots.
- Chaque pont coûte une charge. Les deux robots peuvent ramasser des piles et dépenser la réserve commune, limitée à trois charges. Si elle est pleine, la pile reste sur le quai.
- Une fois l’écluse ouverte, amenez l’un des robots au phare. Le redémarrage remet les robots, les caisses, les mécanismes et les charges dans leur état initial.

| Escale | Manœuvre à découvrir |
| --- | --- |
| La cale sèche | Pousser une caisse sur une plaque, puis envoyer l’autre robot brancher le relais. |
| Les deux passes | Choisir quel pont réparer avec l’unique charge de départ. |
| Le dernier feu | Laisser un robot sur la pédale du treuil pendant que l’autre passe l’écluse. |

## Play in English

Select **EN**, choose your crew and press **Set sail** to start at the dry dock. The arrow keys move, **Space** switches robots, **E** operates a relay or bridge, **U** undoes a move and **R** restarts the stop. Use **Settings** to rebind the keys. The illustrated **Guide**, **Symbols** and **Cursors** are available in English.

## Organisation du code

| Dossier | Contenu |
| --- | --- |
| `src/game/` | Cartes, déplacements, collisions, réserve, annulation et scores. |
| `src/app/` | Démarrage, changements d’escale et préférences enregistrées. |
| `src/ui/`, `src/views/`, `src/styles/` | Commandes, guide, tableau de bord, HTML et styles de ces écrans. |
| `src/render/` | Dessins du plateau, des robots et du port. |
| `src/audio/`, `src/i18n/` | Bruitages, partition originale et traductions. |
| `tests/` | Tests unitaires, parcours en navigateur et mesure des temps d’image. |

Avec Node.js 22, `npm test` lance les tests unitaires et `npm run build` reconstruit le fichier autonome. Ces deux commandes fonctionnent hors ligne. `npm run lint` vérifie le code avec Oxlint.

## Vérification du défi Famic

| Critère | Ce que vérifient les essais |
| --- | --- |
| Mécaniques imposées | Chaque escale se termine avec chacun des deux rôles au départ. Les essais contrôlent la poussée, le relais, la dépense et la collecte des charges, la sortie et la remise à zéro. |
| Stabilité | Les trois escales se jouent hors ligne dans quatre navigateurs. Les tests du moteur vérifient les collisions et la conservation des objets et des charges sur 120 000 actions. |
| Performance | Le parcours chronométré relève les temps d’image des trois escales, y compris pendant les déplacements et le démarrage de la musique. |
| Progression | Le premier quai enseigne la relève, le deuxième impose un choix de pont et le troisième demande de maintenir le treuil à distance. |
| Commandes et accessibilité | Les essais couvrent les touches personnalisées, les signaux de blocage, les légendes bilingues, le toucher et le retour au clavier. Une réouverture après deux escales terminées doit commencer au premier quai et conserver les deux records. |

Pour lancer les parcours avec Chrome ou Edge, installez Playwright une fois, puis exécutez les commandes suivantes depuis le dépôt.

```sh
npm install --no-save --package-lock=false --ignore-scripts playwright-core@1.56.1
node tests/browser/run.mjs
node tests/performance/frame-times.mjs
```

Le banc de performance joue les trois escales avec l’eau animée, les bruitages et la musique. Il mesure la cadence et les images longues sur Chrome, à vitesse normale et avec un ralentissement CPU ×4. Un chemin vers un ancien fichier HTML peut être passé en argument pour comparer deux versions sur la même machine.

## Crédits

Réalisé pour le défi **Différents Ensemble** de Famic. Les cartes, les décors, les robots et les curseurs sont dessinés pour le jeu avec Canvas 2D. Les bruitages et la musique *Le quart des lanternes* sont synthétisés avec Web Audio. L’interface utilise les polices du système.
