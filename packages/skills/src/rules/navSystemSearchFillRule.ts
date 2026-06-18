import type { Finding, Rule, RuleContext } from "../types.js";
import { createFindingFromElement } from "./utils.js";

const SEARCH_SURFACE_SELECTOR = [
  "[data-st-nav-surface='drawer']",
  "[data-st-nav-surface='rail-drawer']",
  "[data-nav-surface='drawer']",
  "[data-st-surface='drawer']",
  "[data-st-surface='panel']",
  ".st-drawer",
  ".st-railDrawer",
  ".st-panel",
  ".st-contextPanel",
  ".st-utilityPanel"
].join(",");

const SEARCH_SELECTOR = "input[type='search'],[role='searchbox'],[data-st-search]";
const FILL_ATTR_HINT = /\b(fill|filled|full|fluid|stretch|wide)\b/i;
const FILL_STYLE_HINT = /\b(?:width|inline-size)\s*:\s*100%|\bflex\s*:\s*(?:1|1\s+1)|\balign-self\s*:\s*stretch/i;

function nodeHasFillAffordance(element: HTMLElement): boolean {
  const attrs = [
    element.getAttribute("class") || "",
    element.getAttribute("data-size") || "",
    element.getAttribute("data-fill") || "",
    element.getAttribute("data-layout") || ""
  ].join(" ");
  const style = element.getAttribute("style") || "";
  return FILL_ATTR_HINT.test(attrs) || FILL_STYLE_HINT.test(style);
}

function hasFillAffordance(element: HTMLElement): boolean {
  let current: HTMLElement | null = element;
  let depth = 0;
  while (current && depth < 3) {
    if (nodeHasFillAffordance(current)) return true;
    current = current.parentElement;
    depth += 1;
  }
  return false;
}

export const navSystemSearchFillRule: Rule = {
  id: "navsystem-search-fill-affordance",
  description: "Signale les recherches de drawer/panel sans affordance de remplissage explicite.",
  principle: "WP23 NavSystem guardrails",
  wp7Finding: "WP23.5 search command should fill drawer/panel command row",
  severity: "low",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const surface of Array.from(context.document.querySelectorAll<HTMLElement>(SEARCH_SURFACE_SELECTOR))) {
      for (const search of Array.from(surface.querySelectorAll<HTMLElement>(SEARCH_SELECTOR))) {
        if (hasFillAffordance(search)) continue;
        findings.push(
          createFindingFromElement(
            this.id,
            this.severity,
            "Recherche dans drawer/panel sans fill affordance explicite.",
            search,
            "Ajouter width/inline-size:100%, flex:1 ou un marqueur classe/data full/fill/fluid/stretch sur la recherche ou son conteneur."
          )
        );
      }
    }

    return findings;
  }
};
