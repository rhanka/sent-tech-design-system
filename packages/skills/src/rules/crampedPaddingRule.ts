import type { Finding, Rule, RuleContext } from "../types.js";
import {
  extractCssRuleBlocks,
  extractInlineStyleBlocks,
  getDeclaration,
  isSentropicToken,
  parseCssLengthPx,
  type CssDeclaration
} from "./utils.js";

const SURFACE_SELECTOR_HINT =
  /(section|main|article|aside|\.docs-|\.card|\.panel|\.tile|\.surface|\.container|\.cmp)/i;

function minPaddingPx(declarations: CssDeclaration[]): number | undefined {
  const values = declarations
    .filter((decl) => decl.property === "padding" || decl.property.startsWith("padding-"))
    .flatMap((decl) => {
      if (isSentropicToken(decl.value)) return [];
      return decl.value.split(/\s+/).map((part) => parseCssLengthPx(part)).filter((value): value is number => value !== undefined);
    });

  if (values.length === 0) return undefined;
  return Math.min(...values);
}

function isSurfaceElement(element: HTMLElement): boolean {
  const tag = element.tagName.toLowerCase();
  const className = element.getAttribute("class") || "";
  return SURFACE_SELECTOR_HINT.test(tag) || SURFACE_SELECTOR_HINT.test(`.${className.replace(/\s+/g, ".")}`);
}

export const crampedPaddingRule: Rule = {
  id: "cramped-padding",
  description: "Signale les surfaces de contenu avec un padding inférieur à 8px quand il n'est pas tokenisé.",
  principle: "design align --spacing",
  wp7Finding: "P1.7 cramped spacing sur certains blocs docs",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const { element, declarations } of extractInlineStyleBlocks(context)) {
      if (!isSurfaceElement(element)) continue;
      const min = minPaddingPx(declarations);
      if (min === undefined || min >= 8) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Surface de contenu avec padding minimal ${min}px, trop dense pour le rythme Sent Tech.`,
        location: element.tagName ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}` : ":root",
        suggestion: "Utiliser un token de spacing Sent Tech et viser au moins 8px sur les surfaces de contenu."
      });
    }

    for (const block of extractCssRuleBlocks(context)) {
      if (!SURFACE_SELECTOR_HINT.test(block.selector)) continue;
      const explicitPadding = getDeclaration(block.declarations, "padding");
      if (explicitPadding && isSentropicToken(explicitPadding)) continue;
      const min = minPaddingPx(block.declarations);
      if (min === undefined || min >= 8) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Règle CSS avec padding minimal ${min}px, trop dense pour une surface documentaire.`,
        location: block.location,
        suggestion: "Remplacer par un token `--st-*` de spacing ou augmenter le padding minimal à 8px."
      });
    }

    return findings;
  }
};
