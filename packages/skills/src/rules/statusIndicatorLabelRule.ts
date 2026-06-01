import type { Finding, Rule, RuleContext } from "../types.js";
import { createFindingFromElement } from "./utils.js";

const STATUS_HINT = /status|state|dot|indicator/i;

function tokenCarriesStatusHint(token: string): boolean {
  const scopedName = token.includes("__") ? token.slice(token.indexOf("__") + 2) : token;
  const elementName = scopedName.split("--")[0] || scopedName;
  return STATUS_HINT.test(elementName);
}

function isStatusIndicator(element: HTMLElement): boolean {
  const className = element.getAttribute("class") || "";
  const id = element.id || "";
  const role = element.getAttribute("role") || "";
  const classHasStatusHint = className.split(/\s+/).filter(Boolean).some(tokenCarriesStatusHint);
  return classHasStatusHint || STATUS_HINT.test(id) || role === "status";
}

function hasAccessibleName(element: HTMLElement): boolean {
  if (element.getAttribute("aria-label")) return true;
  if (element.getAttribute("aria-labelledby")) return true;
  if (element.getAttribute("title")) return true;
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (parent.getAttribute("aria-label")) return true;
    if (parent.getAttribute("aria-labelledby")) return true;
    if (parent.getAttribute("title")) return true;
  }
  const ownText = (element.textContent || "").replace(/\s+/g, " ").trim();
  if (ownText.length > 0) return true;
  const parentText = (element.parentElement?.textContent || "").replace(/\s+/g, " ").trim();
  return parentText.length > ownText.length + 2;
}

export const statusIndicatorLabelRule: Rule = {
  id: "status-indicator-label",
  description: "Signale les indicateurs visuels de statut sans libellé accessible ou visible.",
  principle: "design clarify --interaction",
  wp7Finding: "P2.4 statut des docs sans légende explicite",
  severity: "low",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const element of Array.from(context.document.querySelectorAll<HTMLElement>("span, i, b, div"))) {
      if (!isStatusIndicator(element)) continue;
      if (hasAccessibleName(element)) continue;
      findings.push(
        createFindingFromElement(
          this.id,
          this.severity,
          "Indicateur de statut sans libellé explicite.",
          element,
          "Ajouter aria-label/title, une légende visible ou un texte adjacent qui nomme l'état."
        )
      );
    }

    return findings;
  }
};
