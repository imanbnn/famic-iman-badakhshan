import { byId } from "#ui/dom";
import { FLEET, FLEET_SIZE, crewName } from "#game/crew";
import { portrait } from "#render/robots/sprites";
import { t } from "#i18n/translate";

const PREVIEW_PORTRAIT_PX = 80;
const CARD_PORTRAIT_PX = 128;

function thumbnail(model, size) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  canvas.setAttribute("aria-hidden", "true");
  portrait(canvas, model);
  return canvas;
}

export function wireHangar(prefs, activeRole, confirm) {
  const dialog = byId("fleet"),
    scroller = byId("fleet-scroll");
  const tabs = [...dialog.querySelectorAll("[role=tab]")],
    cards = [];
  const sample = document.querySelector(".fleet-sample");
  for (const model of ["etrille", "manta", "scaphandre", "luciole"])
    sample.append(thumbnail(model, PREVIEW_PORTRAIT_PX));
  let draft;

  function showSummary() {
    byId("fleet-summary").textContent = crewName(draft, "lest") + " + " + crewName(draft, "sonde");
  }

  function buildCards() {
    for (const [role, models] of Object.entries(FLEET)) {
      const grid = document.querySelector("#bay-" + role + " .fleet-grid");
      for (const model of models) {
        const card = document.createElement("label"),
          input = document.createElement("input");
        const name = document.createElement("strong"),
          detail = document.createElement("small");
        const copy = document.createElement("span");
        card.className = "fleet-card";
        input.type = "radio";
        input.name = "berth-" + role;
        input.value = model.id;
        name.textContent = model.name;
        input.setAttribute("aria-label", model.name);
        detail.id = "spec-" + model.id;
        input.setAttribute("aria-describedby", detail.id);
        copy.append(name, detail);
        card.append(input, thumbnail(model.id, CARD_PORTRAIT_PX), copy);
        grid.append(card);
        input.onchange = () => {
          draft[role] = model.id;
          showSummary();
        };
        cards.push({ input, detail, model, role });
      }
    }
  }

  function selectBay(role) {
    for (const tab of tabs) {
      const current = tab.dataset.bay === role;
      tab.setAttribute("aria-selected", String(current));
      tab.tabIndex = current ? 0 : -1;
      byId(tab.getAttribute("aria-controls")).hidden = !current;
    }
    scroller.scrollTop = 0;
  }

  for (const tab of tabs) {
    tab.querySelector("small").textContent = FLEET[tab.dataset.bay].length;
    tab.onclick = () => selectBay(tab.dataset.bay);
    tab.onkeydown = (event) => {
      let next;
      if (event.key === "Home") next = tabs[0];
      else if (event.key === "End") next = tabs[tabs.length - 1];
      else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        const offset = event.key === "ArrowRight" ? 1 : -1;
        next = tabs[(tabs.indexOf(tab) + offset + tabs.length) % tabs.length];
      } else return;
      event.preventDefault();
      selectBay(next.dataset.bay);
      next.focus();
    };
  }

  for (const button of document.querySelectorAll("[data-open-fleet]")) {
    button.onclick = () => {
      draft = { ...prefs.crew };
      if (!cards.length) buildCards();
      for (const { input, detail, model, role } of cards) {
        input.checked = draft[role] === model.id;
        detail.textContent = model[prefs.lang];
      }
      const role = activeRole();
      selectBay(role);
      showSummary();
      dialog.showModal();
      byId("tab-" + role).focus({ preventScroll: true });
    };
  }
  byId("confirm-crew").onclick = () => {
    dialog.close();
    confirm(draft);
  };
  return () => {
    byId("fleet-count-label").textContent = t("Choisir parmi {n} robots", { n: FLEET_SIZE });
  };
}
