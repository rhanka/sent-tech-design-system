import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { rexelTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("rexelTheme", () => {
  it("maps the Rexel brand identity into the Sentropic contract", () => {
    expect(rexelTheme).toMatchObject({
      id: "rexel",
      label: "Rexel",
      mode: "light"
    });

    const css = compileTheme(rexelTheme);
    expect(css).toContain('[data-st-theme="rexel"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Rexel form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = rexelTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f3f3fa"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#2e4eaa"
    });
  });

  it("emits Rexel brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(rexelTheme);
    // France-theme primary blue + body near-black.
    expect(css).toContain("--st-semantic-action-primary: #2e4eaa;");
    expect(css).toContain("--st-semantic-text-primary: #303545;");
    // Error red danger and near-black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #C8102E;");
    expect(css).toContain("--st-semantic-surface-inverse: #303545;");
    // Rexel brand font families (Open Sans base, Montserrat display).
    expect(css).toContain("Open Sans");
    expect(css).toContain("Montserrat");
  });
});
