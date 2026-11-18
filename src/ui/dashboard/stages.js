import { byId } from "#ui/dom";
import { MAX_CHARGES } from "#game/rules";
import { LEVELS } from "#game/levels";
import { drawInstruments } from "#render/icons";
import { port } from "#render/harbour/panorama";
import { t } from "#i18n/translate";

const formatStageNumber = (number) => String(number).padStart(2, "0");

export function initHud(changeStage) {
  drawInstruments();
  for (const i of LEVELS.keys()) {
    const step = document.createElement("li"),
      button = document.createElement("button");
    button.textContent = formatStageNumber(i + 1);
    button.addEventListener("click", (event) => changeStage(i, event));
    step.append(button);
    byId("progress").append(step);
  }
  const meter = byId("charge-meter");
  meter.setAttribute("aria-valuemax", String(MAX_CHARGES));
  for (let i = 0; i < MAX_CHARGES; i++) meter.append(document.createElement("i"));
}

export function renderStageHeader(stage, lights) {
  const level = LEVELS[stage];
  port(byId("harbour"), stage, lights);
  byId("chapter-no").textContent = formatStageNumber(stage + 1);
  byId("region").textContent = t(level.region);
  byId("title").textContent = t(level.name);
  byId("brief").textContent = t(level.brief);
  [...byId("progress").querySelectorAll("button")].forEach((button, i) => {
    const name = t("Escale {n} · {level}", { n: i + 1, level: t(LEVELS[i].name) });
    button.setAttribute("aria-label", name);
    button.title = name;
    button.classList.toggle("done", lights[i]);
    if (i === stage) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
}

export function showArrival(stage, moves, logbook, last) {
  const all = logbook.lights.every(Boolean);
  port(byId("arrival"), stage, logbook.lights);
  byId("finish-kicker").textContent = all
    ? t("{total} escales sur {total}", { total: LEVELS.length })
    : t("Escale {n} terminée", { n: formatStageNumber(stage + 1) });
  byId("finish-title").textContent = t(last ? "Le port est rallumé." : "Balise rallumée !");
  byId("finish-text").textContent =
    t(LEVELS[stage].name) +
    " · " +
    t("{n} déplacements", { n: moves }) +
    ". " +
    t(all ? "Les trois feux guident à nouveau les navires." : "L’équipage peut reprendre le chenal.");
  byId("best").textContent = t("Meilleur trajet · {n} déplacements", { n: logbook.best[stage] });
  byId("next").textContent = t(last ? "Reprendre du début" : "Escale suivante →");
  if (!byId("finish").open) byId("finish").showModal();
}
