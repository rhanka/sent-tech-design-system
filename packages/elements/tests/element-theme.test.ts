/**
 * The theme scoping of the elements package (§6.3, §6.4, §15 AC-L2): the
 * committed theme stylesheets of `@sentropic/design-system-themes` address
 * their DARK blocks to `:root` (`packages/themes/src/compile.ts`: blocks 2
 * and 3 "always target `:root`"), and `:root` never matches inside a shadow
 * root. The element therefore adopts a SCOPED rewrite of the theme
 * stylesheet in its shadow root: the light block keeps its
 * `[data-st-theme="<id>"]` selector, and the two dark blocks are re-addressed
 * to the same selector so `prefers-color-scheme` and the explicit
 * `data-color-mode="dark"` keep working inside the shadow tree.
 *
 * RED HISTORY (observed 2026-11-05, before the implementation existed): the
 * suite failed at import — `src/element/theme/theme-scoping.js` did not
 * exist (vitest: "Failed to resolve import").
 */

import { describe, expect, it } from "vitest";
import { scopeThemeCss } from "../src/element/theme/theme-scoping.js";

const sample = `/* generated */
[data-st-theme="sent-tech"] {
  color-scheme: light;
  --st-color-slate-0: #ffffff;
}

@media (prefers-color-scheme: dark) {
    color-scheme: dark;
  :root:not([data-color-mode="light"]) {
  --st-color-slate-0: #0f172a;
}
}

:root[data-color-mode="dark"] {
  color-scheme: dark;
  --st-color-slate-0: #0f172a;
}
`;

describe("the theme stylesheet scoping", () => {
  it("keeps the light block's [data-st-theme] selector untouched", () => {
    const scoped = scopeThemeCss(sample, "sent-tech");
    expect(scoped).toContain('[data-st-theme="sent-tech"] {');
    expect(scoped).toContain("--st-color-slate-0: #ffffff;");
  });

  it("re-addresses the auto dark block to the theme scope", () => {
    const scoped = scopeThemeCss(sample, "sent-tech");
    expect(scoped).toContain('@media (prefers-color-scheme: dark) {');
    expect(scoped).toContain('[data-st-theme="sent-tech"]:not([data-color-mode="light"])');
    expect(scoped).not.toContain(":root:not(");
  });

  it("re-addresses the explicit dark block to the theme scope", () => {
    const scoped = scopeThemeCss(sample, "sent-tech");
    expect(scoped).toContain('[data-st-theme="sent-tech"][data-color-mode="dark"]');
    expect(scoped).not.toContain(':root[data-color-mode="dark"]');
  });

  it("is idempotent — a second pass changes nothing", () => {
    const once = scopeThemeCss(sample, "sent-tech");
    expect(scopeThemeCss(once, "sent-tech")).toBe(once);
  });
});
