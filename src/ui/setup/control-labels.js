import { byId } from "#ui/dom";
import { t } from "#i18n/translate";
import { ACTIONS, keyName } from "#ui/controls/bindings";

export function showSettings(prefs) {
  for (const toggle of document.querySelectorAll("[data-music]"))
    toggle.setAttribute("aria-pressed", String(prefs.music));
  for (const node of document.querySelectorAll("[data-binding]"))
    node.textContent = keyName(prefs.keys[node.dataset.binding]);
  byId("sound-label").textContent = t(prefs.sound ? "Son actif" : "Son coupé");
  byId("sound-tip").textContent = t(prefs.sound ? "Couper le son" : "Activer le son");
  byId("sound").setAttribute("aria-pressed", String(prefs.sound));
  for (const button of document.querySelectorAll("[data-action]")) {
    const action = button.dataset.action;
    if (button.closest(".arrows")) {
      const label = t(ACTIONS[action][0]) + " (" + keyName(prefs.keys[action]) + ")";
      button.title = label;
      button.setAttribute("aria-label", label);
    }
  }
}
