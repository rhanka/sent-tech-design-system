import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { latexTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("latexTheme", () => {
  it("maps the LaTeX typographic identity into the Sentropic contract", () => {
    expect(latexTheme).toMatchObject({
      id: "latex",
      label: "LaTeX",
      mode: "light"
    });

    const css = compileTheme(latexTheme);
    expect(css).toContain('[data-st-theme="latex"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // LaTeX boxes are full frames (\fbox: four equal rules), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = latexTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f5f5f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#000000"
    });
  });

  it("emits LaTeX ink, readable link red and fonts in the compiled variables", () => {
    const css = compileTheme(latexTheme);
    // Readable hyperref red action + ink text.
    expect(css).toContain("--st-semantic-action-primary: #e60000;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Base-derived danger red and ink inverse plate.
    expect(css).toContain("--st-semantic-action-danger: #dc2626;");
    expect(css).toContain("--st-semantic-surface-inverse: #000000;");
    // Latin Modern families (Roman serif body/titles, Sans controls, Mono code).
    expect(css).toContain("Latin Modern Roman");
    expect(css).toContain("Latin Modern Sans");
    expect(css).toContain("Latin Modern Mono");
  });
});
