import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { danoneTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("danoneTheme", () => {
  it("maps the Danone identity into the Sentropic contract", () => {
    expect(danoneTheme).toMatchObject({
      id: "danone",
      label: "Danone",
      mode: "light"
    });

    const css = compileTheme(danoneTheme);
    expect(css).toContain('[data-st-theme="danone"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Danone form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = danoneTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f8f8f8" // light background alt (--color-neutral-50)
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#005eb8" // Danone corporate blue (--colors-text-danone-blue)
    });
  });

  it("emits Danone brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(danoneTheme);
    // Danone blue primary action + measured primary text.
    expect(css).toContain("--st-semantic-action-primary: #005eb8;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Danone danger red and navy inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #e81221;");
    expect(css).toContain("--st-semantic-surface-inverse: #002677;");
    // Danone proprietary brand typeface (DanoneOne) + Arial metric fallback.
    expect(css).toContain("DanoneOne");
    expect(css).toContain("Arial");
  });
});
