import type { Finding, Rule, RuleContext } from "../types.js";
import { createFindingFromElement } from "./utils.js";

const BADGE_SELECTOR = ".badge, .st-badge, .tag, .st-tag, [class*='badge'], [class*='Badge'], [class*='tag'], [class*='Tag'], [role='status']";

export const h1InlineBadgeRule: Rule = {
  id: "h1-inline-badge",
  description: "Signale les badges ou tags placés directement dans un H1.",
  principle: "design align --typo",
  wp7Finding: "P2.2 badge inline dans le H1",
  severity: "low",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const h1 of Array.from(context.document.querySelectorAll("h1"))) {
      if (!h1.querySelector(BADGE_SELECTOR)) continue;
      findings.push(
        createFindingFromElement(
          this.id,
          this.severity,
          "Badge/tag détecté dans un H1: mélange registre titre et méta UI.",
          h1,
          "Déplacer le badge dans un kicker, une méta sous le titre ou une zone de statut séparée."
        )
      );
    }

    return findings;
  }
};
