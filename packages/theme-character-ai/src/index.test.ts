import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { characterAiTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("characterAiTheme", () => {
  it("maps Character.AI identity into the Sentropic contract", () => {
    expect(characterAiTheme).toMatchObject({
      id: "character-ai",
      label: "Character.AI",
      mode: "light"
    });

    const css = compileTheme(characterAiTheme);
    expect(css).toContain('[data-st-theme="character-ai"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Character.AI form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = characterAiTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f4f4f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#195eff"
    });
  });

  it("emits Character.AI brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(characterAiTheme);
    // Dark primary CTA + Character grey body text.
    expect(css).toContain("--st-semantic-action-primary: #202024;");
    expect(css).toContain("--st-semantic-text-primary: #26272b;");
    // Error red and dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #cc3434;");
    expect(css).toContain("--st-semantic-surface-inverse: #202024;");
    // Character.AI font families (atHauss primary, Inter fallback).
    expect(css).toContain("atHauss");
    expect(css).toContain("Inter");
  });
});
