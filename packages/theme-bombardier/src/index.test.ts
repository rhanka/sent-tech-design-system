import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { bombardierTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("bombardierTheme", () => {
  it("maps Bombardier identity into the Sentropic contract", () => {
    expect(bombardierTheme).toMatchObject({
      id: "bombardier",
      label: "Bombardier",
      mode: "light"
    });

    const css = compileTheme(bombardierTheme);
    expect(css).toContain('[data-st-theme="bombardier"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Bombardier form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = bombardierTheme.tokens.component as ThemeComponent;
    // Bombardier controls sit on white surfaces with a faint cream page hover
    // (surface.default #ffffff / surface.subtle #fdfbf3).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#fdfbf3"
    });
    // The primary button IS the iconic Bombardier petrol-teal CTA. The brand CTA is
    // a fully-rounded pill (radius.pill 999px, encoded for the pill button family /
    // tags / badges); the derived component button radius follows the measured
    // control radius (radius.md 4px — the small soft step; fields themselves are 0).
    expect(component.button).toMatchObject({
      primaryBackground: "#003e51",
      primaryText: "#ffffff",
      radius: "4px"
    });
    // Bombardier form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Bombardier active tab label is the brand teal.
    expect(component.tabs).toMatchObject({
      activeText: "#003e51"
    });
  });

  it("emits Bombardier teal + near-black ink and Inter/Trust in the compiled variables", () => {
    const css = compileTheme(bombardierTheme);
    // THE Bombardier petrol-teal action + the near-black ink.
    expect(css).toContain("--st-semantic-action-primary: #003e51;");
    expect(css).toContain("--st-semantic-text-primary: #202020;");
    // Measured brand error red and the near-black reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #e70d06;");
    expect(css).toContain("--st-semantic-surface-inverse: #202020;");
    // Bombardier's measured brand faces: Inter (body/UI) + Trust (serif display).
    expect(css).toContain("Inter");
    expect(css).toContain("Trust");
  });
});
