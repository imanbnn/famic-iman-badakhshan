import { LEVELS } from "#game/levels";
import { port, HARBOUR_SIZE } from "#render/harbour/panorama";
import { t } from "#i18n/translate";

export function openLogbook(dialog, logbook, current, changeStage, sessions) {
  const list = dialog.querySelector("ol");
  list.replaceChildren();
  for (const [index, level] of LEVELS.entries()) {
    const item = document.createElement("li"),
      art = document.createElement("canvas");
    art.width = HARBOUR_SIZE.width;
    art.height = HARBOUR_SIZE.height;
    art.setAttribute("aria-hidden", "true");
    const best = logbook.best[index];
    const active = index === current;
    const paused = !active && sessions[index] && !sessions[index].state.won;
    port(art, index, logbook.lights);
    const info = document.createElement("span"),
      name = document.createElement("strong"),
      detail = document.createElement("small");
    name.textContent = t(level.name);
    detail.textContent =
      best !== null
        ? t("Meilleur trajet · {n} déplacements", { n: best })
        : t(active ? level.region : paused ? "En pause" : "À explorer");
    info.append(name, detail);
    const button = document.createElement("button");
    button.textContent = t(active ? "En cours" : paused ? "Reprendre" : best !== null ? "Rejouer" : "Embarquer");
    button.setAttribute("aria-label", button.textContent + " · " + t(level.name));
    button.onclick = (event) => {
      dialog.close();
      if (index !== current) changeStage(index, event);
    };
    item.append(art, info, button);
    list.append(item);
  }
  dialog.showModal();
}
