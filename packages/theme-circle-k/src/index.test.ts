import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { circleKTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("circleKTheme", () => {
  it("maps Circle K identity into the Sentropic contract", () => {
    expect(circleKTheme).toMatchObject({
      id: "circle-k",
      label: "Circle K",
      mode: "light"
    });

    const css = compileTheme(circleKTheme);
    expect(css).toContain('[data-st-theme="circle-k"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Circle K form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = circleKTheme.tokens.component as ThemeComponent;
    // Circle K controls sit on white surfaces with a faint grey page hover
    // (surface.default #ffffff / surface.subtle #f2f2f2).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f2f2f2"
    });
    // The primary button IS the iconic Circle K red CTA. The derived component
    // button radius follows the measured control radius (radius.md 4px).
    expect(component.button).toMatchObject({
      primaryBackground: "#DA291C",
      primaryText: "#ffffff",
      radius: "4px"
    });
    // Circle K form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Circle K active tab label is the brand red.
    expect(component.tabs).toMatchObject({
      activeText: "#DA291C"
    });
  });

  it("emits Circle K red + near-black ink and the retail sans in the compiled variables", () => {
    const css = compileTheme(circleKTheme);
    // THE Circle K red action + the near-black ink.
    expect(css).toContain("--st-semantic-action-primary: #DA291C;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    // Danger (brand red) and the near-black reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #DA291C;");
    expect(css).toContain("--st-semantic-surface-inverse: #1a1a1a;");
    // Circle K's clean retail sans (name only, à confirmer).
    expect(css).toContain("Helvetica Neue");
  });
});
