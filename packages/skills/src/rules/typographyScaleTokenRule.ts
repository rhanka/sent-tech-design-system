import type { Finding, Rule, RuleContext } from "../types.js";
import {
  extractCssRuleBlocks,
  extractInlineStyleBlocks,
  isSentropicToken,
  parseCssLengthPx,
  type CssDeclaration
} from "./utils.js";

const FONT_SIZE_SCALE = new Set([12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64]);

function offScaleTypography(declarations: CssDeclaration[]): string[] {
  const hits: string[] = [];

  for (const declaration of declarations) {
    if (declaration.property !== "font-size" && declaration.property !== "line-height") continue;
    if (isSentropicToken(declaration.value)) continue;
    const px = parseCssLengthPx(declaration.value);
    if (px === undefined) continue;

    if (declaration.property === "font-size" && !FONT_SIZE_SCALE.has(px)) {
      hits.push(`${declaration.property}:${declaration.value}`);
    }

    if (declaration.property === "line-height" && px > 0 && Math.abs(px % 4) > 0.001) {
      hits.push(`${declaration.property}:${declaration.value}`);
    }
  }

  return hits;
}

export const typographyScaleTokenRule: Rule = {
  id: "typography-scale-token",
  description: "Signale les font-size/line-height hors échelle lorsqu'ils ne sont pas tokenisés.",
  principle: "design align --typo",
  wp7Finding: "P1.1 échelle typographique dense",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const { element, declarations } of extractInlineStyleBlocks(context)) {
      const hits = offScaleTypography(declarations);
      if (hits.length === 0) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Typographie hors échelle Sent Tech (${hits.join(", ")}).`,
        location: element.tagName ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}` : ":root",
        suggestion: "Utiliser les tokens typographiques Sent Tech ou un palier documenté de l'échelle."
      });
    }

    for (const block of extractCssRuleBlocks(context)) {
      const hits = offScaleTypography(block.declarations);
      if (hits.length === 0) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Typographie hors échelle Sent Tech (${hits.join(", ")}).`,
        location: block.location,
        suggestion: "Remplacer par `--st-typography-*` ou recaler sur les paliers 12/14/16/18/20/24..."
      });
    }

    return findings;
  }
};
