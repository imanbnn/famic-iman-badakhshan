import { Terrain } from "#game/terrain";
import { byId, setText } from "#ui/dom";
import { MAX_CHARGES, BRIDGE_COST } from "#game/rules";
import { activePlates, watchHeld, displayCoordinates } from "#game/board";
import { nearbyDevice } from "#game/actions";
import { portrait } from "#render/robots/sprites";
import { t } from "#i18n/translate";
const actionButton = document.querySelector('[data-action="act"]');
const undoButton = document.querySelector('[data-action="undo"]');
const roster = [...document.querySelectorAll("[data-hero]")];
const heroName = (role) => t(role === "lest" ? "{hauler}" : "{scout}");

export function showCrew(crew) {
  for (const button of roster) {
    const role = button.dataset.hero;
    button.querySelector("strong").textContent = heroName(role);
    portrait(byId("portrait-" + role), crew[role]);
  }
}

function showGoals(board, state) {
  const lit = activePlates(board, state),
    total = board.plates.length;
  const tasks = [
    [total === 1 ? t("Lester la plaque") : t("Lester les plaques ({lit}/{total})", { lit, total }), lit === total],
    [t("Brancher le relais"), state.relay]
  ];
  if (board.watch >= 0) tasks.push([t("Tenir la pédale du treuil"), watchHeld(board, state)]);
  tasks.push([t("Rejoindre le phare"), state.won]);
  byId("goal-count").textContent = tasks.filter(([, done]) => done).length + " / " + tasks.length;
  const goals = byId("goals");
  if (goals.children.length !== tasks.length) {
    goals.replaceChildren(
      ...tasks.map(() => {
        const row = document.createElement("li");
        row.append(document.createElement("span"), document.createElement("small"));
        return row;
      })
    );
  }
  tasks.forEach(([label, done], i) => {
    const row = goals.children[i];
    row.firstChild.textContent = label;
    row.lastChild.textContent = t(done ? "Atteint" : "À faire");
    row.classList.toggle("done", done);
    row.setAttribute("aria-label", t(done ? "{label}, terminé" : "{label}, à faire", { label }));
  });
}

function showDevice(board, state) {
  const device = board.tiles[nearbyDevice(board, state)];
  let label = "Action",
    help = "Approchez un robot d’un pont ou d’un relais.";
  let enabled = false;
  if (device === Terrain.bridge) {
    label = "Déployer le pont";
    enabled = state.energy >= BRIDGE_COST;
    help = enabled ? label : "Ramassez une pile pour déployer le pont.";
  } else if (device === Terrain.relay) {
    enabled = state.active === "sonde";
    if (enabled) label = "Brancher le relais";
    help = enabled ? label : "{scout} peut brancher ce relais.";
  }
  setText(byId("act-label"), t(label));
  actionButton.disabled = !enabled;
  actionButton.title = t(help);
}

function showPilot(role) {
  byId("pilot-name").textContent = heroName(role);
  byId("pilot-name").parentElement.style.setProperty("--pilot", role === "lest" ? "var(--orange)" : "var(--mint)");
  for (const button of roster) {
    const active = role === button.dataset.hero;
    button.setAttribute("aria-pressed", String(active));
    button.disabled = active;
    button.title = active
      ? t("Robot aux commandes")
      : t("Prendre les commandes de {name}", { name: heroName(button.dataset.hero) });
  }
}

function showReserve(energy) {
  const meter = byId("charge-meter");
  byId("charge-count").textContent = energy + " / " + MAX_CHARGES;
  meter.setAttribute("aria-valuenow", String(energy));
  [...meter.children].forEach((bar, i) => bar.classList.toggle("full", i < energy));
}

export function renderHud(session, previous) {
  const { board, state } = session;
  showDevice(board, state);
  if (!previous || previous.active !== state.active) showPilot(state.active);
  if (!previous || previous.energy !== state.energy) showReserve(state.energy);
  if (
    !previous ||
    previous.crates !== state.crates ||
    previous.relay !== state.relay ||
    previous.won !== state.won ||
    watchHeld(board, previous) !== watchHeld(board, state)
  ) {
    showGoals(board, state);
  }
  const steps =
    state.moves === 1 && document.documentElement.lang === "en" ? t("Un pas") : t("{n} pas", { n: state.moves });
  setText(byId("move-count"), steps);
  undoButton.disabled = session.history.length === 0;
  const pos = state.heroes[state.active];
  byId("board").setAttribute(
    "aria-label",
    t("Carte de {level}. Robot actif {hero}, colonne {col}, ligne {row}.", {
      level: byId("title").textContent,
      hero: heroName(state.active),
      ...displayCoordinates(board, pos)
    })
  );
}
