import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { groqTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("groqTheme", () => {
  it("maps Groq identity into the Sentropic contract", () => {
    expect(groqTheme).toMatchObject({
      id: "groq",
      label: "Groq",
      mode: "light"
    });

    const css = compileTheme(groqTheme);
    expect(css).toContain('[data-st-theme="groq"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Groq form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = groqTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      // Warm cream page surface; subtle warm hover fill.
      background: "#fafaf8",
      hoverBackground: "#f3f3ee"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Groq pill buttons (escape-hatch override) vs the boxed 4px control radius.
    expect(component.button.radius).toBe("999px");
    expect(component.tabs).toMatchObject({
      activeText: "#f43e01"
    });
  });

  it("emits Groq brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(groqTheme);
    // Brand orange action + Groq ink primary text.
    expect(css).toContain("--st-semantic-action-primary: #f43e01;");
    expect(css).toContain("--st-semantic-text-primary: #2d2f33;");
    // Orange-dark danger and the dark ink inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #c23101;");
    expect(css).toContain("--st-semantic-surface-inverse: #2d2f33;");
    // Groq font families (Space Grotesk display/body, IBM Plex Mono code).
    expect(css).toContain("Space Grotesk");
    expect(css).toContain("IBM Plex Mono");
  });
});
