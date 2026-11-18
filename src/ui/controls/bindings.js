import { t } from "#i18n/translate";

export const ACTIONS = {
  up: ["Monter", "ArrowUp"],
  left: ["Aller à gauche", "ArrowLeft"],
  down: ["Descendre", "ArrowDown"],
  right: ["Aller à droite", "ArrowRight"],
  swap: ["Changer de robot", " "],
  act: ["Action", "e"],
  undo: ["Annuler un coup", "u"],
  restart: ["Recommencer", "r"]
};
export const defaultKeys = () => Object.fromEntries(Object.entries(ACTIONS).map(([id, [, key]]) => [id, key]));
const labels = { ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→", " ": "Espace" };
export const keyName = (key) => t(labels[key] ?? key.toLocaleUpperCase());
export const normalize = (key) => ([...key].length === 1 ? key.toLowerCase() : key);
export const allowedKey = (key) => /^[\p{L}\p{Nd}]$/u.test(key) || Object.hasOwn(labels, key);

export function readBindings(saved) {
  const keys = defaultKeys();
  const assigned = new Set();
  for (const action of Object.keys(keys)) {
    const value = saved?.[action];
    if (typeof value !== "string") return defaultKeys();
    const key = normalize(value);
    if (!allowedKey(key) || assigned.has(key)) return defaultKeys();
    assigned.add(key);
    keys[action] = key;
  }
  return keys;
}
