import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { dassaultSystemesTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("dassaultSystemesTheme", () => {
  it("maps the Dassault Systèmes brand identity into the Sentropic contract", () => {
    expect(dassaultSystemesTheme).toMatchObject({
      id: "dassault-systemes",
      label: "Dassault Systèmes",
      mode: "light"
    });

    const css = compileTheme(dassaultSystemesTheme);
    expect(css).toContain('[data-st-theme="dassault-systemes"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Dassault Systèmes form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = dassaultSystemesTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f4f6f8"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#005386"
    });
  });

  it("emits Dassault Systèmes brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(dassaultSystemesTheme);
    // Corporate blue primary action + near-black body text.
    expect(css).toContain("--st-semantic-action-primary: #005386;");
    expect(css).toContain("--st-semantic-text-primary: #2d2d2d;");
    // Error red danger and deep-navy inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #e32b2e;");
    expect(css).toContain("--st-semantic-surface-inverse: #04315d;");
    // Dassault Systèmes proprietary corporate webfont family ("3ds").
    expect(css).toContain("3ds");
  });
});
