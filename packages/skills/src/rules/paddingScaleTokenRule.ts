import type { Finding, Rule, RuleContext } from "../types.js";
import {
  extractCssRuleBlocks,
  extractInlineStyleBlocks,
  isSentropicToken,
  parseCssLengthPx,
  type CssDeclaration
} from "./utils.js";

const SPACING_PROP = /^(padding|padding-[a-z-]+|margin|margin-[a-z-]+|gap|row-gap|column-gap)$/;

function offGridValues(declarations: CssDeclaration[]): string[] {
  const offGrid: string[] = [];

  for (const declaration of declarations) {
    if (!SPACING_PROP.test(declaration.property)) continue;
    if (isSentropicToken(declaration.value)) continue;
    for (const raw of declaration.value.split(/\s+/)) {
      if (raw === "auto") continue;
      const px = parseCssLengthPx(raw);
      if (px === undefined || px === 0) continue;
      if (Math.abs(px % 4) > 0.001 && Math.abs((px % 4) - 4) > 0.001) {
        offGrid.push(`${declaration.property}:${raw}`);
      }
    }
  }

  return offGrid;
}

export const paddingScaleTokenRule: Rule = {
  id: "padding-scale-token",
  description: "Signale padding/margin/gap hors grille 4px lorsqu'ils ne passent pas par un token Sent Tech.",
  principle: "design align --spacing",
  wp7Finding: "P1.5 tailles d'espace (padding/marge) bruitées",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const { element, declarations } of extractInlineStyleBlocks(context)) {
      const hits = offGridValues(declarations);
      if (hits.length === 0) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Spacing hors grille 4px détecté (${hits.join(", ")}).`,
        location: element.tagName ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}` : ":root",
        suggestion: "Utiliser un token `--st-*` ou des valeurs alignées sur la grille 4px."
      });
    }

    for (const block of extractCssRuleBlocks(context)) {
      const hits = offGridValues(block.declarations);
      if (hits.length === 0) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Spacing hors grille 4px détecté (${hits.join(", ")}).`,
        location: block.location,
        suggestion: "Aligner padding/margin/gap sur la grille 4px ou les remplacer par des tokens Sent Tech."
      });
    }

    return findings;
  }
};
