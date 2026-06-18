import type { Finding, Rule, RuleContext } from "../types.js";
import { createFindingFromElement } from "./utils.js";

const SURFACE_SELECTOR = [
  "[data-st-surface]",
  "[data-surface]",
  "[role='region']",
  "[role='complementary']",
  "[role='navigation']",
  "main",
  "section",
  "aside",
  "nav",
  ".st-appShell",
  ".st-navShell",
  ".st-contextPanel",
  ".st-utilityPanel",
  ".st-drawer",
  ".st-rail",
  ".st-panel",
  ".st-surface"
].join(",");

const PRIMARY_SELECTOR = [
  "[data-st-primary-action]",
  "[data-primary-action]",
  "[data-action-priority='primary']",
  "[aria-primary='true']",
  "[data-variant='primary']",
  "[variant='primary']",
  ".st-button--primary",
  ".button--primary",
  ".btn-primary"
].join(",");

const ACTION_ROLES = new Set(["button", "link", "menuitem", "tab"]);
const ACTION_TAGS = new Set(["a", "button", "input", "select", "summary", "textarea"]);

function isDisabledOrHidden(element: HTMLElement): boolean {
  return element.hasAttribute("disabled") || element.getAttribute("aria-hidden") === "true";
}

function isExplicitAction(element: HTMLElement): boolean {
  if (isDisabledOrHidden(element)) return false;

  const tagName = element.tagName.toLowerCase();
  const role = (element.getAttribute("role") || "").toLowerCase();
  if (ACTION_TAGS.has(tagName) || ACTION_ROLES.has(role)) return true;
  if (element.hasAttribute("href") || element.hasAttribute("onclick")) return true;
  if (element.hasAttribute("tabindex") && element.getAttribute("tabindex") !== "-1") return true;

  return element.matches("[data-st-primary-action],[data-primary-action],[data-action-priority='primary']");
}

function actionName(element: HTMLElement): string {
  const label =
    element.getAttribute("aria-label") ||
    element.getAttribute("title") ||
    (element.textContent || "").replace(/\s+/g, " ").trim();

  return label ? `"${label.slice(0, 40)}"` : element.tagName.toLowerCase();
}

export const navSystemPrimaryActionRule: Rule = {
  id: "navsystem-one-primary-action",
  description: "Signale les surfaces NavSystem avec plus d'une action primaire explicite.",
  principle: "WP23 NavSystem guardrails",
  wp7Finding: "WP23.1 multiple primary actions in one surface",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const buckets = new Map<HTMLElement, HTMLElement[]>();
    const fallbackSurface = (context.document.body || context.document.documentElement) as HTMLElement;

    for (const action of Array.from(context.document.querySelectorAll<HTMLElement>(PRIMARY_SELECTOR))) {
      if (!isExplicitAction(action)) continue;
      const surface = (action.closest(SURFACE_SELECTOR) as HTMLElement | null) || fallbackSurface;
      const actions = buckets.get(surface) || [];
      actions.push(action);
      buckets.set(surface, actions);
    }

    for (const [surface, actions] of buckets) {
      if (actions.length <= 1) continue;
      const preview = actions.slice(0, 3).map(actionName).join(", ");
      findings.push(
        createFindingFromElement(
          this.id,
          this.severity,
          `Surface avec ${actions.length} actions primaires explicites (${preview}).`,
          surface,
          "Garder une seule action primaire par surface; demouvoir les autres en actions secondaires ou menu."
        )
      );
    }

    return findings;
  }
};
