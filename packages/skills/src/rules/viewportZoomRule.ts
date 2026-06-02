import type { Finding, Rule, RuleContext } from "../types.js";
import { createFindingFromElement } from "./utils.js";

function parseViewportContent(value: string | null): { userScalableNo: boolean; maxScale: number | null } {
  if (!value) return { userScalableNo: false, maxScale: null };

  let userScalableNo = false;
  let maxScale: number | null = null;

  for (const raw of value.split(",")) {
    const token = raw.trim().toLowerCase();
    if (!token) continue;

    const userScalableMatch = token.match(/^user-scalable\s*=\s*(.+)$/);
    if (userScalableMatch) {
      const value = userScalableMatch[1].trim();
      userScalableNo = value === "no" || value === "0";
      continue;
    }

    const maxScaleMatch = token.match(/^maximum-scale\s*=\s*(.+)$/);
    if (maxScaleMatch) {
      const parsed = Number(maxScaleMatch[1].trim());
      maxScale = Number.isFinite(parsed) ? parsed : maxScale;
    }
  }

  return { userScalableNo, maxScale };
}

export const viewportZoomRule: Rule = {
  id: "viewport-zoom",
  description: "Signale un viewport qui bloque ou limite excessivement le zoom de page.",
  principle: "design harden --a11y",
  wp7Finding: "P2.1 zoom utilisateur restreint",
  severity: "medium",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const metaViewport of Array.from(context.document.querySelectorAll<HTMLMetaElement>('meta[name="viewport"]'))) {
      const parsed = parseViewportContent(metaViewport.getAttribute("content"));
      const maxScale = parsed.maxScale;
      if (
        parsed.userScalableNo ||
        (typeof maxScale === "number" && Number.isFinite(maxScale) && maxScale < 2)
      ) {
        findings.push(
          createFindingFromElement(
            this.id,
            this.severity,
            "Le viewport bloque ou limite trop fortement le zoom (user-scalable=no ou maximum-scale < 2). Autorise le zoom utilisateur.",
            metaViewport,
            "Autoriser le zoom avec `user-scalable=yes` et/ou `maximum-scale=2`."
          )
        );
      }
    }

    return findings;
  }
};
