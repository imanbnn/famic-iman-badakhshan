import { byId } from "#ui/dom";
import { THEMES, savePreferences } from "#app/preferences";
import { crewName } from "#game/crew";
import { t } from "#i18n/translate";
import { portrait } from "#render/robots/sprites";
import { departure } from "#render/harbour/poster";

export function setupDeparture(prefs, onChange) {
  const language = byId("language");
  function select(key, value) {
    if (prefs[key] === value) return;
    prefs[key] = value;
    savePreferences(prefs);
    onChange(key);
  }
  language.onchange = (event) => select("lang", event.target.value);
  for (const group of document.querySelectorAll(".theme-choices")) {
    for (const id of Object.keys(THEMES)) {
      const button = document.createElement("button"),
        swatch = document.createElement("i"),
        label = document.createElement("span");
      button.dataset.themeChoice = id;
      swatch.setAttribute("aria-hidden", "true");
      button.append(swatch, label);
      group.append(button);
      button.onclick = () => select("theme", id);
    }
  }
  for (const button of document.querySelectorAll("[data-starter]")) {
    button.onclick = () => select("starter", button.dataset.starter);
  }
  return function render() {
    document.documentElement.dataset.theme = prefs.theme;
    document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.documentElement)
      .getPropertyValue("--base")
      .trim();
    for (const input of language.querySelectorAll("input")) input.checked = input.value === prefs.lang;
    for (const button of document.querySelectorAll("[data-theme-choice]")) {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === prefs.theme));
      button.lastChild.textContent = t(THEMES[button.dataset.themeChoice]);
    }
    for (const button of document.querySelectorAll("[data-starter]")) {
      const role = button.dataset.starter,
        name = crewName(prefs.crew, role);
      button.setAttribute("aria-pressed", String(role === prefs.starter));
      button.setAttribute("aria-label", t("Commencer avec {name}", { name }));
      button.querySelector("strong").textContent = name;
      portrait(button.querySelector("canvas"), prefs.crew[role]);
    }
    if (!byId("launch").hidden) {
      departure(byId("departure-art"), prefs.theme, prefs.crew, prefs.starter);
    }
  };
}
