import type { Finding, Rule, RuleContext } from "../types.js";
import {
  extractCssRuleBlocks,
  extractInlineStyleBlocks,
  getDeclaration,
  isSentropicToken,
  parseCssLengthPx
} from "./utils.js";

const LONG_TEXT_THRESHOLD = 300;
const MAX_READING_CH = 75;

function maxWidthToCh(value: string): number | undefined {
  const trimmed = value.trim().toLowerCase();
  if (isSentropicToken(trimmed)) return undefined;
  const ch = trimmed.match(/^([0-9]+(?:\.[0-9]+)?)ch$/);
  if (ch) return Number(ch[1]);
  const px = parseCssLengthPx(trimmed);
  if (px !== undefined) return px / 8;
  return undefined;
}

function hasLongText(element: Element): boolean {
  return (element.textContent || "").replace(/\s+/g, " ").trim().length > LONG_TEXT_THRESHOLD;
}

function selectorTargetsReadableText(selector: string): boolean {
  return /(^|[\s,>+~])p\b|\.copy|\.body|\.prose|\.docs-section|\.docs-hero/.test(selector.toLowerCase());
}

function selectorHasLongText(context: RuleContext, selector: string): boolean {
  if (!selectorTargetsReadableText(selector)) return false;
  try {
    return Array.from(context.document.querySelectorAll(selector)).some(hasLongText);
  } catch {
    return true;
  }
}

export const lineLengthMaxWidthRule: Rule = {
  id: "line-length-max-width",
  description: "Signale les bornes de lecture trop larges même quand un max-width existe.",
  principle: "design align --typo",
  wp7Finding: "P0.4 longueur de ligne trop élevée",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const { element, declarations } of extractInlineStyleBlocks(context)) {
      if (!hasLongText(element)) continue;
      const maxWidth = getDeclaration(declarations, "max-width");
      if (!maxWidth) continue;
      const widthCh = maxWidthToCh(maxWidth);
      if (widthCh === undefined || widthCh <= MAX_READING_CH) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Max-width de lecture trop large (${Math.round(widthCh)}ch estimés).`,
        location: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}`,
        suggestion: "Borner les paragraphes autour de 65-75ch ou utiliser un token de largeur de lecture."
      });
    }

    for (const block of extractCssRuleBlocks(context)) {
      if (!selectorHasLongText(context, block.selector)) continue;
      const maxWidth = getDeclaration(block.declarations, "max-width");
      if (!maxWidth) continue;
      const widthCh = maxWidthToCh(maxWidth);
      if (widthCh === undefined || widthCh <= MAX_READING_CH) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Max-width de lecture trop large (${Math.round(widthCh)}ch estimés).`,
        location: block.location,
        suggestion: "Préférer `max-width: 65ch` ou un token Sent Tech équivalent."
      });
    }

    return findings;
  }
};
