import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  compileTheme,
  sentTechTheme,
  ANATOMY_VERSION,
  type TenantTheme
} from "@sentropic/design-system-themes";
import { dsfrTheme } from "@sentropic/design-system-theme-dsfr";
import { carbonTheme } from "@sentropic/design-system-theme-carbon";

/**
 * Anti-var-fantôme guard (spec §5 / revue B-2): every `var(--st-*)` that the 5
 * pilot components consume as its PRIMARY lookup must resolve to a real entry in
 * each theme's compiled token tree. Fallbacks (the 2nd arg of `var()`) are
 * allowed safety nets, but the primary token must exist — a fallback that
 * "works" silently masks a missing theme value, which is exactly the drift the
 * spec forbids. This is the most cost-effective anti-drift guard.
 */

const here = dirname(fileURLToPath(import.meta.url));
const LIB = join(here, "lib");

const PILOT_COMPONENTS = ["Button", "Input", "Link", "Card", "Tabs"] as const;
const PHASE2_COMPONENTS = [
  "Accordion",
  "Combobox",
  "ContentSwitcher",
  "LanguageSelector",
  "Header",
  "IconButton",
  "Menu",
  "Search",
  "OverflowMenu",
  "CopyButton",
  "Dropdown",
  "DataTable",
  "DatePicker",
  "FileUploader",
  "MultiSelect",
  "NumberInput",
  "PasswordInput",
  "Toggletip",
  "TreeView"
] as const;

// The set of vars a theme actually emits is derived from the compiled CSS
// itself (which includes the short foundation aliases the compiler adds, see
// packages/tokens/src/css.ts) — so the test cannot drift from the compiler.
function existingVars(theme: TenantTheme): Set<string> {
  const css = compileTheme(theme, { selector: ":root" });
  const names = new Set<string>();
  for (const match of css.matchAll(/(--st-[a-zA-Z0-9-]+)\s*:/g)) {
    names.add(match[1]);
  }
  return names;
}

