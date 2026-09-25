import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { dassaultAviationTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("dassaultAviationTheme", () => {
  it("maps the Dassault Aviation brand identity into the Sentropic contract", () => {
    expect(dassaultAviationTheme).toMatchObject({
      id: "dassault-aviation",
      label: "Dassault Aviation",
      mode: "light"
    });

    const css = compileTheme(dassaultAviationTheme);
    expect(css).toContain('[data-st-theme="dassault-aviation"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Dassault Aviation form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = dassaultAviationTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f3f4f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#324b6b"
    });
  });

  it("emits Dassault Aviation brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(dassaultAviationTheme);
    // Dassault steel blue action + black brand text.
    expect(css).toContain("--st-semantic-action-primary: #324b6b;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Error red danger and ink inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #bd1919;");
    expect(css).toContain("--st-semantic-surface-inverse: #161c25;");
    // Dassault Aviation brand font family (DassaultAviationSans webfont).
    expect(css).toContain("DassaultAviationSans");
  });
});
