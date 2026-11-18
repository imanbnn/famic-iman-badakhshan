import { wireAmbience } from "#app/ambience";
import { message, renderNotice, instruction, reportMove } from "#ui/dashboard/feedback";
import { wireHome } from "#ui/controls/home";
import { wireKeyboard } from "#ui/controls/keyboard";
import { byId } from "#ui/dom";
import { Logbook } from "#game/logbook";
import { openLogbook } from "#ui/dashboard/logbook";
import { boardInput } from "#ui/controls/board-pointer";
import { chartCursors } from "#render/cursors";
import { wireMapLegends } from "#ui/guide/legends";
import { mapHints } from "#ui/guide/map-hints";
import { wirePiloting } from "#ui/controls/focus";
import { Session } from "#game/session";
import { Chart } from "#render/board/chart";
import { LEVELS, FIRST_STAGE } from "#game/levels";
import { preferences, savePreferences } from "#app/preferences";
import { wirePanels } from "#ui/setup/settings";
import { wireLessons } from "#ui/guide/guide";
import { setupDeparture } from "#ui/setup/departure";
import { wireHangar } from "#ui/setup/hangar";
import { bindMarkup, useCrew, useLanguage } from "#i18n/translate";
import { initHud, renderStageHeader, showArrival } from "#ui/dashboard/stages";
import { renderHud, showCrew } from "#ui/dashboard/status";
import { showSettings } from "#ui/setup/control-labels";

const prefs = preferences();
let storage;
try {
  storage = window.localStorage;
} catch {}
const logbook = new Logbook(storage),
  sessions = [];
const localize = bindMarkup(document.body);
let session,
  chart,
  stage = FIRST_STAGE,
  finalArrival = false;
const { motion, updateWater, syncMusic, playEffect } = wireAmbience(prefs, () => ({ chart, session, stage }));
const cursors = chartCursors();
const pointer = boardInput(
  byId("board"),
  cursors,
  () => ({ chart, session }),
  act,
  (tile, choice) => {
    hints.dismiss();
    chart.highlight(session.state, [tile]);
    message(choice.text, "inspect");
  }
);
const pilot = wirePiloting(() => session && !session.state.won && !byId("game").hidden, syncMusic);
const hints = mapHints(() => ({ stage, session, chart, reduced: motion.matches }), focusBoard, pointer.clear);

function focusBoard() {
  pilot.focus();
}

function hasVoyage() {
  return Boolean(session) || logbook.lights.some(Boolean);
}
const homeTip = wireHome({ hasVoyage, hasSession: () => Boolean(session), focusBoard, restartVoyage });

function enter(index, { restart = false } = {}) {
  if (byId("finish").open) byId("finish").close();
  hints.dismiss();
  stage = index;
  const saved = sessions[index];
  const resume = saved && !saved.state.won && !restart;
  if (saved && !resume) saved.restart();
  session = sessions[index] = saved ?? new Session(LEVELS[index], prefs.starter);
  if (chart?.board !== session.board) {
    chart?.stop();
    chart = new Chart(byId("board"), session.board, LEVELS[index], index, prefs.crew);
  }
  renderStageHeader(stage, logbook.lights);
  renderHud(session);
  chart.show(session.state);
  pointer.refresh();
  updateWater();
  homeTip();
  pilot.update();
  syncMusic();
  if (resume)
    message("Reprise de l’escale. {name} est aux commandes.", "info", {
      name: session.state.active === "lest" ? "{hauler}" : "{scout}"
    });
  else if (index === FIRST_STAGE && session.state.active === "sonde") message(instruction(session));
  else message(LEVELS[index].order);
}

function changeStage(index, event) {
  if (index !== stage || session?.state.won) enter(index);
  if (event?.detail > 0) focusBoard();
}

function act(action) {
  if (!session) return;
  if (action === "restart") {
    enter(stage, { restart: true });
    return;
  }
  if (session.state.won) return;
  hints.dismiss();
  const before = session.state,
    result = session.input(action);
  chart.show(session.state, before, result.sound, motion.matches, action);
  if (before !== session.state) renderHud(session, before);
  reportMove(session, result, before);
  pointer.refresh();
  playEffect(result.sound, session.state.active, session.state.moves);
  if (session.state.won) {
    const previouslyComplete = logbook.lights.every(Boolean);
    logbook.record(stage, session.state.moves);
    finalArrival = logbook.lights.every(Boolean) && (!previouslyComplete || stage === LEVELS.length - 1);
    showArrival(stage, session.state.moves, logbook, finalArrival);
    updateWater();
    pilot.update();
  }
}

initHud(changeStage);
const settings = wirePanels(prefs, () => {
  showSettings(prefs);
  updateWater();
});
const lesson = wireLessons(prefs);
wireMapLegends(cursors, () => prefs.crew, focusBoard);
const departure = setupDeparture(prefs, refresh);
const hangar = wireHangar(
  prefs,
  () => session?.state.active ?? prefs.starter,
  (crew) => {
    prefs.crew = crew;
    savePreferences(prefs);
    refresh("crew");
  }
);
function refresh(key) {
  const languageChanged = !key || key === "lang";
  const crewChanged = !key || key === "crew";
  if (languageChanged) useLanguage(prefs.lang);
  if (crewChanged) useCrew(prefs.crew);
  if (languageChanged) localize();
  departure();
  if (languageChanged || crewChanged) {
    hangar();
    showCrew(prefs.crew);
    settings();
    lesson();
    showSettings(prefs);
    homeTip();
  }
  updateWater();
  if (!session) return;
  if (languageChanged) {
    renderStageHeader(stage, logbook.lights);
    chart.resize(true);
  }
  if (languageChanged || crewChanged) {
    renderHud(session);
    renderNotice();
    hints.render();
  }
  pointer.clear();
  if (key === "crew") {
    chart.crew = prefs.crew;
    chart.highlight(session.state, chart.highlights);
  }
}
refresh();
byId("start-game").onclick = () => {
  byId("launch").hidden = true;
  byId("game").hidden = false;
  byId("journal-open").hidden = false;
  enter(FIRST_STAGE);
  focusBoard();
};
byId("journal-open").onclick = () => openLogbook(byId("journal"), logbook, stage, changeStage, sessions);
for (const button of document.querySelectorAll("[data-action]")) {
  button.addEventListener("click", (event) => {
    act(button.dataset.action);
    if (event.detail > 0 && !document.querySelector("dialog[open]")) focusBoard();
  });
}
for (const button of document.querySelectorAll("[data-hero]")) {
  button.onclick = (event) => {
    if (session.state.active !== button.dataset.hero) act("swap");
    if (event.detail > 0) focusBoard();
  };
}
function restartVoyage() {
  hints.dismiss();
  pointer.clear();
  chart?.stop();
  chart = undefined;
  session = undefined;
  sessions.length = 0;
  stage = FIRST_STAGE;
  finalArrival = false;
  logbook.restartVoyage();
  byId("game").hidden = true;
  byId("journal-open").hidden = true;
  byId("launch").hidden = false;
  pilot.update();
  syncMusic();
  refresh();
}
byId("finish").addEventListener("cancel", (event) => event.preventDefault());
byId("next").onclick = () => {
  let next = finalArrival ? FIRST_STAGE : (stage + 1) % LEVELS.length;
  if (sessions[next]?.state.won && logbook.lights.includes(false)) next = logbook.next;
  enter(next);
  focusBoard();
};

wireKeyboard(prefs, () => Boolean(session), act, focusBoard);
