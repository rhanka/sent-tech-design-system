import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { metroTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("metroTheme", () => {
  it("maps Metro identity into the Sentropic contract", () => {
    expect(metroTheme).toMatchObject({
      id: "metro",
      label: "Metro",
      mode: "light"
    });

    const css = compileTheme(metroTheme);
    expect(css).toContain('[data-st-theme="metro"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Metro form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = metroTheme.tokens.component as ThemeComponent;
    // Metro controls sit on white surfaces with a faint grey page hover
    // (surface.default #ffffff / surface.subtle #f5f5f5).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f5f5f5"
    });
    // The primary button IS the iconic Metro red CTA. The derived component
    // button radius follows the measured control radius (radius.md 4px).
    expect(component.button).toMatchObject({
      primaryBackground: "#D81E05",
      primaryText: "#ffffff",
      radius: "4px"
    });
    // Metro form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Metro active tab label is the brand red.
    expect(component.tabs).toMatchObject({
      activeText: "#D81E05"
    });
  });

  it("emits Metro red + dark-grey ink and Roboto in the compiled variables", () => {
    const css = compileTheme(metroTheme);
    // THE Metro red action + the dark-grey ink.
    expect(css).toContain("--st-semantic-action-primary: #D81E05;");
    expect(css).toContain("--st-semantic-text-primary: #333333;");
    // Danger (brand red) and the dark reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #D81E05;");
    expect(css).toContain("--st-semantic-surface-inverse: #292929;");
    // Metro's measured sans (Roboto, name only).
    expect(css).toContain("Roboto");
  });
});
