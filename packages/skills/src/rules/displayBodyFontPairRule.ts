import type { Finding, Rule, RuleContext } from "../types.js";
import { extractCssRuleBlocks, extractInlineStyleBlocks, getDeclaration, isSentropicToken } from "./utils.js";

function normalizeFontFamily(value: string): string | undefined {
  const raw = value.split(",")[0]?.trim().replace(/^["']|["']$/g, "").toLowerCase();
  if (!raw) return undefined;
  if (["inherit", "initial", "unset", "revert"].includes(raw)) return undefined;
  if (raw === "sans-serif" || raw === "serif" || raw === "monospace" || raw === "system-ui") return undefined;
  if (isSentropicToken(value)) {
    const match = value.toLowerCase().match(/var\(\s*(--[^,\s)]+)/);
    return match ? `var(${match[1]})` : undefined;
  }
  return raw;
}

function selectorRole(selector: string): "display" | "body" | undefined {
  const normalized = selector.toLowerCase();
  if (/(^|[\s,>+~])h[1-2]\b|\.docs-hero|\.hero|\.title|\.display/.test(normalized)) return "display";
  if (/(^|[\s,>+~])body\b|(^|[\s,>+~])p\b|\.copy|\.body|\.prose|\.docs-section/.test(normalized)) return "body";
  return undefined;
}

function elementRole(element: HTMLElement): "display" | "body" | undefined {
  const tag = element.tagName.toLowerCase();
  const className = element.getAttribute("class")?.toLowerCase() || "";
  if (/^h[1-2]$/.test(tag) || /docs-hero|hero|title|display/.test(className)) return "display";
  if (tag === "body" || tag === "p" || /copy|body|prose|docs-section/.test(className)) return "body";
  return undefined;
}

export const displayBodyFontPairRule: Rule = {
  id: "display-body-font-pair",
  description: "Détecte une même famille typographique pour les rôles display et body.",
  principle: "design align --typo",
  wp7Finding: "P0.5 single-font / overused-font",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const displayFamilies = new Map<string, string>();
    const bodyFamilies = new Map<string, string>();

    for (const block of extractCssRuleBlocks(context)) {
      const value = getDeclaration(block.declarations, "font-family");
      if (!value) continue;
      const family = normalizeFontFamily(value);
      const role = selectorRole(block.selector);
      if (!family || !role) continue;
      if (role === "display") displayFamilies.set(family, block.location);
      if (role === "body") bodyFamilies.set(family, block.location);
    }

    for (const { element, declarations } of extractInlineStyleBlocks(context)) {
      const value = getDeclaration(declarations, "font-family");
      if (!value) continue;
      const family = normalizeFontFamily(value);
      const role = elementRole(element);
      if (!family || !role) continue;
      const location = `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}`;
      if (role === "display") displayFamilies.set(family, location);
      if (role === "body") bodyFamilies.set(family, location);
    }

    for (const [family, displayLocation] of displayFamilies) {
      const bodyLocation = bodyFamilies.get(family);
      if (!bodyLocation) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Même famille typographique '${family}' utilisée pour display et body.`,
        location: `${displayLocation} + ${bodyLocation}`,
        suggestion: "Séparer les rôles display/body via des tokens distincts pour restaurer la hiérarchie."
      });
      break;
    }

    return findings;
  }
};
