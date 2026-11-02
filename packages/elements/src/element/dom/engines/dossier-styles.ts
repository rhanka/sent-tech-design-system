/**
 * The dossier stylesheet of the `focus` engine chunk (F-R2, criteria 3 and
 * 8): one constructable stylesheet the renderer adopts in the shadow root
 * through the existing theme path, so it survives the §6.4 strict row like
 * the wrapper sheets. Every colour resolves to a `--st-*` token; card
 * outlines are `1px solid var(--st-…)` and no rule exceeds 1 px.
 *
 * English in code per repo rules. No colour literal appears below: only
 * `var(--st-*)` references plus neutral layout keywords.
 */

/** Fold threshold in characters (AMB-L6-2): the pinned focus readability cap. */
export const FOLD_THRESHOLD_CHARS = 300;

/** One stylesheet shared by every dossier root on the page. */
let dossierSheet: CSSStyleSheet | undefined;

/** The chunk CSS: token colours only, strokes capped at 1 px. */
export const DOSSIER_CSS = [
  ".st-dossier{display:block;color:var(--st-semantic-text-primary);}",
  ".st-dossier__header{margin:0 0 var(--st-spacing-4);}",
  ".st-dossier__subject{margin:0 0 var(--st-spacing-1);color:var(--st-semantic-text-secondary);}",
  ".st-dossier__title{margin:0;color:var(--st-semantic-text-primary);}",
  ".st-dossier__prose{color:var(--st-semantic-text-primary);}",
  ".st-dossier__prose p{margin:0 0 var(--st-spacing-2);}",
  ".st-dossier__prose a{color:var(--st-semantic-action-primary);}",
  ".st-dossier__prose code{color:var(--st-semantic-text-secondary);}",
  ".st-dossier__question{margin:0 0 var(--st-spacing-3);}",
  ".st-dossier__questionText{margin:0 0 var(--st-spacing-1);color:var(--st-semantic-text-primary);}",
  ".st-dossier__state{display:inline-block;border:var(--st-borderWidth-thin) var(--st-borderStyle-solid) var(--st-semantic-border-strong);border-radius:var(--st-radius-pill);padding:0 var(--st-spacing-2);color:var(--st-semantic-text-secondary);}",
  ".st-dossier__questionContext{margin:var(--st-spacing-1) 0 0;color:var(--st-semantic-text-secondary);}",
  ".st-dossier__readingTime{margin:var(--st-spacing-1) 0 0;color:var(--st-semantic-text-muted);}",
  ".st-dossier__questionAnswer{margin:var(--st-spacing-1) 0 0;color:var(--st-semantic-text-secondary);}",
  ".st-dossier__questionReco{margin:var(--st-spacing-1) 0 0;color:var(--st-semantic-text-secondary);}",
  '.st-dossier__options[data-st-layout="list"]{display:flex;flex-direction:column;gap:var(--st-spacing-2);}',
  '.st-dossier__options[data-st-layout="grid"]{display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:var(--st-spacing-2);}',
  ".st-dossier__optionsTitle{margin:0;color:var(--st-semantic-text-secondary);}",
  ".st-dossier__optionCard{display:flex;flex-direction:column;gap:var(--st-spacing-2);align-items:flex-start;text-align:left;cursor:pointer;border:var(--st-borderWidth-thin) var(--st-borderStyle-solid) var(--st-semantic-border-subtle);border-radius:var(--st-radius-md);padding:var(--st-spacing-3);background-color:var(--st-semantic-surface-default);color:var(--st-semantic-text-primary);}",
  '.st-dossier__optionCard[data-st-selected="true"]{border-color:var(--st-semantic-border-interactive);background-color:var(--st-semantic-surface-subtle);}',
  ".st-dossier__optionCard:focus-visible{outline:var(--st-borderWidth-thin) var(--st-borderStyle-solid) var(--st-focus-color);outline-offset:1px;}",
  ".st-dossier__optionCard--disabled{cursor:default;color:var(--st-semantic-text-secondary);}",
  ".st-dossier__optionLabel{font-weight:600;}",
  ".st-dossier__badge{align-self:flex-start;font-size:var(--st-component-badge-fontSize);font-weight:var(--st-component-badge-fontWeight);line-height:var(--st-component-badge-lineHeight);padding:var(--st-component-badge-paddingBlock) var(--st-component-badge-paddingInline);border-radius:var(--st-component-badge-radius);background-color:var(--st-component-badge-infoBackground);color:var(--st-component-badge-infoText);}",
  ".st-dossier__optionConsequence{color:var(--st-semantic-text-secondary);}",
  ".st-dossier__optionAnnotation{color:var(--st-semantic-text-secondary);}",
  '.st-dossier__optionAnnotation[data-annotation="accept"]{color:var(--st-semantic-feedback-success);}',
  '.st-dossier__optionAnnotation[data-annotation="reject"]{color:var(--st-semantic-feedback-error);}',
  '.st-dossier__optionAnnotation[data-annotation="comment"]{color:var(--st-semantic-feedback-info);}',
  ".st-dossier__optionAnnotationComment{color:var(--st-semantic-text-secondary);font-style:italic;}",
  ".st-dossier__optionBody{color:var(--st-semantic-text-primary);}",
  ".st-dossier__optionBody[hidden]{display:none;}",
  ".st-dossier__optionFold{align-self:flex-start;cursor:pointer;border:var(--st-borderWidth-thin) var(--st-borderStyle-solid) var(--st-semantic-border-subtle);border-radius:var(--st-radius-pill);padding:var(--st-spacing-1) var(--st-spacing-2);background-color:var(--st-semantic-surface-default);color:var(--st-semantic-action-primary);}",
  ".st-dossier__outcome{margin:var(--st-spacing-3) 0 0;}",
  ".st-dossier__outcomeText{margin:0;color:var(--st-semantic-text-primary);}",
  ".st-dossier__modality{display:inline-block;border:var(--st-borderWidth-thin) var(--st-borderStyle-solid) var(--st-semantic-border-strong);border-radius:var(--st-radius-pill);padding:0 var(--st-spacing-2);color:var(--st-semantic-text-secondary);}",
  ".st-dossier__trace{margin:var(--st-spacing-3) 0 0;padding-left:var(--st-spacing-4);color:var(--st-semantic-text-secondary);}",
  ".st-dossier__traceFooter{margin:var(--st-spacing-3) 0 0;color:var(--st-semantic-text-secondary);}",
  ".st-dossier__provenance{margin:var(--st-spacing-2) 0 0;color:var(--st-semantic-text-muted);}",
  ".st-dossier__diagram{margin:var(--st-spacing-3) 0 0;border:var(--st-borderWidth-thin) var(--st-borderStyle-solid) var(--st-semantic-border-subtle);border-radius:var(--st-radius-md);padding:var(--st-spacing-3);}",
  ".st-dossier__diagramAlt{margin:0 0 var(--st-spacing-1);color:var(--st-semantic-text-secondary);}",
  ".st-dossier__diagramSource{margin:0;color:var(--st-semantic-text-primary);}",
  ".st-dossier__unknownSection{color:var(--st-semantic-text-secondary);}",
].join("\n");

