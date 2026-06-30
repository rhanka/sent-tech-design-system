import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { openrouterTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("openrouterTheme", () => {
  it("maps OpenRouter identity into the Sentropic contract", () => {
    expect(openrouterTheme).toMatchObject({
      id: "openrouter",
      label: "OpenRouter",
      mode: "light"
    });

    const css = compileTheme(openrouterTheme);
    expect(css).toContain('[data-st-theme="openrouter"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // shadcn form fields are boxed & rounded (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = openrouterTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f4f4f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#18181b"
    });
  });

  it("emits OpenRouter brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(openrouterTheme);
    // Ink primary action + zinc primary text.
    expect(css).toContain("--st-semantic-action-primary: #18181b;");
    expect(css).toContain("--st-semantic-text-primary: #18181b;");
    // Radix red danger and deepest-black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #e5484d;");
    expect(css).toContain("--st-semantic-surface-inverse: #09090b;");
    // OpenRouter font families (Inter body/headings, Lumen Sans display, Geist Mono).
    expect(css).toContain("Inter");
    expect(css).toContain("Lumen Sans");
    expect(css).toContain("Geist Mono");
  });
});
