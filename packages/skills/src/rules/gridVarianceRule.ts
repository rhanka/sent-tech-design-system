import type { Finding, Rule, RuleContext } from "../types.js";
import { extractCssRuleBlocks, getDeclaration, isSentropicToken } from "./utils.js";

function countCardLikeElements(context: RuleContext): number {
  return context.document.querySelectorAll(
    "article, .card, [class*='card'], [class*='Card'], [class*='tile'], [class*='Tile']"
  ).length;
}

export const gridVarianceRule: Rule = {
  id: "grid-variance",
  description: "Signale les grilles de cartes uniformes répétitives sans token ou pattern de variance.",
  principle: "design polish --quieter",
  wp7Finding: "P0.3 monotonie des grilles de cartes sur la home",
  severity: "low",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const cardCount = countCardLikeElements(context);
    if (cardCount < 6) return findings;

    for (const block of extractCssRuleBlocks(context)) {
      const columns = getDeclaration(block.declarations, "grid-template-columns");
      if (!columns || isSentropicToken(columns)) continue;
      if (!/repeat\(\s*[3-9]\s*,\s*1fr\s*\)/i.test(columns)) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Grille uniforme répétitive (${cardCount} cartes) détectée sans token de layout ni variance.`,
        location: block.location,
        suggestion: "Introduire un token de grille Sent Tech, une hiérarchie de tailles ou une section éditoriale qui casse le motif uniforme."
      });
    }

    return findings;
  }
};
