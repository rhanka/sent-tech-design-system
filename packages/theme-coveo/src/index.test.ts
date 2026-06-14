import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { coveoTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("coveoTheme", () => {
  it("maps Coveo identity into the Sentropic contract", () => {
    expect(coveoTheme).toMatchObject({
      id: "coveo",
      label: "Coveo",
      mode: "light"
    });

    const css = compileTheme(coveoTheme);
    expect(css).toContain('[data-st-theme="coveo"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Coveo form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = coveoTheme.tokens.component as ThemeComponent;
    // Coveo controls sit on white surfaces with a faint off-white page hover
    // (surface.default #ffffff / surface.subtle #f9f9fa).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f9f9fa"
    });
    // The primary button IS the iconic Coveo red CTA. The derived component button
    // radius follows the measured control radius (radius.md 6px).
    expect(component.button).toMatchObject({
      primaryBackground: "#d2271b",
      primaryText: "#ffffff",
      radius: "6px"
    });
    // Coveo form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Coveo active tab label is the brand red.
    expect(component.tabs).toMatchObject({
      activeText: "#d2271b"
    });
  });

  it("emits Coveo red + near-black ink and Gibson in the compiled variables", () => {
    const css = compileTheme(coveoTheme);
    // THE Coveo red action + the near-black ink.
    expect(css).toContain("--st-semantic-action-primary: #d2271b;");
    expect(css).toContain("--st-semantic-text-primary: #0e0f12;");
    // Danger red (the Coveo red) and the near-black reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #d2271b;");
    expect(css).toContain("--st-semantic-surface-inverse: #0e0f12;");
    // Coveo's brand face (Gibson webfont).
    expect(css).toContain("canada-type-gibson");
  });
});
