import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { michelinTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("michelinTheme", () => {
  it("maps the Michelin brand identity into the Sentropic contract", () => {
    expect(michelinTheme).toMatchObject({
      id: "michelin",
      label: "Michelin",
      mode: "light"
    });

    const css = compileTheme(michelinTheme);
    expect(css).toContain('[data-st-theme="michelin"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Michelin form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = michelinTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f2f2f2"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#27509b"
    });
  });

  it("transcribes brand lengths from the 62.5% root and uses the site-wide focus", () => {
    const foundation = michelinTheme.tokens.foundation as {
      radius: Record<string, string>;
      focus: Record<string, string>;
      shadow: Record<string, string>;
      density: Record<string, Record<string, string>>;
      typography: Record<string, Record<string, string>>;
      buttonSecondary: Record<string, string>;
    };
    const semantic = michelinTheme.tokens.semantic as {
      action: Record<string, string>;
    };
    // .8rem/.4rem at the brand 10px root = 8px/4px.
    expect(foundation.radius).toMatchObject({
      sm: "0.25rem",
      md: "0.5rem",
      lg: "0.5rem"
    });
    // Site-wide focus is the solid blue outline, not the breadcrumb grey.
    expect(foundation.focus).toMatchObject({
      strategy: "outline",
      color: "#27509b",
      offset: "0.25rem"
    });
    // Button geometry: the brand publishes exactly two heights, min-height
    // 4.8rem (base) and 3.6rem ([data-ui-size=sm]) at the 10px root. `lg` has
    // no published step and is derived by continuing the brand's own 12px
    // increment (48px + 12px = 60px), so the three steps stay DISTINCT.
    expect(foundation.density.sm.controlHeight).toBe("2.25rem");
    expect(foundation.density.md.controlHeight).toBe("3rem");
    expect(foundation.density.lg.controlHeight).toBe("3.75rem");
    expect(
      new Set([
        foundation.density.sm.controlHeight,
        foundation.density.md.controlHeight,
        foundation.density.lg.controlHeight
      ]).size
    ).toBe(3);
    // .ds__btn line-height:1.25; .ds__label span font-size:1.4rem at 10px root.
    expect(foundation.typography.control.lineHeight).toBe("1.25");
    expect(foundation.typography.label.size).toBe("0.875rem");
    // Elevation: two published steps inked rgb(51,51,51) (:root --color-dark-70),
    // `0 .4rem .8rem 0 rgba(51,51,51,.12)` and `0 .8rem 1.6rem 0
    // rgba(51,51,51,.16)` at the 10px root; only the lightest step is derived.
    // The #1a1a1a overlay ink must never come back here.
    expect(foundation.shadow).toMatchObject({
      subtle: "0 1px 2px rgb(51 51 51 / 0.10)",
      medium: "0 4px 8px rgb(51 51 51 / 0.12)",
      floating: "0 8px 16px rgb(51 51 51 / 0.16)"
    });
    // The secondary button's label and its hover fill are ONE pair: Sentropic
    // gives the label a single colour for both states, so the measured rest
    // label (#27509b, `--button-color-text:var(--color-primary)`, matched by the
    // `currentcolor` stroke) must stay legible on the hover fill too —
    // 7.76:1 on white at rest, 6.14:1 on #d4e7fa on hover. Putting the brand's
    // published solid #27509b fill back here without a per-state label colour
    // would render 1.00:1; the white hover label alone would render 1.00:1 at
    // rest, and the previous navy #00205b label rendered 1.99:1 on that fill.
    expect(semantic.action.secondaryText).toBe("#27509b");
    expect(foundation.buttonSecondary.border).toBe("#27509b");
    expect(foundation.buttonSecondary.background).toBe("transparent");
    expect(foundation.buttonSecondary.hoverBackground).toBe("#d4e7fa");
  });

  it("emits Michelin brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(michelinTheme);
    // Michelin blue action + ink text.
    expect(css).toContain("--st-semantic-action-primary: #27509b;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    // Error red danger and deep navy inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #b71c1c;");
    expect(css).toContain("--st-semantic-surface-inverse: #00205b;");
    // End-to-end lock on the secondary-button label: the semantic role and the
    // component leaf the frameworks actually read must both be the brand blue.
    expect(css).toContain("--st-semantic-action-secondaryText: #27509b;");
    expect(css).toContain("--st-component-button-secondaryText: #27509b;");
    // Michelin brand font families (body + display).
    expect(css).toContain("Noto Sans");
    expect(css).toContain("Michelin Unit Titling");
  });
});
