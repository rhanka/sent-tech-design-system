import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { hermesTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("hermesTheme", () => {
  it("maps Hermès identity into the Sentropic contract", () => {
    expect(hermesTheme).toMatchObject({
      id: "hermes",
      label: "Hermès",
      mode: "light"
    });

    const css = compileTheme(hermesTheme);
    expect(css).toContain('[data-st-theme="hermes"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Hermès form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = hermesTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#fffcf7",
      hoverBackground: "#f6f1eb"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#000000"
    });
  });

  it("emits Hermès brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(hermesTheme);
    // Hermès orange action + black ink text.
    expect(css).toContain("--st-semantic-action-primary: #f37021;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Derived brick danger + black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #9d2a1e;");
    expect(css).toContain("--st-semantic-surface-inverse: #000000;");
    // Hermès webfont families (Manrope UI, EB Garamond display, Overpass Mono).
    expect(css).toContain("Manrope");
    expect(css).toContain("EB Garamond");
    expect(css).toContain("Overpass Mono");
  });
});
