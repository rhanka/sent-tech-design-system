import DOSSIER_CSS from "./dossier.css?raw";

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

export { DOSSIER_CSS };

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
    try {
      if (dossierSheet === undefined) {
        dossierSheet = new CSSStyleSheet();
        dossierSheet.replaceSync(DOSSIER_CSS);
      }
      if (!adopted.includes(dossierSheet)) {
        (root as ShadowRoot).adoptedStyleSheets = [...adopted, dossierSheet];
      }
      return;
    } catch {
      dossierSheet = undefined;
    }
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
