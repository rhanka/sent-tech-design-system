import type { Finding, Rule, RuleContext } from "../types.js";
import {
  extractCssRuleBlocks,
  extractInlineStyleBlocks,
  getDeclaration,
  isSentropicToken,
  type CssDeclaration
} from "./utils.js";

const GENERIC_FAMILIES = new Set([
  "inherit",
  "initial",
  "revert",
  "serif",
  "sans-serif",
  "system-ui",
  "ui-sans-serif",
  "monospace",
  "ui-monospace"
]);

function firstFontFamily(value: string): string | undefined {
  if (isSentropicToken(value)) return undefined;
  const first = value.split(",")[0]?.trim().replace(/^["']|["']$/g, "").toLowerCase();
  if (!first || GENERIC_FAMILIES.has(first)) return undefined;
  return first;
}

function rawFontFamily(declarations: CssDeclaration[]): string | undefined {
  const value = getDeclaration(declarations, "font-family");
  if (!value) return undefined;
  return firstFontFamily(value);
}

export const fontFamilyTokenRule: Rule = {
  id: "font-family-token",
  description: "Signale les familles typographiques produit codées en dur au lieu de tokens Sent Tech.",
  principle: "design align --typo",
  wp7Finding: "P0.5 single-font / overused-font",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const { element, declarations } of extractInlineStyleBlocks(context)) {
      const family = rawFontFamily(declarations);
      if (!family) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Famille typographique brute '${family}' détectée.`,
        location: element.tagName ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}` : ":root",
        suggestion: "Utiliser un token typographique `--st-foundation-font-*` ou `--st-typography-*`."
      });
    }

    for (const block of extractCssRuleBlocks(context)) {
      if (block.selector.toLowerCase().includes("font-face")) continue;
      const family = rawFontFamily(block.declarations);
      if (!family) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Famille typographique brute '${family}' détectée.`,
        location: block.location,
        suggestion: "Remplacer la famille locale par un token de fondation typographique Sent Tech."
      });
    }

    return findings;
  }
};
