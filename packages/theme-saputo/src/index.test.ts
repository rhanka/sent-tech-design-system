import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { saputoTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("saputoTheme", () => {
  it("maps Saputo identity into the Sentropic contract", () => {
    expect(saputoTheme).toMatchObject({
      id: "saputo",
      label: "Saputo",
      mode: "light"
    });

    const css = compileTheme(saputoTheme);
    expect(css).toContain('[data-st-theme="saputo"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Saputo form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = saputoTheme.tokens.component as ThemeComponent;
    // Saputo controls sit on white surfaces with a faint grey page hover
    // (surface.default #ffffff / surface.subtle #f5f5f5).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f5f5f5"
    });
    // The primary button IS the iconic Saputo red CTA. The derived component button
    // radius follows the measured control/field radius (radius.md 4px); Saputo's
    // buttons are squarish (measured CTA border-radius 3px / 4px) — only chips pill.
    expect(component.button).toMatchObject({
      primaryBackground: "#e31c23",
      primaryText: "#ffffff",
      radius: "4px"
    });
    // Saputo form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Saputo active tab label is the scarlet under-rule colour.
    expect(component.tabs).toMatchObject({
      activeText: "#e33225"
    });
  });

  it("emits Saputo red + pure-black ink and Open Sans/FlamaSemicondensed in the compiled variables", () => {
    const css = compileTheme(saputoTheme);
    // THE Saputo red action + the pure-black ink.
    expect(css).toContain("--st-semantic-action-primary: #e31c23;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Measured danger red and the deep-wine reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #e31c23;");
    expect(css).toContain("--st-semantic-surface-inverse: #4f0710;");
    // Saputo's brand faces.
    expect(css).toContain("Open Sans");
    expect(css).toContain("FlamaSemicondensed");
  });
});
