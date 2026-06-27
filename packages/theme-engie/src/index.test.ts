import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { engieTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("engieTheme", () => {
  it("maps the ENGIE brand identity into the Sentropic contract", () => {
    expect(engieTheme).toMatchObject({
      id: "engie",
      label: "ENGIE",
      mode: "light"
    });

    const css = compileTheme(engieTheme);
    expect(css).toContain('[data-st-theme="engie"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // ENGIE form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = engieTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f3f5f7"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#007ACD"
    });
  });

  it("emits ENGIE brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(engieTheme);
    // Blue Bolt primary action + brand slate text.
    expect(css).toContain("--st-semantic-action-primary: #007ACD;");
    expect(css).toContain("--st-semantic-text-primary: #1b2733;");
    // Error red danger and dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #e6173c;");
    expect(css).toContain("--st-semantic-surface-inverse: #1b2733;");
    // ENGIE digital font family (Lato).
    expect(css).toContain("Lato");
  });
});
