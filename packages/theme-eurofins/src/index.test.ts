import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { eurofinsTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("eurofinsTheme", () => {
  it("maps the Eurofins Scientific brand identity into the Sentropic contract", () => {
    expect(eurofinsTheme).toMatchObject({
      id: "eurofins",
      label: "Eurofins Scientific",
      mode: "light"
    });

    const css = compileTheme(eurofinsTheme);
    expect(css).toContain('[data-st-theme="eurofins"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Eurofins form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = eurofinsTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#FAFAFA"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#003883"
    });
  });

  it("emits Eurofins Scientific brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(eurofinsTheme);
    // Corporate blue action + heading near-black text.
    expect(css).toContain("--st-semantic-action-primary: #003883;");
    expect(css).toContain("--st-semantic-text-primary: #212b36;");
    // Crimson danger and navy inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #b71c1c;");
    expect(css).toContain("--st-semantic-surface-inverse: #00224F;");
    // Eurofins brand font families (Inter body, Fira Sans display).
    expect(css).toContain("Inter");
    expect(css).toContain("Fira Sans");
    expect(css).toContain("SFMono-Regular");
    expect(css).toContain("Menlo");
    expect(css).toContain("Consolas");
  });
});
