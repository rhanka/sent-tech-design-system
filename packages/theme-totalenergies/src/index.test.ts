import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { totalenergiesTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("totalenergiesTheme", () => {
  it("maps the TotalEnergies brand identity into the Sentropic contract", () => {
    expect(totalenergiesTheme).toMatchObject({
      id: "totalenergies",
      label: "TotalEnergies",
      mode: "light"
    });

    const css = compileTheme(totalenergiesTheme);
    expect(css).toContain('[data-st-theme="totalenergies"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // TotalEnergies form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = totalenergiesTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f8f9fa"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#285AFF"
    });
  });

  it("emits TotalEnergies brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(totalenergiesTheme);
    // Primary blue action + brand slate text.
    expect(css).toContain("--st-semantic-action-primary: #285AFF;");
    expect(css).toContain("--st-semantic-text-primary: #374649;");
    // Brand red danger and dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #E70000;");
    expect(css).toContain("--st-semantic-surface-inverse: #374649;");
    // TotalEnergies font families (Nunito display, Roboto body).
    expect(css).toContain("Nunito");
    expect(css).toContain("Roboto");
  });
});
