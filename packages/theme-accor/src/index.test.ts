import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { accorTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("accorTheme", () => {
  it("maps the Accor design system identity into the Sentropic contract", () => {
    expect(accorTheme).toMatchObject({
      id: "accor",
      label: "Accor",
      mode: "light"
    });

    const css = compileTheme(accorTheme);
    expect(css).toContain('[data-st-theme="accor"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Accor form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = accorTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f7f9fb"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Accor active tab = accent CTA blue.
    expect(component.tabs).toMatchObject({
      activeText: "#2d4cd5"
    });
  });

  it("emits Accor brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(accorTheme);
    // Deep indigo primary action + near-black Accor text.
    expect(css).toContain("--st-semantic-action-primary: #050033;");
    expect(css).toContain("--st-semantic-text-primary: #232136;");
    // Accor danger red and inverse deep-indigo surface.
    expect(css).toContain("--st-semantic-action-danger: #be003c;");
    expect(css).toContain("--st-semantic-surface-inverse: #050033;");
    // Accor documented platform typefaces (SF Pro on iOS, Roboto on Android).
    expect(css).toContain("SF Pro");
    expect(css).toContain("Roboto");
  });
});
