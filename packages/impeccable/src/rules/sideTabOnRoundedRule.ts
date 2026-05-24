import type { Finding, Rule, RuleContext } from "../types.js";

function parsePx(value: string): number | undefined {
  const match = value.match(/([0-9]+(?:\.[0-9]+)?)px/);
  if (!match) return undefined;
  return Number(match[1]);
}

function hasSideTabWithRoundedBorder(element: Element): boolean {
  const style = (element as HTMLElement).getAttribute("style") || "";
  const borderLeftPart = style.match(/border-left(?:-width)?:[^;]*/i)?.[0] || "";
  const radiusPart = style.match(/border-radius[^;]*/i)?.[0] || "";

  if (!borderLeftPart || !radiusPart) return false;

  const borderLeftPx = parsePx(borderLeftPart);
  const radiusPx = parsePx(radiusPart);
  const noPxRadiusValue = radiusPart.match(/border-radius:\s*([^\s;]+)/i)?.[1];

  return (borderLeftPx !== undefined && borderLeftPx >= 2) && !!noPxRadiusValue && noPxRadiusValue !== "0" && noPxRadiusValue !== "0px";
}

export const sideTabOnRoundedRule: Rule = {
  id: "side-tab-on-rounded",
  description: "Alerte la combinaison bordure gauche colorée + radius non nul (rail gauche + arrondi).",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const element of Array.from(context.document.querySelectorAll<HTMLElement>("[style]"))) {
      if (!hasSideTabWithRoundedBorder(element)) continue;
      findings.push({
        ruleId: "side-tab-on-rounded",
        severity: "medium",
        message:
          "Une bordure latérale épaisse détectée avec un border-radius. Éviter ce mélange dans une même surface.",
        location: element.tagName ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}` : ":root",
        suggestion: "Soit retirer le radius (rail), soit retirer la bordure latérale quand tu veux du radius."
      });
    }

    return findings;
  }
};
