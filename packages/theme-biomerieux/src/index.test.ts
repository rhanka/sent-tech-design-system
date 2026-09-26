import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { biomerieuxTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("biomerieuxTheme", () => {
  it("maps the bioMérieux brand identity into the Sentropic contract", () => {
    expect(biomerieuxTheme).toMatchObject({
      id: "biomerieux",
      label: "bioMérieux",
      mode: "light"
    });

    const css = compileTheme(biomerieuxTheme);
    expect(css).toContain('[data-st-theme="biomerieux"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // bioMérieux form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = biomerieuxTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#ebebeb"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#00427f"
    });
  });

  it("emits bioMérieux brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(biomerieuxTheme);
    // Corporate blue action + body text.
    expect(css).toContain("--st-semantic-action-primary: #00427f;");
    expect(css).toContain("--st-semantic-text-primary: #444444;");
    // Error red danger and dark-blue inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #d00000;");
    expect(css).toContain("--st-semantic-surface-inverse: #00305d;");
    // bioMérieux brand font family (Arial, declared on html).
    expect(css).toContain("Arial");
  });
});
