import { byId } from "#ui/dom";
import { t } from "#i18n/translate";
import { ACTIONS, keyName } from "#ui/controls/bindings";
import { symbolItem } from "#ui/guide/symbols";
import { lessons } from "#ui/guide/lessons";
import { drawLesson } from "#render/guide-scenes";

function keyRow([label, ...actions], bindings) {
  const row = document.createElement("li"),
    keys = document.createElement("span"),
    text = document.createElement("span");
  keys.className = "lesson-keycaps";
  text.textContent = t(label);
  if (actions.includes("up")) keys.classList.add("direction-keys");
  for (const action of actions) {
    const cap = document.createElement("kbd"),
      key = keyName(bindings[action]);
    cap.textContent = key;
    cap.dataset.key = action;
    cap.setAttribute("aria-label", t(ACTIONS[action][0]) + " (" + key + ")");
    keys.append(cap);
  }
  row.append(keys, text);
  return row;
}

export function wireLessons(prefs) {
  const dialog = byId("guide");
  let page = 0;
  const dots = byId("lesson-dots");
  lessons.forEach(() => dots.append(document.createElement("i")));
  function render() {
    const { title, body, alt, controls, symbols } = lessons[page];
    byId("lesson-counter").textContent = t("Étape {n} sur {total}", { n: page + 1, total: lessons.length });
    byId("lesson-title").textContent = t(title);
    byId("lesson-text").textContent = t(body);
    byId("lesson-art").setAttribute("aria-label", t(alt));
    byId("lesson-keys").replaceChildren(...controls.map((control) => keyRow(control, prefs.keys)));
    byId("lesson-symbols").replaceChildren(...symbols.map((id) => symbolItem(id, prefs.crew)));
    byId("lesson-prev").disabled = page === 0;
    byId("lesson-next").textContent = t(page === lessons.length - 1 ? "Terminer le guide" : "Suivant");
    [...dots.children].forEach((dot, i) => dot.classList.toggle("current", i === page));
    drawLesson(byId("lesson-art"), lessons[page].scene, prefs.crew);
  }
  const scroller = dialog.querySelector(".dialog-scroll");
  function turn(index) {
    page = index;
    render();
    scroller.scrollTop = 0;
  }
  byId("lesson-prev").onclick = () => {
    if (page > 0) turn(page - 1);
  };
  byId("lesson-next").onclick = () => {
    if (page === lessons.length - 1) dialog.close();
    else turn(page + 1);
  };
  function open() {
    dialog.showModal();
    turn(0);
  }
  byId("guide-open").onclick = open;
  byId("launch-guide").onclick = open;
  return () => {
    if (dialog.open) render();
  };
}
