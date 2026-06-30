import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { stabilityTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("stabilityTheme", () => {
  it("maps Stability AI identity into the Sentropic contract", () => {
    expect(stabilityTheme).toMatchObject({
      id: "stability",
      label: "Stability AI",
      mode: "dark"
    });

    const css = compileTheme(stabilityTheme);
    expect(css).toContain('[data-st-theme="stability"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Stability form fields are boxed & lightly rounded (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = stabilityTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#1f1f1f",
      hoverBackground: "#272727"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#272727"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#a381ff"
    });
  });

  it("emits Stability brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(stabilityTheme);
    // Bright brand violet action + off-white text on the dark stage.
    expect(css).toContain("--st-semantic-action-primary: #a381ff;");
    expect(css).toContain("--st-semantic-text-primary: #e5e7e6;");
    // Derived danger red and the off-white inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #f0616d;");
    expect(css).toContain("--st-semantic-surface-inverse: #e5e7e6;");
    // Stability font families (Archivo body/heading, Figtree buttons).
    expect(css).toContain("Archivo");
    expect(css).toContain("Figtree");
  });
});
