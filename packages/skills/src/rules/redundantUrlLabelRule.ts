import type { Finding, Rule, RuleContext } from "../types.js";
import { createFindingFromElement } from "./utils.js";

function normalizeUrlText(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

export const redundantUrlLabelRule: Rule = {
  id: "redundant-url-label",
  description: "Signale les liens dont le libellé répète l'URL brute.",
  principle: "design polish --lucid",
  wp7Finding: "P2.3 labels mineurs sans coût informationnel",
  severity: "low",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const link of Array.from(context.document.querySelectorAll<HTMLAnchorElement>("a[href]"))) {
      const text = normalizeUrlText(link.textContent || "");
      if (!text.includes(".") && !text.includes("github.com/")) continue;
      const href = normalizeUrlText(link.href || link.getAttribute("href") || "");
      if (!href.includes(text) && !text.includes(href)) continue;
      findings.push(
        createFindingFromElement(
          this.id,
          this.severity,
          "Libellé de lien redondant avec son URL.",
          link,
          "Remplacer l'URL visible par un libellé court et intentionnel, par exemple 'Repository' ou 'Source'."
        )
      );
    }

    return findings;
  }
};
