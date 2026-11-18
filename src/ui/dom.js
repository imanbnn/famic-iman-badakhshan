export const byId = (id) => document.getElementById(id);

export function setText(node, text) {
  if (node.textContent !== text) node.textContent = text;
}

export function dismissOnEscape(dialog, close) {
  const dismiss = (event) => {
    event.preventDefault();
    close();
  };
  dialog.addEventListener("cancel", dismiss);
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !event.defaultPrevented) {
      event.stopPropagation();
      dismiss(event);
    }
  });
}
