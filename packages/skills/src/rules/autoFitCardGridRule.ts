import type { Finding, Rule, RuleContext } from "../types.js";
import { extractCssRuleBlocks, getDeclaration, isSentropicToken } from "./utils.js";

function cardCount(context: RuleContext): number {
  return context.document.querySelectorAll(
    "article, .card, [class*='card'], [class*='Card'], .tile, [class*='tile'], [class*='Tile']"
  ).length;
}

export const autoFitCardGridRule: Rule = {
  id: "auto-fit-card-grid",
  description: "Signale les grilles auto-fit de cartes répétitives non exprimées par un token de layout.",
  principle: "design polish --quieter",
  wp7Finding: "P0.3 monotonie des grilles de cartes sur la home",
  severity: "low",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    if (cardCount(context) < 4) return findings;

    for (const block of extractCssRuleBlocks(context)) {
      const display = getDeclaration(block.declarations, "display");
      const columns = getDeclaration(block.declarations, "grid-template-columns");
      if (!display?.includes("grid") || !columns) continue;
      if (isSentropicToken(columns)) continue;
      if (!/repeat\(\s*auto-(?:fit|fill)\s*,\s*minmax\(/i.test(columns)) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: "Grille de cartes auto-fit répétitive sans token ni variation éditoriale.",
        location: block.location,
        suggestion: "Remplacer par un token de layout Sent Tech ou introduire une section non-card/listée pour casser le motif."
      });
    }

    return findings;
  }
};
