import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { copilotTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("copilotTheme", () => {
  it("maps Microsoft Copilot identity into the Sentropic contract", () => {
    expect(copilotTheme).toMatchObject({
      id: "copilot",
      label: "Microsoft Copilot",
      mode: "light"
    });

    const css = compileTheme(copilotTheme);
    expect(css).toContain('[data-st-theme="copilot"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Fluent 2 inputs are boxed & rounded (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = copilotTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f5f5f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Fluent selected tab text stays neutral (#242424); the indicator carries the brand.
    expect(component.tabs).toMatchObject({
      activeText: "#242424"
    });
  });

  it("emits Fluent brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(copilotTheme);
    // Fluent brand blue action + Fluent neutral grey text.
    expect(css).toContain("--st-semantic-action-primary: #0f6cbd;");
    expect(css).toContain("--st-semantic-text-primary: #242424;");
    // Fluent danger red and dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #b10e1c;");
    expect(css).toContain("--st-semantic-surface-inverse: #242424;");
    // Fluent font families (Segoe UI Variable UI, Consolas mono).
    expect(css).toContain("Segoe UI Variable");
    expect(css).toContain("Consolas");
  });
});
