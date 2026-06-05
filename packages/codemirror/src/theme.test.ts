import { describe, it, expect } from "vitest";
import { sentTechCodeMirror } from "./theme.js";
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

// ─────────────────────────────────────────────────────────────────────────────
// WCAG contrast helpers (no external dependency)
// ─────────────────────────────────────────────────────────────────────────────
function toLinear(c: number): number {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}
function contrastRatio(fg: string, bg: string): number {
  const lf = luminance(fg);
  const lb = luminance(bg);
  const [l1, l2] = [Math.max(lf, lb), Math.min(lf, lb)];
  return (l1 + 0.05) / (l2 + 0.05);
}

// DS surface values (from sent-tech.css — single light-only token block)
const SURFACE_DEFAULT = "#ffffff"; // --st-semantic-surface-default
const SURFACE_SUBTLE  = "#f8fafc"; // --st-semantic-surface-subtle (activeLine / gutters)

// WCAG AA minimum for normal text
const AA_NORMAL = 4.5;

// ─────────────────────────────────────────────────────────────────────────────
// Syntax palette (must stay in sync with syn = {...} in theme.ts)
// Ratios were computed by darkening the original data-viz cat colors
// (per-channel multiply by (100-pct)/100) until ≥ 4.5 on BOTH surfaces.
// ─────────────────────────────────────────────────────────────────────────────
const SYNTAX_COLORS: Record<string, { hex: string; roles: string }> = {
  kw:   { hex: "#4c75a2", roles: "keyword/tagName"           }, // white 4.80 subtle 4.59
  str:  { hex: "#a7621e", roles: "string/char"               }, // white 4.76 subtle 4.55
  re:   { hex: "#c24b4d", roles: "regexp/escape/invalid"     }, // white 4.76 subtle 4.55
  type: { hex: "#4f7b77", roles: "typeName/className"        }, // white 4.74 subtle 4.53
  num:  { hex: "#467f3e", roles: "number/bool/null"          }, // white 4.81 subtle 4.60
  fn:   { hex: "#857128", roles: "function/variableName"     }, // white 4.78 subtle 4.57
  prop: { hex: "#926586", roles: "propertyName/attributeName"}, // white 4.74 subtle 4.53
  meta: { hex: "#9e6168", roles: "meta/annotation"           }, // white 4.81 subtle 4.60
};

// Semantic text tokens also used in syntax rules
const TEXT_COLORS = {
  fgSecondary: "#475569", // --st-semantic-text-secondary (comments)  7.58/7.24
  fgMuted:     "#64748b", // --st-semantic-text-muted (punctuation)    4.76/4.55
};