/** Extract the PRIMARY var (first identifier inside each `var(...)`). */
function consumedPrimaryVars(source: string): string[] {
  const out = new Set<string>();
  for (const match of source.matchAll(/var\(\s*(--st-[a-zA-Z0-9-]+)/g)) {
    out.add(match[1]);
  }
  return [...out].sort();
}

const THEMES: TenantTheme[] = [sentTechTheme, dsfrTheme, carbonTheme];

describe("anatomy tokens — no phantom vars in the 5 pilot components", () => {
  const componentVars = new Map<string, string[]>();
  for (const name of PILOT_COMPONENTS) {
    const source = readFileSync(join(LIB, `${name}.svelte`), "utf8");
    componentVars.set(name, consumedPrimaryVars(source));
  }

  for (const theme of THEMES) {
    const existing = existingVars(theme);
    for (const name of PILOT_COMPONENTS) {
      it(`${name}: every consumed --st-* exists in the "${theme.id}" token tree`, () => {
        const missing = componentVars
          .get(name)!
          .filter((v) => !existing.has(v));
        expect(missing, `phantom vars in ${name} for theme ${theme.id}`).toEqual([]);
      });
    }
  }

  it("focus strategy resolves to distinct techniques per theme (outline vs inset)", () => {
    const dsfr = compileTheme(dsfrTheme);
    const carbon = compileTheme(carbonTheme);
    // DSFR = native offset outline; box-shadow channel is a no-op.
    expect(dsfr).toContain("--st-component-button-anatomy-focus-outline: 2px solid");
    expect(dsfr).toContain("--st-component-button-anatomy-focus-boxShadow: none");
    // Carbon = inset box-shadow; outline channel is a no-op.
    expect(carbon).toContain("--st-component-button-anatomy-focus-boxShadow: inset 0 0 0 2px");
    expect(carbon).toContain("--st-component-button-anatomy-focus-outline: none");
  });
});

/**
 * Anatomy v1.1.0 additive vars (cf. spec extensions 1–3): the hover bg, the
 * link hover decoration and the per-size button font sizes must be EMITTED for
 * every theme (no phantom var, no silent fallback) and carry each theme's own
 * value. This is what retires the D1/C1 (hover bg) and D3/C3 (per-size font)
 * escapes and the tokenisable part of C2 (Carbon none → underline on hover).
 */
describe("anatomy v1.1.0 — hover bg, hover decoration, per-size font size", () => {
  const compiled = new Map<string, string>(
    THEMES.map((t) => [t.id, compileTheme(t)])
  );

  it("ANATOMY_VERSION is 1.5.0", () => {
    expect(ANATOMY_VERSION).toBe("1.5.0");
  });

  for (const theme of THEMES) {
    const css = () => compiled.get(theme.id)!;

    it(`${theme.id}: button hover bg is emitted (states.hover.bg)`, () => {
      expect(css()).toMatch(/--st-component-button-anatomy-states-hover-bg:\s*[^;]+;/);
    });

    it(`${theme.id}: link hover decoration is emitted (states.hover.decoration)`, () => {
      expect(css()).toMatch(/--st-component-link-anatomy-states-hover-decoration:\s*[^;]+;/);
    });

    it(`${theme.id}: card hover background is emitted (states.hover.bg)`, () => {
      expect(css()).toMatch(/--st-component-card-anatomy-states-hover-bg:\s*[^;]+;/);
    });

    it(`${theme.id}: button font size is emitted for every size`, () => {
      for (const size of ["sm", "md", "lg"] as const) {
        expect(css()).toMatch(
          new RegExp(`--st-component-button-anatomy-density-${size}-fontSize:\\s*[^;]+;`)
        );
      }
    });
  }

  it("hover bg carries each theme's dedicated hover colour", () => {
    // DSFR Bleu France hover #1212ff, Carbon $button-primary-hover Blue 70 #0043ce.
    expect(compiled.get("dsfr")!).toContain("--st-component-button-anatomy-states-hover-bg: #1212ff");
    expect(compiled.get("carbon")!).toContain("--st-component-button-anatomy-states-hover-bg: #0043ce");
  });

    it("link hover decoration differs by theme intent (Carbon none → underline on hover)", () => {
      // Carbon: rest decoration none, hover decoration underline (the toggle).
      expect(compiled.get("carbon")!).toContain("--st-component-link-anatomy-typography-textDecoration: none");
      expect(compiled.get("carbon")!).toContain("--st-component-link-anatomy-states-hover-decoration: underline");
      // DSFR: underlined at rest, underline on hover (no-op toggle, animated thickness stays an escape).
      expect(compiled.get("dsfr")!).toContain("--st-component-link-anatomy-typography-textDecoration: underline");
      expect(compiled.get("dsfr")!).toContain("--st-component-link-anatomy-states-hover-decoration: underline");
    });

    it("card hover background carries each theme's card surface intent", () => {
      expect(compiled.get("sent-tech")!).toContain("--st-component-card-anatomy-states-hover-bg: #ffffff");
      expect(compiled.get("dsfr")!).toContain("--st-component-card-anatomy-states-hover-bg: #ffffff");
      expect(compiled.get("carbon")!).toContain("--st-component-card-anatomy-states-hover-bg: #e0e0e0");
    });
  });

/**
 * Anatomy v1.2.0 field style (cf. spec extension): the input/control anatomy now
 * carries a `field` block — `style`, `fillBg` and the four per-side border
 * shorthands — so a filled-underline field (DSFR/Carbon) is faithful instead of
 * a boxed encadré. Every var must be EMITTED for every theme (no phantom var)
 * and carry each theme's own style: Sent Tech = outline (4 equal borders);
 * DSFR / Carbon = filled-underline (filled bg + bottom rule only).
 */
describe("anatomy v1.2.0 — field style (outline vs filled-underline)", () => {
  const compiled = new Map<string, string>(
    THEMES.map((t) => [t.id, compileTheme(t)])
  );

  const FIELD = "--st-component-control-anatomy-field";

  for (const theme of THEMES) {
    const css = () => compiled.get(theme.id)!;

    it(`${theme.id}: every field var (style/fillBg/border per side + radiusTop/underline/focusShadow + select leaves) is emitted`, () => {
      for (const leaf of [
        "style", "fillBg", "borderTop", "borderRight", "borderBottom", "borderLeft",
        "radiusTop", "underline", "focusShadow",
        // v1.4.0 (F5/F9): native <select> rendering leaves.
        "selectAppearance", "selectChevron", "selectPaddingRight"
      ]) {
        expect(css(), `${FIELD}-${leaf} missing for ${theme.id}`).toMatch(
          new RegExp(`${FIELD}-${leaf}:\\s*[^;]+;`)
        );
      }
    });
  }

  it("Sent Tech base = outline: filled with surface.default + 4 equal borders (no regression)", () => {
    const css = compiled.get("sent-tech")!;
    expect(css).toContain(`${FIELD}-style: outline`);
    expect(css).toContain(`${FIELD}-fillBg: var(--st-semantic-surface-default)`);
    // All four sides carry the same subtle border (boxed look unchanged).
    expect(css).toMatch(new RegExp(`${FIELD}-borderTop: 1px solid #e2e8f0`));
    expect(css).toMatch(new RegExp(`${FIELD}-borderBottom: 1px solid #e2e8f0`));
    expect(css).toMatch(new RegExp(`${FIELD}-borderRight: 1px solid #e2e8f0`));
    expect(css).toMatch(new RegExp(`${FIELD}-borderLeft: 1px solid #e2e8f0`));
    // v1.3.0: an outline field has NO underline shadow and its top corners
    // inherit the theme's shape radius (uniform box) → no Sent Tech regression.
    expect(css).toContain(`${FIELD}-underline: none`);
    expect(css).toContain(`${FIELD}-radiusTop: 0.375rem`);
  });

  it("DSFR = filled-underline: #eeeeee fill, bottom rule via inset box-shadow #3a3a3a, no border on any side, 4px top corners", () => {
    const css = compiled.get("dsfr")!;
    expect(css).toContain(`${FIELD}-style: filled-underline`);
    expect(css).toContain(`${FIELD}-fillBg: #eeeeee`);
    // F4: NO geometric border on any side — the bottom rule is a box-shadow.
    expect(css).toContain(`${FIELD}-borderTop: none`);
    expect(css).toContain(`${FIELD}-borderRight: none`);
    expect(css).toContain(`${FIELD}-borderLeft: none`);
    expect(css).toContain(`${FIELD}-borderBottom: none`);
    expect(css).toContain(`${FIELD}-underline: inset 0 -1px 0 0 #3a3a3a`);
    // F3: DSFR rounds only the top corners (4px), bottom stays square.
    expect(css).toContain(`${FIELD}-radiusTop: 4px`);
  });

  it("Carbon = filled-underline with a REAL border-bottom (#8d8d8d) — its real technique, no box-shadow underline", () => {
    const css = compiled.get("carbon")!;
    expect(css).toContain(`${FIELD}-style: filled-underline`);
    expect(css).toContain(`${FIELD}-fillBg: #f4f4f4`);
    expect(css).toContain(`${FIELD}-borderTop: none`);
    expect(css).toContain(`${FIELD}-borderRight: none`);
    expect(css).toContain(`${FIELD}-borderLeft: none`);
    // Carbon genuinely uses a geometric border-bottom (matches .bx--text-input),
    // so we keep it and DO NOT draw a box-shadow underline.
    expect(css).toContain(`${FIELD}-borderBottom: 1px solid #8d8d8d`);
    expect(css).toContain(`${FIELD}-underline: none`);
    // Carbon fields are square top and bottom (radiusTop inherits shape radius 0).
    expect(css).toContain(`${FIELD}-radiusTop: 0`);
  });

  it("only the DSFR field opts into the box-shadow underline (F4); Carbon stays on its real border-bottom", () => {
    // DSFR: bottom rule is the inset box-shadow, border-bottom dropped to none.
    expect(compiled.get("dsfr")!).toContain(`${FIELD}-borderBottom: none`);
    expect(compiled.get("dsfr")!).toContain(`${FIELD}-underline: inset 0 -1px 0 0 #3a3a3a`);
    // DSFR uses the native outline focus strategy (focus box-shadow channel =
    // none), so the field focus box-shadow stays the underline — never dropped.
    expect(compiled.get("dsfr")!).toContain(`${FIELD}-focusShadow: inset 0 -1px 0 0 #3a3a3a`);
    // Carbon has no box-shadow underline; its focus box-shadow is the plain
    // inset ring (border-bottom carries the rule).
    expect(compiled.get("carbon")!).toContain(`${FIELD}-focusShadow: inset 0 0 0 2px #0f62fe`);
  });
});

/**
 * Phase 2 rollout guard: form-like and menu-like controls outside the original
 * 5 pilots consume `--st-component-control-hoverBackground` for secondary icon
 * buttons, clear buttons and row controls. The token must be emitted by every
 * compiled theme instead of relying on component-level fallbacks.
 */
describe("anatomy phase 2 — shared control hover background", () => {
  const compiled = new Map<string, string>(
    THEMES.map((t) => [t.id, compileTheme(t)])
  );

  for (const theme of THEMES) {
    it(`${theme.id}: emits shared control hover background`, () => {
      expect(compiled.get(theme.id)!).toMatch(
        /--st-component-control-hoverBackground:\s*[^;]+;/
      );
    });
  }
});

describe("anatomy phase 2 — interaction surfaces consume shared hover background", () => {
  for (const name of PHASE2_COMPONENTS) {
    it(`${name}: consumes --st-component-control-hoverBackground`, () => {
      const source = readFileSync(join(LIB, `${name}.svelte`), "utf8");
      const token = /var\(\s*--st-component-control-hoverBackground/;
      expect(
        token.test(source),
        `${name} should reference --st-component-control-hoverBackground`
      ).toBe(true);
    });
  }
});

describe("anatomy phase 2 — PaginationNav aliases", () => {
  const compiled = new Map<string, string>(
    THEMES.map((t) => [t.id, compileTheme(t)])
  );

  for (const theme of THEMES) {
    const css = () => compiled.get(theme.id)!;

    it(`${theme.id}: emits every PaginationNav primary token`, () => {
      for (const leaf of [
        "background",
        "border",
        "radius",
        "text",
        "hoverBackground",
        "activeBackground",
        "activeText",
        "disabledText",
        "ellipsisText"
      ]) {
        expect(css(), `paginationNav.${leaf} missing for ${theme.id}`).toMatch(
          new RegExp(`--st-component-paginationNav-${leaf}:\\s*[^;]+;`)
        );
      }
    });
  }
});

/**
 * Anatomy v1.5.0 active-tab metrics (F7/F8): the `tabs` block now carries the
 * per-theme selected-tab roles/metrics the Tabs component consumes (active
 * text/bg/weight, tab padding/font-size/line-height, the per-side indicator
 * widths and the box-shadow accent). Every var must be EMITTED for every theme
 * (no phantom var) and DEFAULT to the prior base render (base Sent Tech
 * unchanged) while DSFR/Carbon carry the measured selected-tab values.
 */
describe("anatomy v1.5.0 — active-tab metrics (F7 DSFR / F8 Carbon)", () => {
  const compiled = new Map<string, string>(
    THEMES.map((t) => [t.id, compileTheme(t)])
  );
  const TABS = "--st-component-tabs";

  for (const theme of THEMES) {
    const css = () => compiled.get(theme.id)!;
    it(`${theme.id}: every active-tab var is emitted (no phantom var)`, () => {
      for (const leaf of [
        "activeText", "activeBackground", "activeWeight",
        "tabPaddingBlock", "tabPaddingInline", "tabFontSize", "tabLineHeight",
        "activeBorderTopWidth", "activeBorderBottomWidth", "activeShadow"
      ]) {
        expect(css(), `${TABS}-${leaf} missing for ${theme.id}`).toMatch(
          new RegExp(`${TABS}-${leaf}:\\s*[^;]+;`)
        );
      }
    });
  }

  it("base Sent Tech reproduces the prior tab render (unchanged): 12px/4px padding, inherited font, 600, transparent, bottom indicator, no shadow", () => {
    const css = compiled.get("sent-tech")!;
    expect(css).toContain(`${TABS}-tabPaddingBlock: 0.75rem`);
    expect(css).toContain(`${TABS}-tabPaddingInline: 0.25rem`);
    expect(css).toContain(`${TABS}-tabFontSize: inherit`);
    expect(css).toContain(`${TABS}-activeWeight: 600`);
    expect(css).toContain(`${TABS}-activeBackground: transparent`);
    expect(css).toContain(`${TABS}-activeBorderTopWidth: 0`);
    expect(css).toContain(`${TABS}-activeBorderBottomWidth: 1px`);
    expect(css).toContain(`${TABS}-activeShadow: none`);
  });

  it("DSFR active tab (F7): white fill, Bleu France text, weight 700, 8px/16px padding, TOP accent via inset box-shadow (no border)", () => {
    const css = compiled.get("dsfr")!;
    expect(css).toContain(`${TABS}-activeText: #000091`);
    expect(css).toContain(`${TABS}-activeBackground: #ffffff`);
    expect(css).toContain(`${TABS}-activeWeight: 700`);
    expect(css).toContain(`${TABS}-tabPaddingBlock: 0.5rem`);
    expect(css).toContain(`${TABS}-tabPaddingInline: 1rem`);
    expect(css).toContain(`${TABS}-tabFontSize: 1rem`);
    expect(css).toContain(`${TABS}-tabLineHeight: 1.5rem`);
    // shadow mode: both borders stay 0, accent is an inset top box-shadow.
    expect(css).toContain(`${TABS}-activeBorderTopWidth: 0`);
    expect(css).toContain(`${TABS}-activeBorderBottomWidth: 0`);
    expect(css).toContain(`${TABS}-activeShadow: inset 0 1px 0 0 #000091`);
  });

  it("Carbon active tab (F8): 14px / 16px line-height, 0 inline padding, weight 400, real selected colour #161616, blue bottom border indicator", () => {
    const css = compiled.get("carbon")!;
    expect(css).toContain(`${TABS}-tabFontSize: 0.875rem`);
    expect(css).toContain(`${TABS}-tabLineHeight: 1rem`);
    expect(css).toContain(`${TABS}-tabPaddingInline: 0`);
    expect(css).toContain(`${TABS}-activeWeight: 400`);
    // Real selected-tab design colour (NOT the mobile-base #525252 the bench
    // measures below Carbon's 42rem breakpoint — that gap is a justified escape).
    expect(css).toContain(`${TABS}-activeText: #161616`);
    // Bottom indicator is a real border (the blue #0f62fe selected design),
    // no box-shadow accent.
    expect(css).toContain(`${TABS}-activeBorderBottomWidth: 1px`);
    expect(css).toContain(`${TABS}-activeShadow: none`);
  });
});
