import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { legrandTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("legrandTheme", () => {
  it("maps the Legrand brand identity into the Sentropic contract", () => {
    expect(legrandTheme).toMatchObject({
      id: "legrand",
      label: "Legrand",
      mode: "light"
    });

    const css = compileTheme(legrandTheme);
    expect(css).toContain('[data-st-theme="legrand"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Legrand form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = legrandTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f0f1f2"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#d54401"
    });
  });

  it("emits Legrand brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(legrandTheme);
    // Brand orange action + brand ink text.
    expect(css).toContain("--st-semantic-action-primary: #d54401;");
    expect(css).toContain("--st-semantic-text-primary: #1f1f20;");
    // Error brick danger and dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #961e16;");
    expect(css).toContain("--st-semantic-surface-inverse: #1f1f20;");
    // Legrand brand font families: Roboto (body/controls/fields/labels,
    // the legrand.fr body typeface) and Acumin (display/headings).
    expect(css).toContain("Roboto");
    expect(css).toContain("Acumin");
  });
});
