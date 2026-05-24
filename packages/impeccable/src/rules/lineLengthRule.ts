import type { Finding, Rule, RuleContext } from "../types.js";

const LONG_TEXT_THRESHOLD = 300;

function hasNoLineLengthCap(element: Element): boolean {
  const style = element.getAttribute("style") || "";
  return !/max-width\s*:/.test(style);
}

export const lineLengthRule: Rule = {
  id: "line-length-cap",
  description: "Les blocs de texte sans borne de largeur peuvent créer des lignes trop longues.",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const textNodes = context.document.querySelectorAll("p, .docs-section p");

    for (const element of Array.from(textNodes)) {
      const text = (element.textContent || "").replace(/\s+/g, " ").trim();
      if (text.length <= LONG_TEXT_THRESHOLD) continue;
      if (hasNoLineLengthCap(element)) {
        findings.push({
          ruleId: "line-length-cap",
          severity: "medium",
          message: "Texte dense sans max-width explicite. Ajouter max-width (>= 65ch) pour limiter la fatigue de lecture.",
          location: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}`,
          suggestion: "Ajouter `max-width: 65ch` (ou un token équivalent) sur conteneur paragraphes."
        });
      }
    }

    return findings;
  }
};
