import type { Finding, Rule, RuleContext } from "../types.js";
import { createFindingFromElement } from "./utils.js";

const NAV_SURFACE_SELECTOR = [
  "[data-st-surface]",
  "[data-surface]",
  "[role='navigation']",
  "nav",
  ".st-contextPanel",
  ".st-utilityPanel",
  ".st-drawer",
  ".st-rail",
  ".st-panel"
].join(",");

const STATE_HINT = /(?:^|[-_\s])(status|state|success|warning|error|danger|info|critical|positive|negative|neutral)(?:$|[-_\s])/i;
const COLOR_DECLARATION = /\b(?:color|background|background-color|border-color)\s*:/i;
const STATE_TOKEN = /var\(\s*--st-[^)]+(?:status|state|success|warning|error|danger|info|critical|positive|negative|neutral)[^)]*\)/i;

function attributeText(element: HTMLElement): string {
  const parts = [
    element.id,
    element.getAttribute("class") || "",
    element.getAttribute("data-state") || "",
    element.getAttribute("data-status") || "",
    element.getAttribute("data-intent") || "",
    element.getAttribute("data-variant") || ""
  ];
  return parts.join(" ");
}

function hasStateColorSignal(element: HTMLElement): boolean {
  const attrs = attributeText(element);
  if (!STATE_HINT.test(attrs)) return false;

  const style = element.getAttribute("style") || "";
  if (!style) return true;
  return COLOR_DECLARATION.test(style) || STATE_TOKEN.test(style);
}

function hasStateLabel(element: HTMLElement): boolean {
  if (element.getAttribute("aria-label")) return true;
  if (element.getAttribute("aria-labelledby")) return true;
  if (element.getAttribute("title")) return true;
  if (element.getAttribute("data-state-label")) return true;

  const ownText = (element.textContent || "").replace(/\s+/g, " ").trim();
  if (ownText.length > 1) return true;

  const parentText = (element.parentElement?.textContent || "").replace(/\s+/g, " ").trim();
  return parentText.length > ownText.length + 2;
}

export const navSystemColorStateRule: Rule = {
  id: "navsystem-color-state-only",
  description: "Signale les marqueurs couleur/etat sans libelle d'etat dans une surface NavSystem.",
  principle: "WP23 NavSystem guardrails",
  wp7Finding: "WP23.3 color state requires semantic label",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const surfaces = Array.from(context.document.querySelectorAll<HTMLElement>(NAV_SURFACE_SELECTOR));

    for (const surface of surfaces) {
      const candidates = [surface, ...Array.from(surface.querySelectorAll<HTMLElement>("*"))];
      for (const element of candidates) {
        if (!hasStateColorSignal(element)) continue;
        if (hasStateLabel(element)) continue;
        findings.push(
          createFindingFromElement(
            this.id,
            this.severity,
            "Marqueur couleur/etat sans libelle explicite.",
            element,
            "Ajouter un libelle visible, aria-label/title ou data-state-label; la couleur ne doit pas porter l'etat seule."
          )
        );
      }
    }

    return findings;
  }
};