function sheetSupported(): boolean {
  return typeof CSSStyleSheet !== "undefined";
}

/**
 * Adopt the dossier sheet in one shadow root or document. Shared instance
 * like the theme sheets; falls back to a `<style>` element where
 * constructable sheets are unavailable (the wrapper observer converts it
 * under a strict CSP, §6.4).
 */
export function adoptDossierSheet(root: ShadowRoot | Document): void {
  const adopted = (root as ShadowRoot).adoptedStyleSheets;
  if (sheetSupported() && Array.isArray(adopted)) {
    if (dossierSheet === undefined) {
      dossierSheet = new CSSStyleSheet();
      dossierSheet.replaceSync(DOSSIER_CSS);
    }
    if (!adopted.includes(dossierSheet)) {
      (root as ShadowRoot).adoptedStyleSheets = [...adopted, dossierSheet];
    }
    return;
  }
  const owner = root as unknown as ParentNode;
  const existing = owner.querySelector?.("style[data-st-dossier-sheet]");
  if (existing !== null && existing !== undefined) return;
  const style = (root as unknown as Document).createElement?.("style") ?? document.createElement("style");
  style.setAttribute("data-st-dossier-sheet", "");
  style.textContent = DOSSIER_CSS;
  const host = root as unknown as { head?: HTMLElement };
  if (root === document && host.head !== undefined) {
    host.head.append(style);
  } else if (owner instanceof ShadowRoot) {
    owner.append(style);
  } else {
    document.head.append(style);
  }
}
