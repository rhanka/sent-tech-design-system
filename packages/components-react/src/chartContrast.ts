/**
 * Couleur de texte contrastée pour les labels posés *sur* les couleurs
 * catégorielles (`--st-semantic-data-category*`).
 *
 * Le texte blanc codé en dur échoue WCAG AA sur la plupart des tons clairs de
 * la palette (jaune, rose, sarcelle…). Comme la palette catégorielle est
 * identique sur tous les thèmes (Tableau 10), on peut pré-calculer la couleur
 * de texte (clair vs foncé) qui maximise le contraste pour chaque ton.
 *
 * Valeurs de référence (sent-tech / forge / entropic — identiques) :
 *   category1 #4E79A7  category2 #F28E2B  category3 #E15759  category4 #76B7B2
 *   category5 #59A14F  category6 #EDC948  category7 #B07AA1  category8 #FF9DA7
 *
 * Seul `category1` (bleu foncé) atteint un contraste suffisant avec du blanc ;
 * tous les autres tons exigent un texte foncé.
 */
const CATEGORY_FILLS: Record<string, string> = {
  category1: "#4E79A7",
  category2: "#F28E2B",
  category3: "#E15759",
  category4: "#76B7B2",
  category5: "#59A14F",
  category6: "#EDC948",
  category7: "#B07AA1",
  category8: "#FF9DA7",
};

const LIGHT_TEXT = "#ffffff";
const DARK_TEXT = "#0f172a";

function channelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Luminance relative WCAG d'une couleur `#rrggbb`. */
function relativeLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = channelToLinear((n >> 16) & 0xff);
  const g = channelToLinear((n >> 8) & 0xff);
  const b = channelToLinear(n & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const LIGHT_LUM = relativeLuminance(LIGHT_TEXT);
const DARK_LUM = relativeLuminance(DARK_TEXT);

/**
 * Retourne la couleur de texte (`#ffffff` ou `#0f172a`) offrant le meilleur
 * contraste sur un ton catégoriel. Inconnu/non catégoriel → texte clair.
 */
export function contrastTextForTone(tone: string | undefined): string {
  const fill = tone ? CATEGORY_FILLS[tone] : undefined;
  if (!fill) return LIGHT_TEXT;
  const bg = relativeLuminance(fill);
  return contrastRatio(bg, DARK_LUM) >= contrastRatio(bg, LIGHT_LUM) ? DARK_TEXT : LIGHT_TEXT;
}
