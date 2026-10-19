import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { influnifiedTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("influnifiedTheme", () => {
  it("maps Influnified identity into the Sentropic contract", () => {
    expect(influnifiedTheme).toMatchObject({
      id: "influnified",
      label: "Influnified",
      mode: "light"
    });

    const css = compileTheme(influnifiedTheme);
    expect(css).toContain('[data-st-theme="influnified"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Influnified form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = influnifiedTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#fffaf5",
      hoverBackground: "#fdf6f6"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#070541"
    });
  });

  it("emits Influnified brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(influnifiedTheme);
    // Brand pink action + ink text.
    expect(css).toContain("--st-semantic-action-primary: #e4575e;");
    expect(css).toContain("--st-semantic-text-primary: #070541;");
    // Measured error literal and ink inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #c0392b;");
    expect(css).toContain("--st-semantic-surface-inverse: #070541;");
    // Influnified font families (Montserrat headings, Poppins body).
    expect(css).toContain("Poppins");
    expect(css).toContain("Montserrat");
  });
});
