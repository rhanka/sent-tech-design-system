import type { Finding, Rule, RuleContext } from "../types.js";
import { createFindingFromElement } from "./utils.js";

const STATUS_HINT = /status|state|dot|indicator/i;

function isStatusIndicator(element: HTMLElement): boolean {
  const className = element.getAttribute("class") || "";
  const id = element.id || "";
  const role = element.getAttribute("role") || "";
  return STATUS_HINT.test(className) || STATUS_HINT.test(id) || role === "status";
}

function hasAccessibleName(element: HTMLElement): boolean {
  if (element.getAttribute("aria-label")) return true;
  if (element.getAttribute("aria-labelledby")) return true;
  if (element.getAttribute("title")) return true;
  const ownText = (element.textContent || "").replace(/\s+/g, " ").trim();
  if (ownText.length > 2) return true;
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
