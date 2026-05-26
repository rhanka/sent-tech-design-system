import { openDom } from "./openDom.js";
import type { AuditTarget } from "../types.js";

export interface HeuristicReport {
  target: AuditTarget;
  score: number;
  heuristics: {
    cognitiveLoad: "low" | "medium" | "high";
    nielsenUsability: "compliant" | "warnings" | "issues";
    accessibilityFriction: "none" | "some" | "high";
  };
  metrics: {
    interactiveElements: number;
    maxDepth: number;
    textLength: number;
    unlabeledInputs: number;
    imagesWithoutAlt: number;
    inaccessibleControls: number;
    hasH1: boolean;
    skippedHeadingLevels: number;
  };
  recommendations: string[];
  durationMs: number;
}

function computeMaxDepth(el: Element, depth = 0): number {
  let max = depth;
  for (const child of Array.from(el.children)) {
    max = Math.max(max, computeMaxDepth(child, depth + 1));
  }
  return max;
}

/**
 * Deterministic heuristic review of a UI target. Unlike `check --tech` (rule
 * findings), this produces measured usability/accessibility signals and a
 * score derived from them — never a hard-coded number.
 */
export async function heuristicReview(target: AuditTarget): Promise<HeuristicReport> {
  const start = Date.now();
  const dom = await openDom(target);
  const doc = dom.window.document;
  const body = doc.body;

  const interactiveSelector =
    "a[href], button, input, select, textarea, [role='button'], [tabindex]:not([tabindex='-1'])";
  const interactiveElements = body ? body.querySelectorAll(interactiveSelector).length : 0;
  const maxDepth = body ? computeMaxDepth(body) : 0;
  const textLength = (body?.textContent ?? "").replace(/\s+/g, " ").trim().length;

  let unlabeledInputs = 0;
  for (const input of Array.from(doc.querySelectorAll("input, select, textarea"))) {
    const type = (input.getAttribute("type") || "").toLowerCase();
    if (["hidden", "submit", "button", "reset"].includes(type)) continue;
    const id = input.getAttribute("id");
    const hasLabelFor = id ? doc.querySelector(`label[for="${id}"]`) !== null : false;
    const wrapped = input.closest("label") !== null;
    const aria =
      input.getAttribute("aria-label") ||
      input.getAttribute("aria-labelledby") ||
      input.getAttribute("title");
    if (!hasLabelFor && !wrapped && !aria) unlabeledInputs++;
  }

  let imagesWithoutAlt = 0;
  for (const img of Array.from(doc.querySelectorAll("img"))) {
    if (!img.hasAttribute("alt")) imagesWithoutAlt++;
  }

  let inaccessibleControls = 0;
  for (const ctrl of Array.from(doc.querySelectorAll("a[href], button, [role='button']"))) {
    const text = (ctrl.textContent ?? "").trim();
    const aria =
      ctrl.getAttribute("aria-label") ||
      ctrl.getAttribute("aria-labelledby") ||
      ctrl.getAttribute("title");
    if (!text && !aria) inaccessibleControls++;
  }

  const headings = Array.from(doc.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  const hasH1 = doc.querySelector("h1") !== null;
  let skippedHeadingLevels = 0;
  let previousLevel = 0;
  for (const heading of headings) {
    const level = Number(heading.tagName.substring(1));
    if (previousLevel && level > previousLevel + 1) {
      skippedHeadingLevels += level - previousLevel - 1;
    }
    previousLevel = level;
  }

  dom.window.close();

  const recommendations: string[] = [];
  let score = 100;

  let cognitiveLoad: "low" | "medium" | "high" = "low";
  if (interactiveElements > 30 || maxDepth > 16) cognitiveLoad = "high";
  else if (interactiveElements > 14 || maxDepth > 11) cognitiveLoad = "medium";
  if (cognitiveLoad === "high") {
    score -= 12;
    recommendations.push(
      "Charge cognitive élevée : trop d'éléments interactifs ou imbrication trop profonde — regrouper, hiérarchiser, masquer le secondaire.",
    );
  } else if (cognitiveLoad === "medium") {
    score -= 6;
    recommendations.push("Charge cognitive modérée : prioriser les actions principales et alléger le secondaire.");
  }

  if (unlabeledInputs > 0) {
    score -= Math.min(20, unlabeledInputs * 5);
    recommendations.push(
      `${unlabeledInputs} champ(s) sans libellé accessible : ajouter <label for>, aria-label ou un label englobant.`,
    );
  }
  if (imagesWithoutAlt > 0) {
    score -= Math.min(16, imagesWithoutAlt * 4);
    recommendations.push(`${imagesWithoutAlt} image(s) sans attribut alt : fournir un texte alternatif (vide si décoratif).`);
  }
  if (inaccessibleControls > 0) {
    score -= Math.min(20, inaccessibleControls * 5);
    recommendations.push(`${inaccessibleControls} contrôle(s) sans intitulé accessible : ajouter du texte visible ou aria-label.`);
  }
  if (!hasH1 && textLength > 200) {
    score -= 8;
    recommendations.push("Aucun <h1> : définir un titre de page unique pour la structure et l'accessibilité.");
  }
  if (skippedHeadingLevels > 0) {
    score -= Math.min(9, skippedHeadingLevels * 3);
    recommendations.push(`Hiérarchie de titres : ${skippedHeadingLevels} saut(s) de niveau — ne pas sauter de niveaux (h1→h2→h3).`);
  }

  score = Math.max(0, Math.min(100, score));

  const accessibilityIssues = unlabeledInputs + imagesWithoutAlt + inaccessibleControls;
  const accessibilityFriction: "none" | "some" | "high" =
    accessibilityIssues === 0 ? "none" : accessibilityIssues <= 2 ? "some" : "high";
  const nielsenIssues = accessibilityIssues + (hasH1 ? 0 : 1) + skippedHeadingLevels;
  const nielsenUsability: "compliant" | "warnings" | "issues" =
    nielsenIssues === 0 ? "compliant" : nielsenIssues <= 3 ? "warnings" : "issues";

  if (recommendations.length === 0) {
    recommendations.push(
      "Aucun point de friction déterministe détecté. Une revue humaine reste recommandée pour le ressenti, le ton et le parcours.",
    );
  }

  return {
    target,
    score,
    heuristics: { cognitiveLoad, nielsenUsability, accessibilityFriction },
    metrics: {
      interactiveElements,
      maxDepth,
      textLength,
      unlabeledInputs,
      imagesWithoutAlt,
      inaccessibleControls,
      hasH1,
      skippedHeadingLevels,
    },
    recommendations,
    durationMs: Date.now() - start,
  };
}
