import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { airLiquideTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("air-liquideTheme", () => {
  it("maps the Air Liquide brand identity into the Sentropic contract", () => {
    expect(airLiquideTheme).toMatchObject({
      id: "air-liquide",
      label: "Air Liquide",
      mode: "light"
    });

    const css = compileTheme(airLiquideTheme);
    expect(css).toContain('[data-st-theme="air-liquide"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Air Liquide form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = airLiquideTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f5f7fa"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#375F9B"
    });
  });

  it("emits Air Liquide brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(airLiquideTheme);
    // Corporate blue action + brand slate text.
    expect(css).toContain("--st-semantic-action-primary: #375F9B;");
    expect(css).toContain("--st-semantic-text-primary: #1f2a3a;");
    // Brand "Unique Red" danger and dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #D7001E;");
    expect(css).toContain("--st-semantic-surface-inverse: #1f2a3a;");
    // Air Liquide font family (Montserrat as the public "Alfa" approximation).
    expect(css).toContain("Montserrat");
  });
});
