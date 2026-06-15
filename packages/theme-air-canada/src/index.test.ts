import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { airCanadaTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("airCanadaTheme", () => {
  it("maps Air Canada identity into the Sentropic contract", () => {
    expect(airCanadaTheme).toMatchObject({
      id: "air-canada",
      label: "Air Canada",
      mode: "light"
    });

    const css = compileTheme(airCanadaTheme);
    expect(css).toContain('[data-st-theme="air-canada"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Air Canada form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = airCanadaTheme.tokens.component as ThemeComponent;
    // Air Canada controls sit on white surfaces with a faint grey page hover
    // (surface.default #ffffff / surface.subtle #f9f9f9).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f9f9f9"
    });
    // The primary button is the Air Canada UI BLUE CTA (--colour-bg-fill-primary
    // #1460aa, NOT the maple-red brand mark). Corners are square-ish: the derived
    // component button radius follows the measured 4px brand control radius
    // (radius.md 4px).
    expect(component.button).toMatchObject({
      primaryBackground: "#1460aa",
      primaryText: "#ffffff",
      radius: "4px"
    });
    // Air Canada form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Air Canada active tab label is the UI blue.
    expect(component.tabs).toMatchObject({
      activeText: "#1460aa"
    });
  });

  it("emits Air Canada UI blue + black ink and AC Nord faces in the compiled variables", () => {
    const css = compileTheme(airCanadaTheme);
    // THE Air Canada UI blue primary action + the near-black ink.
    expect(css).toContain("--st-semantic-action-primary: #1460aa;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Measured deep-brand-red danger ink and the dark reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #851109;");
    expect(css).toContain("--st-semantic-surface-inverse: #1e1e1e;");
    // Air Canada's proprietary brand faces.
    expect(css).toContain("AC Nord Text");
    expect(css).toContain("AC Nord Display");
  });
});
