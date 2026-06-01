import type { Finding, Rule, RuleContext } from "../types.js";
import {
  extractCssRuleBlocks,
  extractInlineStyleBlocks,
  extractLinkedCssRuleBlocks,
  getDeclaration
} from "./utils.js";

function normalizeFontToken(value: string): string | undefined {
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  const lower = trimmed.toLowerCase();
  const varMatch = lower.match(/^var\((--[^,\s)]+)/i);

  if (!lower) return undefined;
  if (["inherit", "initial", "unset", "revert", "unset", "default"].includes(lower)) {
    return undefined;
  }
  if (varMatch) return `var(${varMatch[1]})`;

  return lower;
}

function isMonospaceStyleToken(token: string): boolean {
  return (
    token.includes("--st-font-mono") ||
    token.includes("--st-foundation-font-mono") ||
    token === "monospace" ||
    token === "ui-monospace" ||
    token === "courier new" ||
    token === "consolas"
  );
}

function collectFromStyleTags(context: RuleContext): string[] {
  const fontFamilies: string[] = [];
  const seen = new Set<string>();

  for (const block of [...extractCssRuleBlocks(context), ...extractLinkedCssRuleBlocks(context)]) {
    if (block.selector.toLowerCase() === "font-face") continue;

    const declaration = getDeclaration(block.declarations, "font-family");
    if (!declaration) continue;

    const normalized = normalizeFontToken(declaration.split(",")[0] || "");
    if (!normalized || isMonospaceStyleToken(normalized) || seen.has(normalized)) continue;
    fontFamilies.push(normalized);
    seen.add(normalized);
  }

  return fontFamilies;
}

function collectFromInlineStyles(context: RuleContext): string[] {
  const fontFamilies: string[] = [];
  const seen = new Set<string>();

  for (const entry of extractInlineStyleBlocks(context)) {
    const declaration = getDeclaration(entry.declarations, "font-family");
    if (!declaration) continue;

    const normalized = normalizeFontToken(declaration.split(",")[0] || "");
    if (!normalized || isMonospaceStyleToken(normalized) || seen.has(normalized)) continue;
    fontFamilies.push(normalized);
    seen.add(normalized);
  }

  return fontFamilies;
}

function isSingleFamily(fontFamilies: string[]): boolean {
  const normalized = new Set(fontFamilies.filter((family) => !isMonospaceStyleToken(family)));
  return normalized.size <= 1;
}

export const singleFontRule: Rule = {
  id: "single-font",
  description: "Détecte les pages qui n'utilisent qu'une seule famille typographique principale.",
  principle: "design align --typo",
  wp7Finding: "P0.5 single-font / overused-font",
  severity: "high",
  evaluate(context: RuleContext): Finding[] {
    const styleFonts = [...collectFromStyleTags(context), ...collectFromInlineStyles(context)];

    if (styleFonts.length === 0) {
      return [];
    }

    if (!isSingleFamily(styleFonts)) {
      return [];
    }

    return [
      {
        ruleId: "single-font",
        severity: "high",
        message:
          "Une seule famille typographique principale est détectée (ou quasi uniquement une variante). " +
          "Prévoir une hiérarchie visuelle (display + body) via des variables distinctes.",
        location: "head/style | inline-style",
        suggestion: "Introduire une hiérarchie distincte via les tokens exposés, par exemple var(--st-foundation-font-display) et var(--st-foundation-font-sans)."
      }
    ];
  }
};
