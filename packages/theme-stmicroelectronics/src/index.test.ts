import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { stmicroelectronicsTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("stmicroelectronicsTheme", () => {
  it("maps the STMicroelectronics brand identity into the Sentropic contract", () => {
    expect(stmicroelectronicsTheme).toMatchObject({
      id: "stmicroelectronics",
      label: "STMicroelectronics",
      mode: "light"
    });

    const css = compileTheme(stmicroelectronicsTheme);
    expect(css).toContain('[data-st-theme="stmicroelectronics"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // ST form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = stmicroelectronicsTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f7f8fa"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#03234b"
    });
  });

  it("emits STMicroelectronics brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(stmicroelectronicsTheme);
    // Brand navy action + navy primary text.
    expect(css).toContain("--st-semantic-action-primary: #03234b;");
    expect(css).toContain("--st-semantic-text-primary: #03234b;");
    // Measured error red danger and primary-dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #e6007e;");
    expect(css).toContain("--st-semantic-surface-inverse: #0f182f;");
    // ST brand font families (Arial body, ITCLubalinGraphStdMedium display).
    expect(css).toContain("Arial");
    expect(css).toContain("ITCLubalinGraphStdMedium");
  });
});
