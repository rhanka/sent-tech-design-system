import type { Finding, Rule, RuleContext } from "../types.js";

function toPx(value: string): number | null {
  const match = value.match(/([0-9]+(?:\.[0-9]+)?)px/);
  if (!match) return null;
  return Number(match[1]);
}

function extractMinSize(styleValue: string): { minHeight?: number; minWidth?: number; height?: number; width?: number } {
  const style = styleValue || "";
  const minHeight = style.match(/min-height:\s*([^;]+)/i);
  const minWidth = style.match(/min-width:\s*([^;]+)/i);
  const height = style.match(/height:\s*([^;]+)/i);
  const width = style.match(/width:\s*([^;]+)/i);

  const parsedMinHeight = minHeight ? toPx(minHeight[1]) : null;
  const parsedMinWidth = minWidth ? toPx(minWidth[1]) : null;
  const parsedHeight = height ? toPx(height[1]) : null;
  const parsedWidth = width ? toPx(width[1]) : null;

  return {
    minHeight: parsedMinHeight !== null ? parsedMinHeight : undefined,
    minWidth: parsedMinWidth !== null ? parsedMinWidth : undefined,
    height: parsedHeight !== null ? parsedHeight : undefined,
    width: parsedWidth !== null ? parsedWidth : undefined
  };
}

function isInteractiveElement(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  const role = (element.getAttribute("role") || "").toLowerCase();

  if (["a", "button", "input", "textarea", "select", "summary", "label"].includes(tagName)) {
    return true;
  }

  if (["checkbox", "radio", "switch", "menuitem", "option", "combobox"].includes(role)) {
    return true;
  }

  return false;
}

export const touchTargetRule: Rule = {
  id: "touch-target-44",
  description: "Cible trop petite pour une interaction au clic (inline style only).",
  principle: "design align --a11y",
  wp7Finding: "P1.2 taille de cible tactile sous 44px",
  severity: "low",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const interactive = Array.from(context.document.querySelectorAll<HTMLElement>("*"));

    for (const element of interactive) {
      if (!isInteractiveElement(element)) continue;

      const style = element.getAttribute("style") || "";
      const sizes = extractMinSize(style);
      const height = sizes.minHeight ?? sizes.height;
      const width = sizes.minWidth ?? sizes.width;

      if (typeof height !== "number" || typeof width !== "number") continue;
      if (height >= 44 && width >= 44) continue;

      findings.push({
        ruleId: "touch-target-44",
        severity: "low",
        message: "Cible interactive trop petite (inférieure à 44px) détectée via style inline.",
        location: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}`,
        suggestion: "Ajuster la taille/cible interactive à au moins 44px quand possible."
      });
    }

    return findings;
  }
};
