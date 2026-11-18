import { byId, dismissOnEscape } from "#ui/dom";
import { cursorEntries } from "#ui/guide/cursors";
import { HEROES } from "#game/board";
import { SYMBOLS, symbolItem } from "#ui/guide/symbols";

function wireLegend(id, entries, focusBoard) {
  const dialog = byId(id);
  const list = dialog.querySelector("ul");
  let opener;

  for (const button of document.querySelectorAll('button[aria-controls="' + id + '"]')) {
    button.addEventListener("click", () => {
      opener = button;
      list.replaceChildren(...entries());
      dialog.showModal();
      dialog.querySelector(".dialog-scroll").scrollTop = 0;
    });
  }

  function restoreFocus() {
    if (!opener) return;
    const parent = opener.closest("dialog");
    if (parent?.open) opener.focus({ preventScroll: true });
    else if (!parent) focusBoard();
    opener = null;
  }
  function close() {
    dialog.close();
    restoreFocus();
  }
  dialog.querySelector("[data-close]").onclick = close;
  dismissOnEscape(dialog, close);
  dialog.addEventListener("close", () => {
    if (!dialog.open) restoreFocus();
  });
}

export function wireMapLegends(cursors, currentCrew, focusBoard) {
  const symbols = [...HEROES, ...Object.keys(SYMBOLS)];
  wireLegend("symbol-guide", () => symbols.map((id) => symbolItem(id, currentCrew(), true)), focusBoard);
  wireLegend("cursor-guide", () => cursorEntries(cursors), focusBoard);
}
