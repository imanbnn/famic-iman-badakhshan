import { readCrew } from "#game/crew";
import { readBindings } from "#ui/controls/bindings";

export const THEMES = { midnight: "Minuit", foam: "Écume", ember: "Cuivre" };
const STORE = "contreflot.preferences.v1";

export function preferences() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(STORE));
  } catch {
    /* Stockage facultatif en mode privé. */
  }
  return {
    lang: saved?.lang === "en" ? "en" : "fr",
    theme: Object.hasOwn(THEMES, saved?.theme) ? saved.theme : "midnight",
    starter: saved?.starter === "sonde" ? "sonde" : "lest",
    crew: readCrew(saved?.crew),
    keys: readBindings(saved?.keys),
    sound: typeof saved?.sound === "boolean" ? saved.sound : true,
    music: saved?.music === true
  };
}

export function savePreferences(prefs) {
  try {
    localStorage.setItem(STORE, JSON.stringify(prefs));
  } catch {
    /* Les réglages restent actifs pour cette partie. */
  }
}
