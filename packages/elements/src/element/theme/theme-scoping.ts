/**
 * The theme stylesheet scoping of the elements package (§6.3, §6.4, §15
 * AC-L2). The committed theme stylesheets of
 * `@sentropic/design-system-themes` address their DARK blocks to `:root`
 * (`packages/themes/src/compile.ts`: blocks 2 and 3 « always target
 * `:root` »), and `:root` never matches inside a shadow root — a shadow tree
 * has no document root element. The element therefore adopts a SCOPED
 * rewrite of the theme stylesheet in its shadow root:
 *
 *   - the light block keeps its `[data-st-theme="<id>"]` selector (it
 *     already matches the element's internal root);
 *   - `:root:not([data-color-mode="light"])` (the `prefers-color-scheme`
 *     auto-dark block) becomes `[data-st-theme="<id>"]:not(...)`;
 *   - `:root[data-color-mode="dark"]` (the explicit dark block) becomes
 *     `[data-st-theme="<id>"][data-color-mode="dark"]`.
 *
 * Pure text rewrite, idempotent (a second pass changes nothing), applied
 * before the sheet is constructed and adopted in the shadow root — the
 * `--st-*` custom properties then inherit into the mounted Svelte component
 * exactly as on a themed page.
 */

/** The scope selector the dark blocks are re-addressed to. */
function scopeSelector(themeId: string): string {
  return `[data-st-theme="${themeId}"]`;
}

/**
 * Re-scope one theme stylesheet to the element's shadow root. Only the two
 * `:root` forms are rewritten; every other selector is preserved untouched.
 */
export function scopeThemeCss(css: string, themeId: string): string {
  return css
    // :root[data-color-mode="dark"] (and any :root[qualifier…] form).
    .replace(new RegExp(`(^|[\\s,>+~])\\:root(?=\\[data-color-mode=)`, "g"), `$1${scopeSelector(themeId)}`)
    // :root:not([data-color-mode="light"]).
    .replace(new RegExp(`(^|[\\s,>+~])\\:root(?=\\:not\\()`, "g"), `$1${scopeSelector(themeId)}`)
    // A bare :root (theme sheets keep none, but keep the rewrite total).
    .replace(new RegExp(`(^|[\\s,>+~])\\:root(?=[\\s,{])`, "g"), `$1${scopeSelector(themeId)}`);
}
