import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { vinciTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("vinciTheme", () => {
  it("maps the VINCI brand identity into the Sentropic contract", () => {
    expect(vinciTheme).toMatchObject({
      id: "vinci",
      label: "VINCI",
      mode: "light"
    });

    const css = compileTheme(vinciTheme);
    expect(css).toContain('[data-st-theme="vinci"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // VINCI form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = vinciTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f0f0f0"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Active tab carries the VINCI signature red.
    expect(component.tabs).toMatchObject({
      activeText: "#e20025"
    });
  });

  it("emits VINCI brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(vinciTheme);
    // VINCI signature red primary action + brand body text.
    expect(css).toContain("--st-semantic-action-primary: #e20025;");
    expect(css).toContain("--st-semantic-text-primary: #333333;");
    // Brand red danger and deep corporate-navy inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #e20025;");
    expect(css).toContain("--st-semantic-surface-inverse: #004489;");
    // VINCI proprietary digital typeface (names only).
    expect(css).toContain("Vinci Sans");
  });
});
