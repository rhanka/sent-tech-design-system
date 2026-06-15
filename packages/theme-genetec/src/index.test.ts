import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { genetecTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("genetecTheme", () => {
  it("maps Genetec identity into the Sentropic contract", () => {
    expect(genetecTheme).toMatchObject({
      id: "genetec",
      label: "Genetec",
      mode: "light"
    });

    const css = compileTheme(genetecTheme);
    expect(css).toContain('[data-st-theme="genetec"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Genetec form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = genetecTheme.tokens.component as ThemeComponent;
    // Genetec controls sit on white surfaces with a faint eggshell page hover
    // (surface.default #ffffff / surface.subtle #f0f0f0).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f0f0f0"
    });
    // The primary button IS the Genetec charcoal CTA. The derived component button
    // radius follows the measured control radius (radius.md 4px).
    expect(component.button).toMatchObject({
      primaryBackground: "#22282f",
      primaryText: "#f0f0f0",
      radius: "4px"
    });
    // Genetec form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Genetec active tab label is the brand electric cyan.
    expect(component.tabs).toMatchObject({
      activeText: "#00aeef"
    });
  });

  it("emits Genetec charcoal + cyan and Circular in the compiled variables", () => {
    const css = compileTheme(genetecTheme);
    // THE Genetec charcoal action + the charcoal ink.
    expect(css).toContain("--st-semantic-action-primary: #22282f;");
    expect(css).toContain("--st-semantic-text-primary: #22282f;");
    // The electric-cyan link / accent.
    expect(css).toContain("--st-semantic-text-link: #00aeef;");
    // Danger red and the charcoal reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #d32f2f;");
    expect(css).toContain("--st-semantic-surface-inverse: #22282f;");
    // Genetec's brand face (Circular webfont).
    expect(css).toContain("Circular");
  });
});
