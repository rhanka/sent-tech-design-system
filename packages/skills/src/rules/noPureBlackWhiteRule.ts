import type { Finding, Rule, RuleContext } from "../types.js";
import {
  extractCssRuleBlocks,
  extractInlineStyleBlocks,
  isSentropicToken,
  type CssDeclaration
} from "./utils.js";

const COLOR_PROPERTY = /(?:^|-)color$|^background(?:-color)?$|^border(?:-[a-z]+)?(?:-color)?$|^outline(?:-color)?$|^box-shadow$/;
const PURE_BLACK_WHITE =
  /(^|[\s(:,])(#(?:000|000000|fff|ffffff)\b|rgba?\(\s*(?:0[\s,]+0[\s,]+0|255[\s,]+255[\s,]+255)(?:\s*[,/]\s*(?:1|100%))?\s*\)|\b(?:black|white)\b)/i;

function pureValues(declarations: CssDeclaration[]): string[] {
  const hits: string[] = [];

  for (const declaration of declarations) {
    if (!COLOR_PROPERTY.test(declaration.property)) continue;
    if (isSentropicToken(declaration.value)) continue;
    if (!PURE_BLACK_WHITE.test(declaration.value)) continue;
    hits.push(`${declaration.property}:${declaration.value}`);
  }

  return hits;
}

export const noPureBlackWhiteRule: Rule = {
  id: "no-pure-black-white",
  description: "Signale les noirs/blancs purs non tokenisés dans les propriétés de couleur.",
  principle: "design align --tones",
  wp7Finding: "P0.2 contraste/alignement chromatique incohérent sur fonds colorés",
  severity: "high",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const { element, declarations } of extractInlineStyleBlocks(context)) {
      const hits = pureValues(declarations);
      if (hits.length === 0) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Noir/blanc pur non tokenisé détecté (${hits.join(", ")}).`,
        location: element.tagName ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}` : ":root",
        suggestion: "Remplacer par des tokens texte/surface Sent Tech teintés et validés pour le contraste."
      });
    }

    for (const block of extractCssRuleBlocks(context)) {
      const hits = pureValues(block.declarations);
      if (hits.length === 0) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Noir/blanc pur non tokenisé détecté (${hits.join(", ")}).`,
        location: block.location,
        suggestion: "Utiliser `--st-semantic-text-*` et `--st-semantic-surface-*` plutôt que #000/#fff."
      });
    }

    return findings;
  }
};
