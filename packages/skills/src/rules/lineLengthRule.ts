import type { Finding, Rule, RuleContext } from "../types.js";
import {
  extractCssRuleBlocks,
  extractLinkedCssRuleBlocks,
  getDeclaration,
  parseDeclarations,
  type CssRuleBlock
} from "./utils.js";

const LONG_TEXT_THRESHOLD = 300;

function hasMaxWidthDeclaration(declarations: CssRuleBlock["declarations"]): boolean {
  const maxWidth = getDeclaration(declarations, "max-width")?.trim().toLowerCase();
  return Boolean(maxWidth && !["none", "unset", "initial"].includes(maxWidth));
}

function selectorMatchesElementOrAncestor(selector: string, element: Element): boolean {
  let current: Element | null = element;
  while (current) {
    try {
      if (current.matches(selector)) return true;
    } catch {
      return selector
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .some((part) => {
          try {
            return current?.matches(part) ?? false;
          } catch {
            return false;
          }
        });
    }
    current = current.parentElement;
  }
  return false;
}

function hasLineLengthCap(element: Element, cssBlocks: CssRuleBlock[]): boolean {
  if (hasMaxWidthDeclaration(parseDeclarations(element.getAttribute("style") || ""))) {
    return true;
  }

  return cssBlocks.some(
    (block) => hasMaxWidthDeclaration(block.declarations) && selectorMatchesElementOrAncestor(block.selector, element)
  );
}

export const lineLengthRule: Rule = {
  id: "line-length-cap",
  description: "Les blocs de texte sans borne de largeur peuvent créer des lignes trop longues.",
  principle: "design align --typo",
  wp7Finding: "P0.4 longueur de ligne trop élevée",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const textNodes = context.document.querySelectorAll("p, .docs-section p");
    const cssBlocks = [...extractCssRuleBlocks(context), ...extractLinkedCssRuleBlocks(context)];

    for (const element of Array.from(textNodes)) {
      const text = (element.textContent || "").replace(/\s+/g, " ").trim();
      if (text.length <= LONG_TEXT_THRESHOLD) continue;
      if (!hasLineLengthCap(element, cssBlocks)) {
        findings.push({
          ruleId: "line-length-cap",
          severity: "medium",
          message: "Texte dense sans max-width explicite. Ajouter max-width (>= 65ch) pour limiter la fatigue de lecture.",
          location: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}`,
          suggestion: "Ajouter `max-width: 65ch` (ou un token équivalent) sur conteneur paragraphes."
        });
      }
    }

    return findings;
  }
};
