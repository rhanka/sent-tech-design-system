import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { eiffageTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("eiffageTheme", () => {
  it("maps the Eiffage brand identity into the Sentropic contract", () => {
    expect(eiffageTheme).toMatchObject({
      id: "eiffage",
      label: "Eiffage",
      mode: "light"
    });

    const css = compileTheme(eiffageTheme);
    expect(css).toContain('[data-st-theme="eiffage"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Eiffage form fields carry a fill + bottom rule (filled-underline), not
    // a four-sided box.
    expect(css).toContain("--st-field-style: filled-underline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = eiffageTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#eeeeee"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "filled-underline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#ffffff",
      activeBackground: "#eb0000"
    });
  });

  it("emits Eiffage brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(eiffageTheme);
    // Action red + body black text.
    expect(css).toContain("--st-semantic-action-primary: #eb0000;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Derived error red danger and dark footer inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #b3261e;");
    expect(css).toContain("--st-semantic-surface-inverse: #333333;");
    // Eiffage brand font families (controls/body + display titles).
    expect(css).toContain("Montserrat");
    expect(css).toContain("DM Serif Text");
    // Named fallback families in the shipped stacks.
    expect(css).toContain("Georgia");
    expect(css).toContain("SFMono-Regular");
  });
});
