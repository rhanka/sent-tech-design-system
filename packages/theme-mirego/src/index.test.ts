import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { miregoTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("miregoTheme", () => {
  it("maps Mirego identity into the Sentropic contract", () => {
    expect(miregoTheme).toMatchObject({
      id: "mirego",
      label: "Mirego",
      mode: "light"
    });

    const css = compileTheme(miregoTheme);
    expect(css).toContain('[data-st-theme="mirego"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Mirego form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = miregoTheme.tokens.component as ThemeComponent;
    // Mirego controls are white-filled with a faint cream hover (#f7edde).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f7edde"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Mirego active tab label is near-black ink.
    expect(component.tabs).toMatchObject({
      activeText: "#050307"
    });
  });

  it("emits Mirego ink/cream colours and the Almirego fonts in the compiled variables", () => {
    const css = compileTheme(miregoTheme);
    // Mirego ink action + ink text (the editorial identity).
    expect(css).toContain("--st-semantic-action-primary: #050307;");
    expect(css).toContain("--st-semantic-text-primary: #050307;");
    // Measured input error red and ink inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #d52a0b;");
    expect(css).toContain("--st-semantic-surface-inverse: #050307;");
    // Cream signature surface and periwinkle accent reach the variables.
    expect(css).toContain("--st-semantic-surface-subtle: #f7edde;");
    expect(css).toContain("#b5a6ff");
    // Mirego bespoke webfont families (Almirego + Almirego Display).
    expect(css).toContain("Almirego");
    expect(css).toContain("Almirego Display");
  });
});
