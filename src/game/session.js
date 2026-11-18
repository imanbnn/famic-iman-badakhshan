import { MAX_UNDO_ACTIONS } from "#game/rules";
import { readBoard, newState } from "#game/board";
import { play } from "#game/actions";

export class Session {
  constructor(level, starter = "lest") {
    this.board = readBoard(level);
    this.reserve = level.reserve;
    this.starter = starter;
    this.restart();
  }

  restart() {
    this.history = [];
    this.state = newState(this.board, this.reserve, this.starter);
  }

  input(action) {
    if (action === "undo") {
      if (!this.history.length) return { state: this.state, message: "Vous êtes au point de départ." };
      this.state = this.history.pop();
      return { state: this.state, sound: "undo", message: "Dernière action annulée." };
    }
    const result = play(this.board, this.state, action);
    if (result.state !== this.state) {
      this.history.push(this.state);
      if (this.history.length > MAX_UNDO_ACTIONS) this.history.shift();
      this.state = result.state;
    }
    return result;
  }
}
