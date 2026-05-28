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

  it("ANATOMY_VERSION is 1.2.0", () => {
    expect(ANATOMY_VERSION).toBe("1.2.0");
  });

  for (const theme of THEMES) {
    const css = () => compiled.get(theme.id)!;

    it(`${theme.id}: button hover bg is emitted (states.hover.bg)`, () => {
      expect(css()).toMatch(/--st-component-button-anatomy-states-hover-bg:\s*[^;]+;/);
    });

    it(`${theme.id}: link hover decoration is emitted (states.hover.decoration)`, () => {
      expect(css()).toMatch(/--st-component-link-anatomy-states-hover-decoration:\s*[^;]+;/);
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

    it(`${theme.id}: every field var (style/fillBg/border per side) is emitted`, () => {
      for (const leaf of ["style", "fillBg", "borderTop", "borderRight", "borderBottom", "borderLeft"]) {
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
  });

  it("DSFR = filled-underline: #eeeeee fill, bottom rule only #3a3a3a, no top/right/left", () => {
    const css = compiled.get("dsfr")!;
    expect(css).toContain(`${FIELD}-style: filled-underline`);
    expect(css).toContain(`${FIELD}-fillBg: #eeeeee`);
    expect(css).toContain(`${FIELD}-borderTop: none`);
    expect(css).toContain(`${FIELD}-borderRight: none`);
    expect(css).toContain(`${FIELD}-borderLeft: none`);
    expect(css).toContain(`${FIELD}-borderBottom: 1px solid #3a3a3a`);
  });

  it("Carbon = filled-underline: #f4f4f4 fill, bottom rule only #8d8d8d, no top/right/left", () => {
    const css = compiled.get("carbon")!;
    expect(css).toContain(`${FIELD}-style: filled-underline`);
    expect(css).toContain(`${FIELD}-fillBg: #f4f4f4`);
    expect(css).toContain(`${FIELD}-borderTop: none`);
    expect(css).toContain(`${FIELD}-borderRight: none`);
    expect(css).toContain(`${FIELD}-borderLeft: none`);
    expect(css).toContain(`${FIELD}-borderBottom: 1px solid #8d8d8d`);
  });
});
