import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { geminiTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("geminiTheme", () => {
  it("maps Google Gemini identity into the Sentropic contract", () => {
    expect(geminiTheme).toMatchObject({
      id: "gemini",
      label: "Google Gemini",
      mode: "light"
    });

    const css = compileTheme(geminiTheme);
    expect(css).toContain('[data-st-theme="gemini"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Google / Material form fields are boxed & rounded (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = geminiTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f1f3f4"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#1a73e8"
    });
  });

  it("emits Google brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(geminiTheme);
    // Google Blue action + Google grey text.
    expect(css).toContain("--st-semantic-action-primary: #1a73e8;");
    expect(css).toContain("--st-semantic-text-primary: #202124;");
    // Google error red and dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #d93025;");
    expect(css).toContain("--st-semantic-surface-inverse: #202124;");
    // Google font families (Google Sans display, Roboto body).
    expect(css).toContain("Google Sans");
    expect(css).toContain("Roboto");
  });
});
