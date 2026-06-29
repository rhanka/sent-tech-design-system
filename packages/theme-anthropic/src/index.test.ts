import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { anthropicTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("anthropicTheme", () => {
  it("maps Anthropic identity into the Sentropic contract", () => {
    expect(anthropicTheme).toMatchObject({
      id: "anthropic",
      label: "Anthropic",
      mode: "light"
    });

    const css = compileTheme(anthropicTheme);
    expect(css).toContain('[data-st-theme="anthropic"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Anthropic / claude.ai form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = anthropicTheme.tokens.component as ThemeComponent;
    // Controls sit on the warm ivory canvas; subtle hover is the cream tone.
    expect(component.control).toMatchObject({
      background: "#faf9f5",
      hoverBackground: "#f0eee6"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Active tab label = the clay accent.
    expect(component.tabs).toMatchObject({
      activeText: "#d97757"
    });
  });

  it("emits Anthropic brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(anthropicTheme);
    // Clay primary action + dark ink text.
    expect(css).toContain("--st-semantic-action-primary: #d97757;");
    expect(css).toContain("--st-semantic-text-primary: #141413;");
    // Warm brick-red danger and dark ink inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #b23c2c;");
    expect(css).toContain("--st-semantic-surface-inverse: #141413;");
    // Anthropic font families (Styrene sans UI, Copernicus serif display).
    expect(css).toContain("Styrene");
    expect(css).toContain("Copernicus");
  });
});
