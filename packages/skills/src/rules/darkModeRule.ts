import type { Finding, Rule, RuleContext } from "../types.js";
import {
  extractCssRuleBlocks,
  extractLinkedCssRuleBlocks,
  type CssRuleBlock
} from "./utils.js";

const INTERACTIVE_PROPERTIES = new Set([
  "background",
  "background-color",
  "color",
  "border",
  "border-color",
  "fill",
  "stroke",
  "box-shadow"
]);

const DARK_MODE_MEDIA_RE = /@media\s*\([^)]*prefers-color-scheme\s*:\s*dark[^)]*\)/i;

function hasThemeAwareColorDeclarations(blocks: CssRuleBlock[]): boolean {
  return blocks.some((block) =>
    block.declarations.some((declaration) => INTERACTIVE_PROPERTIES.has(declaration.property))
  );
}

function hasPreferredColorSchemeQuery(blocks: CssRuleBlock[]): boolean {
  return blocks.some((block) => DARK_MODE_MEDIA_RE.test(block.location) || DARK_MODE_MEDIA_RE.test(block.selector));
}

export const darkModeRule: Rule = {
  id: "missing-dark-mode",
  description: "Signale l'absence de prise en compte du mode sombre.",
  principle: "design align --theme",
  wp7Finding: "P2-1 dark-mode absent",
  severity: "low",
  evaluate(context: RuleContext): Finding[] {
    const cssBlocks = [...extractCssRuleBlocks(context), ...extractLinkedCssRuleBlocks(context)];
    if (!hasThemeAwareColorDeclarations(cssBlocks)) {
      return [];
    }

    if (hasPreferredColorSchemeQuery(cssBlocks)) {
      return [];
    }

    return [
      {
        ruleId: "missing-dark-mode",
        severity: "low",
        message:
          "Aucune requête `prefers-color-scheme` n'est détectée alors que des styles colorés sont présents. Ajouter une variante `dark` (ou `light/dark`) pour la lisibilité en mode sombre.",
        location: context.document.documentElement.tagName.toLowerCase()
      }
    ];
  }
};
