import type { Finding, Rule, RuleContext } from "../types.js";
import {
  extractCssRuleBlocks,
  extractInlineStyleBlocks,
  getDeclaration,
  isSentropicToken
} from "./utils.js";

const INTERACTIVE_SELECTOR_HINT = /(^|[\s,>+~])(?:button|a|input|select|textarea)\b|\[role=['"]?button|\.btn|\.button/i;

function removesOutline(value: string | undefined): boolean {
  if (!value) return false;
  return /^(?:none|0|0px)(?:\s*!important)?$/i.test(value.trim());
}

function hasTokenizedFocusVisible(context: RuleContext): boolean {
  return extractCssRuleBlocks(context).some((block) => {
    if (!/:focus-visible/.test(block.selector)) return false;
    const outline = getDeclaration(block.declarations, "outline");
    const boxShadow = getDeclaration(block.declarations, "box-shadow");
    const borderColor = getDeclaration(block.declarations, "border-color");
    return [outline, boxShadow, borderColor].some((value) => value !== undefined && isSentropicToken(value));
  });
}

export const focusVisibleRingRule: Rule = {
  id: "focus-visible-ring",
  description: "Signale les contrôles qui suppriment outline sans focus-visible tokenisé.",
  principle: "design harden --a11y",
  wp7Finding: "P1.2 taille/cible interactive + affordance focus insuffisante",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const hasFocusVisible = hasTokenizedFocusVisible(context);

    for (const block of extractCssRuleBlocks(context)) {
      if (!INTERACTIVE_SELECTOR_HINT.test(block.selector)) continue;
      if (!removesOutline(getDeclaration(block.declarations, "outline"))) continue;
      if (hasFocusVisible) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: "Outline interactif supprimé sans règle :focus-visible tokenisée.",
        location: block.location,
        suggestion: "Ajouter un focus ring `:focus-visible` basé sur `--st-semantic-focus-*` ou équivalent."
      });
    }

    for (const { element, declarations } of extractInlineStyleBlocks(context)) {
      if (!["a", "button", "input", "select", "textarea"].includes(element.tagName.toLowerCase())) continue;
      if (!removesOutline(getDeclaration(declarations, "outline"))) continue;
      if (hasFocusVisible) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: "Outline interactif inline supprimé sans focus-visible tokenisé global.",
        location: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}`,
        suggestion: "Remettre un outline ou définir une règle `:focus-visible` tokenisée."
      });
    }

    return findings;
  }
};
