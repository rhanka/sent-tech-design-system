import type { Finding, Rule, RuleContext } from "../types.js";
import { extractCssRuleBlocks, extractInlineStyleBlocks, isSentropicToken } from "./utils.js";

const MOTION_PROP = /^(transition|transition-duration|animation|animation-duration)$/;
const RAW_DURATION = /\b\d+(?:\.\d+)?m?s\b/i;

function hasMeaningfulMotion(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized !== "none" && normalized !== "0s" && normalized !== "0ms";
}

export const motionSubtleRule: Rule = {
  id: "motion-subtle",
  description: "Vérifie que les transitions/animations sont tokenisées et protégées par prefers-reduced-motion.",
  principle: "design polish --motion",
  wp7Finding: "P1.6 motion quasi absente + P2.5 absence de prefers-reduced-motion",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const styleCss = Array.from(context.document.querySelectorAll("style"))
      .map((style) => style.textContent || "")
      .join("\n");
    const hasReducedMotion = /prefers-reduced-motion/i.test(styleCss);
    let sawMotion = false;
    let sawRawDuration = false;

    for (const block of extractCssRuleBlocks(context)) {
      for (const declaration of block.declarations) {
        if (!MOTION_PROP.test(declaration.property)) continue;
        if (!hasMeaningfulMotion(declaration.value)) continue;
        sawMotion = true;
        if (!isSentropicToken(declaration.value) && RAW_DURATION.test(declaration.value)) {
          sawRawDuration = true;
        }
      }
    }

    for (const { declarations } of extractInlineStyleBlocks(context)) {
      for (const declaration of declarations) {
        if (!MOTION_PROP.test(declaration.property)) continue;
        if (!hasMeaningfulMotion(declaration.value)) continue;
        sawMotion = true;
        if (!isSentropicToken(declaration.value) && RAW_DURATION.test(declaration.value)) {
          sawRawDuration = true;
        }
      }
    }

    if (!sawMotion) return findings;
    if (!hasReducedMotion || sawRawDuration) {
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: "Motion détectée sans garde complète: préférer des durées tokenisées et une clause prefers-reduced-motion.",
        location: "head/style | inline-style",
        suggestion: "Utiliser `var(--st-motion-*)` et ajouter `@media (prefers-reduced-motion: reduce){...}`."
      });
    }

    return findings;
  }
};
