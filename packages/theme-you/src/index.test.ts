import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { youTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("youTheme", () => {
  it("maps You.com identity into the Sentropic contract", () => {
    expect(youTheme).toMatchObject({
      id: "you",
      label: "You.com",
      mode: "light"
    });

    const css = compileTheme(youTheme);
    expect(css).toContain('[data-st-theme="you"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // You.com form fields are boxed & rounded (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = youTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f7f9ff"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#5368ee"
    });
  });

  it("emits You.com brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(youTheme);
    // Iris action + charcoal text.
    expect(css).toContain("--st-semantic-action-primary: #5368ee;");
    expect(css).toContain("--st-semantic-text-primary: #121212;");
    // Coral error and charcoal inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #f04438;");
    expect(css).toContain("--st-semantic-surface-inverse: #121212;");
    // You.com font families (Lumen Sans brand typeface, Manrope fallback).
    expect(css).toContain("Lumen Sans");
    expect(css).toContain("Manrope");
  });
});
