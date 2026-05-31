import type { Finding, Rule, RuleContext } from "../types.js";
import {
  extractCssRuleBlocks,
  extractInlineStyleBlocks,
  getDeclaration,
  isSentropicToken,
  type CssDeclaration
} from "./utils.js";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function expandHex(hex: string): [number, number, number] | undefined {
  const match = hex.match(HEX);
  if (!match) return undefined;
  const body = match[1];
  const full = body.length === 3 ? body.split("").map((c) => c + c).join("") : body;
  const int = Number.parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function luminance([r, g, b]: [number, number, number]): number {
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(fg: string, bg: string): number | undefined {
  const fgRgb = expandHex(fg);
  const bgRgb = expandHex(bg);
  if (!fgRgb || !bgRgb) return undefined;
  const l1 = luminance(fgRgb);
  const l2 = luminance(bgRgb);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function pairFromDeclarations(declarations: CssDeclaration[]): { fg?: string; bg?: string } {
  const fg = getDeclaration(declarations, "color");
  const bg = getDeclaration(declarations, "background-color") ?? getDeclaration(declarations, "background");
  return {
    fg: fg && !isSentropicToken(fg) ? fg.trim() : undefined,
    bg: bg && !isSentropicToken(bg) ? bg.trim().split(/\s+/)[0] : undefined
  };
}

export const contrastTokenPairRule: Rule = {
  id: "contrast-token-pair",
  description: "Calcule les paires couleur/fond hex explicites et signale les contrastes insuffisants.",
  principle: "design align --tones",
  wp7Finding: "P0.2 contraste/alignement chromatique incohérent sur fonds colorés",
  severity: "high",
  evaluate(context: RuleContext): Finding[] {
    const findings: Finding[] = [];

    for (const { element, declarations } of extractInlineStyleBlocks(context)) {
      const { fg, bg } = pairFromDeclarations(declarations);
      if (!fg || !bg) continue;
      const ratio = contrastRatio(fg, bg);
      if (ratio === undefined || ratio >= 4.5) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Contraste texte/fond insuffisant (${ratio.toFixed(2)}:1) sur une paire hex non tokenisée.`,
        location: element.tagName ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}` : ":root",
        suggestion: "Remplacer par des tokens sémantiques texte/surface déjà validés pour le contraste."
      });
    }

    for (const block of extractCssRuleBlocks(context)) {
      const { fg, bg } = pairFromDeclarations(block.declarations);
      if (!fg || !bg) continue;
      const ratio = contrastRatio(fg, bg);
      if (ratio === undefined || ratio >= 4.5) continue;
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: `Contraste texte/fond insuffisant (${ratio.toFixed(2)}:1) sur une paire hex non tokenisée.`,
        location: block.location,
        suggestion: "Utiliser les couples `--st-semantic-text-*` / `--st-semantic-surface-*` plutôt que des hex locaux."
      });
    }

    return findings;
  }
};
