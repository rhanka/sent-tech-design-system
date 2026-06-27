import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { lvmhTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("lvmhTheme", () => {
  it("maps the LVMH identity into the Sentropic contract", () => {
    expect(lvmhTheme).toMatchObject({
      id: "lvmh",
      label: "LVMH",
      mode: "light"
    });

    const css = compileTheme(lvmhTheme);
    expect(css).toContain('[data-st-theme="lvmh"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // LVMH form fields are squared boxes (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = lvmhTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f7f3ed" // warm off-white (corporate-ultraLightWarmWhite)
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#030f2b" // deep navy (corporate-darkBlue)
    });
  });

  it("emits LVMH brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(lvmhTheme);
    // Deep navy primary action + primary text (corporate-darkBlue).
    expect(css).toContain("--st-semantic-action-primary: #030f2b;");
    expect(css).toContain("--st-semantic-text-primary: #030f2b;");
    // LVMH error red (basic-error) and deep-navy inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #db2327;");
    expect(css).toContain("--st-semantic-surface-inverse: #030f2b;");
    // LVMH proprietary typefaces (LVMH Sans body, LVMH display) + serif fallback.
    expect(css).toContain("LVMH Sans");
    expect(css).toContain("Georgia");
  });
});
