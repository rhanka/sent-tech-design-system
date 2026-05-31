import type { Finding, Rule, RuleContext } from "../types.js";
import {
  extractCssRuleBlocks,
  extractInlineStyleBlocks,
  getDeclaration,
  isSentropicToken,
  parseCssLengthPx
} from "./utils.js";

const RAIL_HINT = /(rail|sidebar|side-nav|sidenav|nav-rail|left-nav|docs-nav)/i;

function radiusIsRounded(value: string | undefined): boolean {
  if (!value || isSentropicToken(value)) return false;
  const first = value.split(/\s+/)[0];
  const px = parseCssLengthPx(first);
  return px !== undefined && px > 0;
}

function hasRailIdentity(element: HTMLElement): boolean {
  const id = element.id || "";
  const className = element.getAttribute("class") || "";
  const role = element.getAttribute("role") || "";
  return RAIL_HINT.test(id) || RAIL_HINT.test(className) || RAIL_HINT.test(role);
}

export const railVsRadiusConsistencyRule: Rule = {
  id: "rail-vs-radius-consistency",
  description: "Détecte les rails de navigation latéraux qui portent un radius de surface.",
  principle: "design align --spacing",
  wp7Finding: "P1.4 rail gauche + surface arrondie dans le même langage visuel",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const { element, declarations } of extractInlineStyleBlocks(context)) {
      if (!hasRailIdentity(element)) continue;
      if (!radiusIsRounded(getDeclaration(declarations, "border-radius"))) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: "Rail de navigation avec border-radius non nul: mélange rail structurel et surface arrondie.",
        location: element.tagName ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}` : ":root",
        suggestion: "Garder le rail carré ou déplacer le radius sur une surface enfant qui n'exprime pas le rail."
      });
    }

    for (const block of extractCssRuleBlocks(context)) {
      if (!RAIL_HINT.test(block.selector)) continue;
      if (!radiusIsRounded(getDeclaration(block.declarations, "border-radius"))) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: "Sélecteur de rail avec border-radius non nul: langage visuel incohérent.",
        location: block.location,
        suggestion: "Utiliser un token de radius nul pour le rail, ou retirer l'identité de rail de cette surface."
      });
    }

    return findings;
  }
};
