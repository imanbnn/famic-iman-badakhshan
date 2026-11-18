import { byId, dismissOnEscape } from "#ui/dom";
import { t } from "#i18n/translate";

export function wireHome({ hasVoyage, hasSession, focusBoard, restartVoyage }) {
  function homeTip() {
    byId("home-tip").textContent = t(
      hasVoyage() ? "Revenir à l’accueil et recommencer la traversée." : "Revenir à l’écran de départ."
    );
    if (hasVoyage()) byId("home").setAttribute("aria-haspopup", "dialog");
    else byId("home").removeAttribute("aria-haspopup");
  }
  function firstPage() {
    window.scrollTo({ top: 0, behavior: "instant" });
    byId("setup-title").focus({ preventScroll: true });
  }
  for (const anchor of document.querySelectorAll(".tip-anchor")) {
    const button = anchor.querySelector("button");
    button.addEventListener("pointerenter", (event) => {
      anchor.removeAttribute("data-tip-dismissed");
      anchor.toggleAttribute("data-pointing", event.pointerType !== "touch");
    });
    for (const type of ["pointerleave", "pointercancel"])
      button.addEventListener(type, () => anchor.removeAttribute("data-pointing"));
    button.addEventListener("focus", () => anchor.removeAttribute("data-tip-dismissed"));
  }
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    for (const anchor of document.querySelectorAll(".tip-anchor:is([data-pointing],:focus-within)"))
      anchor.setAttribute("data-tip-dismissed", "");
  });
  byId("home").onclick = () => {
    if (hasVoyage()) {
      byId("return-home").showModal();
      byId("keep-playing").focus();
    } else firstPage();
  };
  function cancelHome() {
    byId("return-home").close();
    if (hasSession()) focusBoard();
  }
  byId("keep-playing").onclick = cancelHome;
  dismissOnEscape(byId("return-home"), cancelHome);
  byId("confirm-home").onclick = () => {
    byId("return-home").close();
    restartVoyage();
    firstPage();
  };
  return homeTip;
}
