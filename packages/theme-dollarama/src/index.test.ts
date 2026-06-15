import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { dollaramaTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("dollaramaTheme", () => {
  it("maps Dollarama identity into the Sentropic contract", () => {
    expect(dollaramaTheme).toMatchObject({
      id: "dollarama",
      label: "Dollarama",
      mode: "light"
    });

    const css = compileTheme(dollaramaTheme);
    expect(css).toContain('[data-st-theme="dollarama"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Dollarama form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = dollaramaTheme.tokens.component as ThemeComponent;
    // Dollarama controls sit on white surfaces with a faint pale-green page hover
    // (surface.default #ffffff / surface.subtle #E8F5E9).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#E8F5E9"
    });
    // The primary button IS the iconic Dollarama green CTA. The derived component
    // button radius follows the measured control radius (radius.md 4px).
    expect(component.button).toMatchObject({
      primaryBackground: "#006C46",
      primaryText: "#ffffff",
      radius: "4px"
    });
    // Dollarama form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Dollarama active tab label is the brand green.
    expect(component.tabs).toMatchObject({
      activeText: "#006C46"
    });
  });

  it("emits Dollarama green + near-black ink and the retail sans in the compiled variables", () => {
    const css = compileTheme(dollaramaTheme);
    // THE Dollarama green action + the near-black ink.
    expect(css).toContain("--st-semantic-action-primary: #006C46;");
    expect(css).toContain("--st-semantic-text-primary: #2F2F2F;");
    // Danger (à confirmer red) and the brand-green reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #d32f2f;");
    expect(css).toContain("--st-semantic-surface-inverse: #006C46;");
    // Dollarama's clean retail sans (name only, à confirmer).
    expect(css).toContain("Open Sans");
  });
});
