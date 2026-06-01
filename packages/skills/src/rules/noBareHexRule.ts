import type { Finding, Rule, RuleContext } from "../types.js";
import { createFindingFromElement } from "./utils.js";

const HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/g;

function isInsideVarFunction(css: string, index: number): boolean {
  const before = css.slice(0, index);
  const openVar = before.lastIndexOf("var(");
  if (openVar === -1) return false;

  const closeParen = before.lastIndexOf(")");
  return closeParen < openVar;
}

function isCssCustomPropertyValue(css: string, index: number): boolean {
  const declarationStart = Math.max(css.lastIndexOf(";", index), css.lastIndexOf("{", index)) + 1;
  const declarationPrefix = css.slice(declarationStart, index);
  return /--[\w-]+\s*:[^;{]*$/.test(declarationPrefix);
}

function collectBareHexes(css: string): string[] {
  return Array.from(css.matchAll(HEX_COLOR))
    .filter((match) => {
      const index = match.index ?? 0;
      return !isInsideVarFunction(css, index) && !isCssCustomPropertyValue(css, index);
    })
    .map((match) => match[0]);
}

function collectBareHexFromInlineStyle(context: RuleContext): Finding[] {
  const findings: Finding[] = [];

  for (const element of context.document.querySelectorAll<HTMLElement>("[style]")) {
    const inlineStyle = element.getAttribute("style") || "";
    const hits = collectBareHexes(inlineStyle);
    if (hits.length === 0) continue;

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
    const hits = collectBareHexes(css);
    if (hits.length === 0) return;

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
