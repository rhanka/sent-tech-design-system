import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { sanofiTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("sanofiTheme", () => {
  it("maps the Sanofi brand identity into the Sentropic contract", () => {
    expect(sanofiTheme).toMatchObject({
      id: "sanofi",
      label: "Sanofi",
      mode: "light"
    });

    const css = compileTheme(sanofiTheme);
    expect(css).toContain('[data-st-theme="sanofi"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Sanofi form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = sanofiTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f5f5f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#7a00e6"
    });
  });

  it("emits Sanofi brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(sanofiTheme);
    // Brand violet action + neutral text.
    expect(css).toContain("--st-semantic-action-primary: #7a00e6;");
    expect(css).toContain("--st-semantic-text-primary: #171717;");
    // System danger red and dark-violet inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #b42318;");
    expect(css).toContain("--st-semantic-surface-inverse: #23004c;");
    // Sanofi typefaces (Sanofi Sans UI body, Sanofi Serif editorial display).
    expect(css).toContain("Sanofi Sans");
    expect(css).toContain("Sanofi Serif");
  });
});
