import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { brpTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("brpTheme", () => {
  it("maps BRP identity into the Sentropic contract", () => {
    expect(brpTheme).toMatchObject({
      id: "brp",
      label: "BRP",
      mode: "light"
    });

    const css = compileTheme(brpTheme);
    expect(css).toContain('[data-st-theme="brp"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // BRP form fields are filled-underline (grey fill + a single bottom rule),
    // not boxed outlines.
    expect(css).toContain("--st-field-style: filled-underline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = brpTheme.tokens.component as ThemeComponent;
    // BRP controls sit on white chrome with a faint grey page hover
    // (surface.default #ffffff / surface.subtle #f0f0f0).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f0f0f0"
    });
    // The primary button IS the iconic BRP brand yellow CTA with black text. The
    // brand primary `.btn` is SQUARE (measured border-radius:0), but the derived
    // component button radius follows the measured control radius (radius.md 4px —
    // the top of the radius histogram / secondary .btn radius).
    expect(component.button).toMatchObject({
      primaryBackground: "#ffd200",
      primaryText: "#000000",
      radius: "4px"
    });
    // BRP form fields are filled-underline with a faint grey fill.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "filled-underline",
      fillBg: "#f9f9f9"
    });
    // BRP active tab label is the brand black ink.
    expect(component.tabs).toMatchObject({
      activeText: "#000000"
    });
  });

  it("emits BRP yellow + black ink and Trade Gothic in the compiled variables", () => {
    const css = compileTheme(brpTheme);
    // THE BRP brand yellow action + the pure-black ink.
    expect(css).toContain("--st-semantic-action-primary: #ffd200;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Measured brand error red and the charcoal reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #d32f2f;");
    expect(css).toContain("--st-semantic-surface-inverse: #2f2f2f;");
    // BRP's measured brand face served via Typekit: the Trade Gothic family.
    expect(css).toContain("Trade Gothic");
  });
});
