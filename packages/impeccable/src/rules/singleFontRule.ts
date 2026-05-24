import type { Finding, Rule, RuleContext } from "../types.js";

const FONT_FAMILY_DECLARATION = /font-family\s*:\s*([^;!}]+);?/gi;

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
    token === "monospace" ||
    token === "ui-monospace" ||
    token === "courier new" ||
    token === "consolas"
  );
}

function extractFontFamilies(css: string): string[] {
  const families: string[] = [];
  const seen = new Set<string>();

  for (const match of css.matchAll(FONT_FAMILY_DECLARATION)) {
    const declaration = (match[1] || "").trim();
    const firstToken = declaration.split(",")[0];
    const normalized = normalizeFontToken(firstToken);
    if (!normalized) continue;
    if (!seen.has(normalized)) {
      families.push(normalized);
      seen.add(normalized);
    }
  }

  return families;
}

function collectFromStyleTags(context: RuleContext): string[] {
  const fontFamilies: string[] = [];
  const seen = new Set<string>();

  for (const styleElement of Array.from(context.document.querySelectorAll("style"))) {
    const css = styleElement.textContent || "";
    for (const family of extractFontFamilies(css)) {
      if (isMonospaceStyleToken(family)) continue;
      if (!seen.has(family)) {
        fontFamilies.push(family);
        seen.add(family);
      }
    }
  }

  return fontFamilies;
}

function collectFromInlineStyles(context: RuleContext): string[] {
  const fontFamilies: string[] = [];
  const seen = new Set<string>();

  for (const element of Array.from(context.document.querySelectorAll<HTMLElement>("[style]"))) {
    const inlineStyle = element.getAttribute("style") || "";
    for (const family of extractFontFamilies(inlineStyle)) {
      if (isMonospaceStyleToken(family)) continue;
      if (!seen.has(family)) {
        fontFamilies.push(family);
        seen.add(family);
      }
    }
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
        suggestion: "Introduire au moins deux familles textuelles distinctes (ex: var(--st-font-sans) et var(--st-font-serif) ou équivalent)."
      }
    ];
  }
};
