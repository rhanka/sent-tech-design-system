import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { veoliaTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("veoliaTheme", () => {
  it("maps the Veolia brand identity into the Sentropic contract", () => {
    expect(veoliaTheme).toMatchObject({
      id: "veolia",
      label: "Veolia",
      mode: "light"
    });

    const css = compileTheme(veoliaTheme);
    expect(css).toContain('[data-st-theme="veolia"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Veolia form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = veoliaTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f2f2f2"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#FF0000"
    });
  });

  it("emits Veolia brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(veoliaTheme);
    // Veolia red primary action + dark grey text.
    expect(css).toContain("--st-semantic-action-primary: #FF0000;");
    expect(css).toContain("--st-semantic-text-primary: #333333;");
    // Deep error red and near-black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #990000;");
    expect(css).toContain("--st-semantic-surface-inverse: #191919;");
    // Veolia digital font stack (TheSans brand font, Noto Sans/Arial web fallback).
    expect(css).toContain("TheSans");
    expect(css).toContain("Noto Sans");
    expect(css).toContain("Arial");
  });
});
