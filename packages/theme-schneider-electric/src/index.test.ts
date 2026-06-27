import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { schneiderElectricTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("schneiderElectricTheme", () => {
  it("maps the Schneider Electric brand identity into the Sentropic contract", () => {
    expect(schneiderElectricTheme).toMatchObject({
      id: "schneider-electric",
      label: "Schneider Electric",
      mode: "light"
    });

    const css = compileTheme(schneiderElectricTheme);
    expect(css).toContain('[data-st-theme="schneider-electric"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Schneider form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = schneiderElectricTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f4f6f7"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#1e7e34"
    });
  });

  it("emits Schneider Electric brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(schneiderElectricTheme);
    // Life Green action + brand slate text.
    expect(css).toContain("--st-semantic-action-primary: #3DCD58;");
    expect(css).toContain("--st-semantic-text-primary: #1a2326;");
    // Error red danger and dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #e2231a;");
    expect(css).toContain("--st-semantic-surface-inverse: #1a2326;");
    // Schneider brand font family (Nunito, the Quartz brand typeface).
    expect(css).toContain("Nunito");
  });
});
