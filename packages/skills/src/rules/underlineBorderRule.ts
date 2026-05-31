import type { Finding, Rule, RuleContext } from "../types.js";

function parsePx(value: string): number | undefined {
  const match = value.match(/([0-9]+(?:\.[0-9]+)?)px/);
  if (!match) return undefined;
  return Number(match[1]);
}

/**
 * Un champ de formulaire (input/select/textarea, ou classe `.st-control` /
 * `.st-field`) qui dessine son soulignement via un `border-bottom` épais EN DUR,
 * sans bordure complète autour de la boîte. Le filet bas « filled-underline »
 * (DSFR notamment) doit être rendu via `box-shadow: inset 0 -Npx …`, pas une
 * bordure géométrique : un `border-bottom` ajoute une hauteur réelle et casse
 * l'alignement par bord mesuré contre la référence officielle.
 */
const FIELD_SELECTOR = "input, select, textarea, .st-control, .st-field";

function getDecl(style: string, prop: string): string | undefined {
  const re = new RegExp(`(?:^|;)\\s*${prop}\\s*:([^;]*)`, "i");
  return style.match(re)?.[1]?.trim();
}

function hasHardcodedUnderline(element: Element): boolean {
  const style = (element as HTMLElement).getAttribute("style") || "";
  if (!style) return false;

  // Un `border` (raccourci) ou `border-width` global => boîte entière, pas un
  // simple filet bas : on ne signale pas (ce n'est pas l'anti-pattern visé).
  if (getDecl(style, "border") !== undefined) return false;
  if (getDecl(style, "border-width") !== undefined) return false;

  const bottom = getDecl(style, "border-bottom") ?? getDecl(style, "border-bottom-width");
  if (bottom === undefined) return false;

  // `border-bottom: none / 0` n'est pas un soulignement dessiné.
  const px = parsePx(bottom);
  if (px === undefined || px < 2) return false;

  return true;
}

export const underlineBorderRule: Rule = {
  id: "underline-hardcoded-border",
  description:
    "Signale un champ qui dessine son filet bas via un border-bottom en dur au lieu d'un box-shadow inset.",
  principle: "design align --spacing",
  wp7Finding: "P1.5 tailles d'espace bruitées / alignement par bord",
  severity: "low",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const element of Array.from(
      context.document.querySelectorAll<HTMLElement>(FIELD_SELECTOR)
    )) {
      if (!element.hasAttribute("style")) continue;
      if (!hasHardcodedUnderline(element)) continue;
      findings.push({
        ruleId: "underline-hardcoded-border",
        severity: "low",
        message:
          "Filet bas de champ dessiné via `border-bottom` en dur : ajoute une hauteur réelle et casse l'alignement par bord.",
        location: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}`,
        suggestion:
          "Rendre le soulignement via `box-shadow: inset 0 -Npx <couleur>` (technique DSFR) plutôt qu'une bordure géométrique."
      });
    }

    return findings;
  }
};
