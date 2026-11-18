import { byId } from "#ui/dom";
import { t } from "#i18n/translate";
import { ACTIONS, allowedKey, defaultKeys, keyName, normalize } from "#ui/controls/bindings";
import { savePreferences } from "#app/preferences";

export function wirePanels(prefs, onChange) {
  let listening = null,
    report = "Échap annule la saisie.";
  const settings = byId("settings"),
    buttons = new Map();
  function refresh() {
    for (const [id, button] of buttons) {
      const label = t(ACTIONS[id][0]);
      button.previousElementSibling.textContent = label;
      button.setAttribute(
        "aria-label",
        t("Changer la touche pour {action}", { action: label.toLocaleLowerCase() })
      );
      button.textContent = id === listening ? t("Saisir…") : keyName(prefs.keys[id]);
      button.classList.toggle("listening", id === listening);
    }
    byId("binding-status").textContent = t(report);
  }
  for (const id of Object.keys(ACTIONS)) {
    const row = document.createElement("div"),
      button = document.createElement("button");
    row.className = "binding";
    row.append(document.createElement("span"), button);
    byId("bindings").append(row);
    button.onclick = () => {
      listening = id;
      report = "Appuyez sur la nouvelle touche.";
      refresh();
    };
    buttons.set(id, button);
  }
  settings.addEventListener("keydown", (event) => {
    if (!listening || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return;
    const key = normalize(event.key);
    if (key === "Tab") {
      listening = null;
      report = "Saisie annulée.";
      refresh();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (key === "Escape") {
      listening = null;
      report = "Saisie annulée.";
    } else if (!allowedKey(key)) report = "Choisissez une lettre, un chiffre, une flèche ou Espace.";
    else if (Object.entries(prefs.keys).some(([id, value]) => id !== listening && value === key))
      report = "Cette touche est déjà attribuée.";
    else {
      prefs.keys[listening] = key;
      listening = null;
      report = "Commande enregistrée.";
      savePreferences(prefs);
      onChange();
    }
    refresh();
  });
  settings.addEventListener("close", () => {
    listening = null;
    report = "Échap annule la saisie.";
  });
  byId("settings-open").onclick = () => {
    refresh();
    settings.showModal();
  };
  document.querySelectorAll("[data-close]").forEach((button) => {
    button.onclick = () => button.closest("dialog").close();
  });
  byId("restore-keys").onclick = () => {
    prefs.keys = defaultKeys();
    listening = null;
    report = "Touches par défaut rétablies.";
    savePreferences(prefs);
    onChange();
    refresh();
  };
  return refresh;
}