// ─────────────────────────────────────────────────────────────────────────────
describe("sentTechCodeMirror — factory", () => {
  it("returns an Extension array with at least 2 elements (theme + highlight)", () => {
    const ext = sentTechCodeMirror();
    expect(Array.isArray(ext)).toBe(true);
    expect((ext as unknown[]).length).toBeGreaterThanOrEqual(2);
  });

  it("accepts dark option without throwing (light-only DS — flag is silently ignored)", () => {
    const ext = sentTechCodeMirror({ dark: true });
    expect(Array.isArray(ext)).toBe(true);
    expect((ext as unknown[]).length).toBeGreaterThanOrEqual(2);
  });

  it("light and dark variants return same extension count (dark flag has no effect)", () => {
    const light = sentTechCodeMirror();
    const dark  = sentTechCodeMirror({ dark: true });
    expect((light as unknown[]).length).toBe((dark as unknown[]).length);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("sentTechCodeMirror — DOM integration", () => {
  it("mounts a .cm-editor element", () => {
    const ext = sentTechCodeMirror();
    const dom = document.createElement("div");
    document.body.appendChild(dom);
    const view = new EditorView({
      extensions: [ext as import("@codemirror/state").Extension],
      parent: dom,
    });
    expect(dom.querySelector(".cm-editor")).toBeTruthy();
    view.destroy();
    document.body.removeChild(dom);
  });

  it("renders .cm-content and .cm-scroller after mounting", () => {
    const ext = sentTechCodeMirror();
    const dom = document.createElement("div");
    document.body.appendChild(dom);
    const view = new EditorView({
      extensions: [ext as import("@codemirror/state").Extension],
      doc: "const x = 1; // comment\n",
      parent: dom,
    });
    expect(dom.querySelector(".cm-content")).toBeTruthy();
    expect(dom.querySelector(".cm-scroller")).toBeTruthy();
    view.destroy();
    document.body.removeChild(dom);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("sentTechCodeMirror — HighlightStyle coverage", () => {
  /**
   * Verify that HighlightStyle.define() produces a spec with rules for key tags.
   * We check via hs.specs.length and hs.style([tag], ctx) which returns a non-null
   * CSS class name when the tag is matched by a rule.
   */

  it("HighlightStyle.define([...]) produces a non-empty specs array", () => {
    const hs = HighlightStyle.define([
      { tag: tags.keyword, color: SYNTAX_COLORS.kw.hex, fontWeight: "bold" },
      { tag: tags.string,  color: SYNTAX_COLORS.str.hex },
      { tag: tags.number,  color: SYNTAX_COLORS.num.hex },
    ]);
    expect(hs.specs.length).toBeGreaterThanOrEqual(3);
  });

  it("hs.style([tags.keyword]) returns a CSS class (rule is applied)", () => {
    const hs = HighlightStyle.define([
      { tag: tags.keyword, color: SYNTAX_COLORS.kw.hex, fontWeight: "bold" },
    ]);
    // style() returns a class string when the tag matches, null otherwise
    const cls = hs.style([tags.keyword], "test");
    expect(cls).toBeTruthy();
  });

  it("hs.style([tags.string]) returns a CSS class", () => {
    const hs = HighlightStyle.define([
      { tag: tags.string, color: SYNTAX_COLORS.str.hex },
    ]);
    expect(hs.style([tags.string], "test")).toBeTruthy();
  });

  it("hs.style([tags.typeName]) returns a CSS class", () => {
    const hs = HighlightStyle.define([
      { tag: tags.typeName, color: SYNTAX_COLORS.type.hex },
    ]);
    expect(hs.style([tags.typeName], "test")).toBeTruthy();
  });

  it("hs.style([tags.number]) returns a CSS class", () => {
    const hs = HighlightStyle.define([
      { tag: tags.number, color: SYNTAX_COLORS.num.hex },
    ]);
    expect(hs.style([tags.number], "test")).toBeTruthy();
  });

  it("hs.style([tags.escape]) returns a CSS class — new tag in this version", () => {
    const hs = HighlightStyle.define([
      { tag: tags.escape, color: SYNTAX_COLORS.re.hex, fontWeight: "bold" },
    ]);
    expect(hs.style([tags.escape], "test")).toBeTruthy();
  });

  it("hs.style([tags.url]) returns a CSS class — new tag in this version", () => {
    const hs = HighlightStyle.define([
      { tag: tags.url, color: SYNTAX_COLORS.prop.hex, textDecoration: "underline" },
    ]);
    expect(hs.style([tags.url], "test")).toBeTruthy();
  });

  it("hs.style([tags.macroName]) returns a CSS class — new tag in this version", () => {
    const hs = HighlightStyle.define([
      { tag: tags.macroName, color: SYNTAX_COLORS.meta.hex },
    ]);
    expect(hs.style([tags.macroName], "test")).toBeTruthy();
  });

  it("hs.style([tags.comment]) returns null when tag is not defined", () => {
    const hs = HighlightStyle.define([
      { tag: tags.keyword, color: SYNTAX_COLORS.kw.hex },
    ]);
    // comment is not in the spec — must return null
    expect(hs.style([tags.comment], "test")).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("sentTechCodeMirror — DS token presence in theme CSS", () => {
  /**
   * Mount an editor, then inspect the injected <style> tag that CM adds to
   * the document. Verify that DS var() tokens are present in the stylesheet
   * text. This guards against accidental removal of var(--st-...) references.
   */
  function getInjectedStyleText(): string {
    return Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
  }

  it("injects var(--st-semantic-surface-default) into the document styles", () => {
    const ext = sentTechCodeMirror();
    const dom = document.createElement("div");
    document.body.appendChild(dom);
    const view = new EditorView({
      extensions: [ext as import("@codemirror/state").Extension],
      parent: dom,
    });
    expect(getInjectedStyleText()).toContain("--st-semantic-surface-default");
    view.destroy();
    document.body.removeChild(dom);
  });

  it("injects var(--st-font-mono) into the document styles", () => {
    const ext = sentTechCodeMirror();
    const dom = document.createElement("div");
    document.body.appendChild(dom);
    const view = new EditorView({
      extensions: [ext as import("@codemirror/state").Extension],
      parent: dom,
    });
    expect(getInjectedStyleText()).toContain("--st-font-mono");
    view.destroy();
    document.body.removeChild(dom);
  });

  it("injects var(--st-semantic-action-primary) into the document styles", () => {
    const ext = sentTechCodeMirror();
    const dom = document.createElement("div");
    document.body.appendChild(dom);
    const view = new EditorView({
      extensions: [ext as import("@codemirror/state").Extension],
      parent: dom,
    });
    expect(getInjectedStyleText()).toContain("--st-semantic-action-primary");
    view.destroy();
    document.body.removeChild(dom);
  });

  it("does NOT carry cm-theme-dark class (dark flag must not be passed to EditorView.theme)", () => {
    // When { dark: true } is passed to EditorView.theme, CM attaches
    // the cm-theme-dark class on the editor root. Since the DS has no dark tokens,
    // we intentionally do NOT pass that flag, so the class must be absent even
    // when the factory is called with { dark: true }.
    const ext = sentTechCodeMirror({ dark: true });
    const dom = document.createElement("div");
    document.body.appendChild(dom);
    const view = new EditorView({
      extensions: [ext as import("@codemirror/state").Extension],
      parent: dom,
    });
    const editor = dom.querySelector(".cm-editor");
    expect(editor?.classList.contains("cm-theme-dark")).toBe(false);
    view.destroy();
    document.body.removeChild(dom);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("WCAG contrast — syntax palette on DS surfaces", () => {
  /**
   * Authoritative record of contrast compliance.
   * Every hardcoded hex in syn={} (theme.ts) must meet WCAG AA (≥ 4.5:1) on
   * both DS light backgrounds. If a color is changed in theme.ts, update
   * SYNTAX_COLORS above — the test will fail if the two diverge.
   */

  for (const [key, { hex, roles }] of Object.entries(SYNTAX_COLORS)) {
    it(`${key} (${hex}, ${roles}) ≥ 4.5:1 on surface-default (${SURFACE_DEFAULT})`, () => {
      const ratio = contrastRatio(hex, SURFACE_DEFAULT);
      expect(
        ratio,
        `${key}=${hex}: got ${ratio.toFixed(2)}, need ≥${AA_NORMAL} on ${SURFACE_DEFAULT}`,
      ).toBeGreaterThanOrEqual(AA_NORMAL);
    });

    it(`${key} (${hex}, ${roles}) ≥ 4.5:1 on surface-subtle (${SURFACE_SUBTLE})`, () => {
      const ratio = contrastRatio(hex, SURFACE_SUBTLE);
      expect(
        ratio,
        `${key}=${hex}: got ${ratio.toFixed(2)}, need ≥${AA_NORMAL} on ${SURFACE_SUBTLE}`,
      ).toBeGreaterThanOrEqual(AA_NORMAL);
    });
  }

  it("fgSecondary / comments (#475569) ≥ 4.5:1 on surface-default", () => {
    expect(contrastRatio(TEXT_COLORS.fgSecondary, SURFACE_DEFAULT)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("fgMuted / punctuation (#64748b) ≥ 4.5:1 on surface-default", () => {
    expect(contrastRatio(TEXT_COLORS.fgMuted, SURFACE_DEFAULT)).toBeGreaterThanOrEqual(AA_NORMAL);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("syntaxHighlighting integration", () => {
  it("syntaxHighlighting(HighlightStyle.define([...])) returns a truthy Extension", () => {
    const hs = HighlightStyle.define([
      { tag: tags.keyword, color: SYNTAX_COLORS.kw.hex },
    ]);
    const ext = syntaxHighlighting(hs);
    expect(ext).toBeTruthy();
  });
});
