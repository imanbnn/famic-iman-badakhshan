import { english } from "#i18n/english/catalog";
import { crewName } from "#game/crew";

let current = "fr";
let names = { hauler: "Lest", scout: "Sonde" };
export function useCrew(crew) {
  names = { hauler: crewName(crew, "lest"), scout: crewName(crew, "sonde") };
}
export function useLanguage(lang) {
  current = lang === "en" ? "en" : "fr";
  document.documentElement.lang = current;
}

export function t(source, values = {}) {
  const text = current === "en" ? (english[source] ?? source) : source;
  return text.replace(/\{(\w+)\}/g, (token, key) =>
    Object.hasOwn(values, key) ? String(values[key]) : (names[key] ?? token)
  );
}

export function bindMarkup(root) {
  const strings = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.nodeValue.trim() && !node.parentElement.closest("script,style")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });
  while (walker.nextNode()) {
    const node = walker.currentNode,
      original = node.nodeValue,
      key = original.trim();
    strings.push(() => {
      if (node.isConnected) node.nodeValue = original.replace(key, () => t(key));
    });
  }
  for (const name of ["title", "aria-label", "aria-roledescription"]) {
    for (const node of root.querySelectorAll("[" + name + "]")) {
      const key = node.getAttribute(name);
      strings.push(() => node.setAttribute(name, t(key)));
    }
  }
  return () => {
    strings.forEach((update) => update());
    document.title = t("Contreflot — Jeu de réflexion");
    document.querySelector('meta[name="description"]').content = t(
      "Un petit jeu de réflexion maritime. Deux robots, une réserve commune et trois écluses à franchir."
    );
  };
}
