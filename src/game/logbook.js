import { LEVELS } from "#game/levels";

const STORAGE_KEY = "contreflot.journal.v2";
function read(storage, key) {
  try {
    return JSON.parse(storage?.getItem(key));
  } catch {
    return null;
  }
}

export class Logbook {
  constructor(storage) {
    this.storage = storage;
    const saved = read(storage, STORAGE_KEY);
    const scores = Array.isArray(saved?.best) ? saved.best : read(storage, "contreflot.traversees.v1");
    this.best = LEVELS.map((_, i) => (Number.isSafeInteger(scores?.[i]) && scores[i] > 0 ? scores[i] : null));
    this.lights = this.best.map((score, i) =>
      typeof saved?.lights?.[i] === "boolean" ? saved.lights[i] : score !== null
    );
  }

  get next() {
    const first = this.lights.indexOf(false);
    return first === -1 ? 0 : first;
  }

  record(stage, moves) {
    if (this.lights[stage] && this.best[stage] !== null && this.best[stage] <= moves) return;
    this.lights[stage] = true;
    this.best[stage] = Math.min(this.best[stage] ?? moves, moves);
    this.save();
  }

  restartVoyage() {
    this.lights.fill(false);
    this.save();
  }

  save() {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify({ best: this.best, lights: this.lights }));
    } catch {}
  }
}
