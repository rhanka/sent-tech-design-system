import type { Finding, Rule, RuleContext } from "../types.js";
import { createFindingFromElement } from "./utils.js";

const HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/g;

function collectBareHexFromInlineStyle(context: RuleContext): Finding[] {
  const findings: Finding[] = [];

  for (const element of context.document.querySelectorAll<HTMLElement>("[style]")) {
    const inlineStyle = element.getAttribute("style") || "";
    const hits = inlineStyle.match(HEX_COLOR);
    if (!hits) continue;

    findings.push(
      createFindingFromElement(
        "no-bare-hex",
        "high",
        `Couleur hex détectée dans un style inline (${hits.join(", ")}). Utilise un token Sent Tech.`,
        element
      )
    );
  }

  return findings;
}

function collectBareHexFromStyleTags(context: RuleContext): Finding[] {
  const findings: Finding[] = [];
  const styleElements = context.document.querySelectorAll("style");

  styleElements.forEach((styleElement, index) => {
    const css = styleElement.textContent || "";
    if (!HEX_COLOR.test(css)) return;
    findings.push({
      ruleId: "no-bare-hex",
      severity: "high",
      message: "Détection de couleurs hexadécimales dans un bloc <style>. Utilise des variables OKLCH.",
      location: styleElement.parentElement
        ? `${styleElement.parentElement.tagName.toLowerCase()} > style[${index + 1}]`
        : `style[${index + 1}]`,
      suggestion: "Remplace par des tokens: --st-* (couleur sémantique/tokenisée)."
    });
  });

  return findings;
}

export const noBareHexRule: Rule = {
  id: "no-bare-hex",
  description: "Interdit l'usage de couleurs hex dans le markup source.",
  principle: "design align --tones",
  wp7Finding: "P0.1 hard-coded colors dans la vitrine docs",
  severity: "high",
  evaluate(context: RuleContext): Finding[] {
    return [...collectBareHexFromInlineStyle(context), ...collectBareHexFromStyleTags(context)];
  }
};
