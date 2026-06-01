import type { Finding, Rule, RuleContext } from "../types.js";

const DANGEROUS_DASH = /—| -- /;
const IGNORED_TEXT_CONTAINERS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "SVG"]);

function hasForbiddenDash(text: string): boolean {
  return DANGEROUS_DASH.test(text);
}

function directTextContent(element: HTMLElement): string {
  return Array.from(element.childNodes)
    .filter((node) => node.nodeType === 3)
    .map((node) => node.nodeValue || "")
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

export const noEmDashRule: Rule = {
  id: "no-em-dash",
  description: "Interdit l'utilisation d'un em dash (—) dans les copies textuelles.",
  principle: "design polish --lucid",
  wp7Finding: "P1.3 em dash en microcopy",
  severity: "high",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const element of Array.from(context.document.querySelectorAll<HTMLElement>("body *"))) {
      if (IGNORED_TEXT_CONTAINERS.has(element.tagName)) continue;

      const text = directTextContent(element);
      if (hasForbiddenDash(text)) {
        findings.push({
          ruleId: "no-em-dash",
          severity: "high",
          message: "Em dash détecté dans la copy. Remplace par comma/point-virgule/parenthèses selon UX-writing.",
          location: element.tagName ? `${element.tagName.toLowerCase()}[text=${(text || "").slice(0, 24)}...]` : ":root",
          suggestion: "Évite le tiret cadratin (—) et les doubles tirets ('--') en microcopy."
        });
      }
    }

    return findings;
  }
};
