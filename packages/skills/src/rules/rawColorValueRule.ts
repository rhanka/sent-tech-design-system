import type { Finding, Rule, RuleContext } from "../types.js";
import {
  extractCssRuleBlocks,
  extractInlineStyleBlocks,
  isSentropicToken,
  type CssDeclaration
} from "./utils.js";

const COLOR_PROPERTY = /(?:^|-)color$|^background(?:-color)?$|^border(?:-[a-z]+)?(?:-color)?$|^outline(?:-color)?$|^box-shadow$|^fill$|^stroke$/;
const RAW_COLOR_FUNCTION = /\b(?:rgb|rgba|hsl|hsla|oklch|lab|lch)\s*\(/i;

function rawColorValues(declarations: CssDeclaration[]): string[] {
  const hits: string[] = [];

  for (const declaration of declarations) {
    if (!COLOR_PROPERTY.test(declaration.property)) continue;
    if (isSentropicToken(declaration.value)) continue;
    if (!RAW_COLOR_FUNCTION.test(declaration.value)) continue;
    hits.push(`${declaration.property}:${declaration.value}`);
  }

  return hits;
}

export const rawColorValueRule: Rule = {
  id: "raw-color-value",
  description: "Signale les fonctions de couleur brutes qui contournent les tokens Sent Tech.",
  principle: "design align --tones",
  wp7Finding: "P0.1 hard-coded colors dans la vitrine docs",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const { element, declarations } of extractInlineStyleBlocks(context)) {
      const hits = rawColorValues(declarations);
      if (hits.length === 0) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Fonction couleur brute non tokenisée (${hits.join(", ")}).`,
        location: element.tagName ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}` : ":root",
        suggestion: "Déplacer la couleur vers un token `--st-*` plutôt que garder une valeur locale."
      });
    }

    for (const block of extractCssRuleBlocks(context)) {
      const hits = rawColorValues(block.declarations);
      if (hits.length === 0) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Fonction couleur brute non tokenisée (${hits.join(", ")}).`,
        location: block.location,
        suggestion: "Remplacer par un token sémantique Sent Tech ou ajouter le token manquant au thème."
      });
    }

    return findings;
  }
};
