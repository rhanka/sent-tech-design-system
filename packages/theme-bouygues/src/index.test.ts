import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { bouyguesTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("bouyguesTheme", () => {
  it("maps the Bouygues group identity into the Sentropic contract", () => {
    expect(bouyguesTheme).toMatchObject({
      id: "bouygues",
      label: "Bouygues",
      mode: "light"
    });

    const css = compileTheme(bouyguesTheme);
    expect(css).toContain('[data-st-theme="bouygues"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Bouygues form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = bouyguesTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f1f1f1"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Active tab = brand orange (the Bouygues group is an orange brand).
    expect(component.tabs).toMatchObject({
      activeText: "#e75113"
    });
  });

  it("emits Bouygues brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(bouyguesTheme);
    // Brand orange primary action + near-black brand text.
    expect(css).toContain("--st-semantic-action-primary: #e75113;");
    expect(css).toContain("--st-semantic-text-primary: #14151a;");
    // Deep red-orange danger and navy inverse surface (secondary blue family).
    expect(css).toContain("--st-semantic-action-danger: #dc2319;");
    expect(css).toContain("--st-semantic-surface-inverse: #273584;");
    // Bouygues site font family (Lato).
    expect(css).toContain("Lato");
  });
});
