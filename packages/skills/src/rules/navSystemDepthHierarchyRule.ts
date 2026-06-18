import type { Finding, Rule, RuleContext } from "../types.js";
import { createFindingFromElement } from "./utils.js";

interface DepthContract {
  selector: string;
  label: string;
  maxDepth: number;
}

const CONTRACTS: DepthContract[] = [
  {
    selector: "[data-st-nav-surface='rail'],[data-nav-surface='rail'],[data-st-surface='rail'],.st-rail",
    label: "rail",
    maxDepth: 1
  },
  {
    selector: "[data-st-nav-surface='drawer'],[data-nav-surface='drawer'],[data-st-surface='drawer'],.st-drawer",
    label: "drawer",
    maxDepth: 2
  },
  {
    selector: "[data-st-nav-surface='panel'],[data-nav-surface='panel'],[data-st-surface='panel'],.st-panel,.st-contextPanel,.st-utilityPanel",
    label: "panel",
    maxDepth: 2
  },
  {
    selector: "[role='menu'],[role='tree'],.st-menu,.st-tree",
    label: "menu/tree",
    maxDepth: 3
  }
];

function hasDepthException(element: HTMLElement): boolean {
  return element.hasAttribute("data-st-depth-exception") || element.hasAttribute("data-nav-depth-exception");
}

function maxAriaLevel(element: HTMLElement): number {
  let max = 0;
  for (const node of Array.from(element.querySelectorAll<HTMLElement>("[aria-level]"))) {
    const raw = node.getAttribute("aria-level");
    const level = raw ? Number(raw) : 0;
    if (Number.isFinite(level)) max = Math.max(max, level);
  }
  return max;
}

function maxListDepth(root: Element, currentDepth = 0): number {
  let max = currentDepth;
  for (const child of Array.from(root.children)) {
    const tag = child.tagName.toLowerCase();
    const nextDepth = tag === "ul" || tag === "ol" ? currentDepth + 1 : currentDepth;
    max = Math.max(max, nextDepth, maxListDepth(child, nextDepth));
  }
  return max;
}

export const navSystemDepthHierarchyRule: Rule = {
  id: "navsystem-depth-hierarchy",
  description: "Signale les surfaces NavSystem dont la profondeur depasse le contrat statique.",
  principle: "WP23 NavSystem guardrails",
  wp7Finding: "WP23.4 excessive rail/drawer/tree hierarchy",
  severity: "low",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const seen = new Set<HTMLElement>();

    for (const contract of CONTRACTS) {
      for (const surface of Array.from(context.document.querySelectorAll<HTMLElement>(contract.selector))) {
        if (seen.has(surface) || hasDepthException(surface)) continue;
        seen.add(surface);

        const depth = Math.max(maxAriaLevel(surface), maxListDepth(surface));
        if (depth <= contract.maxDepth) continue;
        findings.push(
          createFindingFromElement(
            this.id,
            this.severity,
            `${contract.label} depth ${depth} depasse la limite ${contract.maxDepth}.`,
            surface,
            "Reduire la profondeur ou declarer un modele tree/menu explicite avec data-st-depth-exception si l'exception est voulue."
          )
        );
      }
    }

    return findings;
  }
};
