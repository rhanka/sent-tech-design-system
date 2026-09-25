import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { aeroportsDeParisTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("aeroportsDeParisTheme", () => {
  it("maps the Aéroports de Paris brand identity into the Sentropic contract", () => {
    expect(aeroportsDeParisTheme).toMatchObject({
      id: "aeroports-de-paris",
      label: "Aéroports de Paris",
      mode: "light"
    });

    const css = compileTheme(aeroportsDeParisTheme);
    expect(css).toContain('[data-st-theme="aeroports-de-paris"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // ADP form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = aeroportsDeParisTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f7f7f7"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#031f73"
    });
  });

  it("emits Aéroports de Paris brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(aeroportsDeParisTheme);
    // Main deep blue action + body grey text.
    expect(css).toContain("--st-semantic-action-primary: #031f73;");
    expect(css).toContain("--st-semantic-text-primary: #272727;");
    // Error red danger and main-blue inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #c81e1e;");
    expect(css).toContain("--st-semantic-surface-inverse: #031f73;");
    // ADP brand font family (Montserrat, the current site face).
    expect(css).toContain("Montserrat");
  });
});
