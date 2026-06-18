import type { Finding, Rule, RuleContext } from "../types.js";
import { createFindingFromElement, getNodePath } from "./utils.js";

const OPTION_SELECTOR = "option,[role='option'],[data-st-option],.st-option";

const NESTED_INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "summary",
  "textarea",
  "[role='button']",
  "[role='checkbox']",
  "[role='link']",
  "[role='menuitem']",
  "[role='switch']",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

function isIgnoredNestedControl(element: HTMLElement): boolean {
  return element.getAttribute("aria-hidden") === "true" || element.hasAttribute("disabled");
}

export const navSystemOptionInteractiveRule: Rule = {
  id: "navsystem-no-interactive-in-option",
  description: "Interdit les controles interactifs imbriques dans une option.",
  principle: "WP23 NavSystem guardrails",
  wp7Finding: "WP23.2 nested interactive control inside option",
  severity: "high",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const option of Array.from(context.document.querySelectorAll<HTMLElement>(OPTION_SELECTOR))) {
      const nested = Array.from(option.querySelectorAll<HTMLElement>(NESTED_INTERACTIVE_SELECTOR))
        .filter((element) => !isIgnoredNestedControl(element));

      if (nested.length === 0) continue;
      findings.push(
        createFindingFromElement(
          this.id,
          this.severity,
          `Option contenant un controle interactif imbrique (${getNodePath(nested[0])}).`,
          option,
          "Rendre la ligne option selectable elle-meme, ou deplacer les actions dans un menu/toolbar hors option."
        )
      );
    }

    return findings;
  }
};
