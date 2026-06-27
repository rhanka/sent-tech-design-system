import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { lorealTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("lorealTheme", () => {
  it("maps the L'Oréal identity into the Sentropic contract", () => {
    expect(lorealTheme).toMatchObject({
      id: "loreal",
      label: "L'Oréal",
      mode: "light"
    });

    const css = compileTheme(lorealTheme);
    expect(css).toContain('[data-st-theme="loreal"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // L'Oréal form fields are minimal/filled with a faint rule (not boxed).
    expect(css).toContain("--st-field-style: filled-underline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = lorealTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f5f5f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "filled-underline",
      fillBg: "#f5f5f5"
    });
    // L'Oréal tabs: bold ink active label.
    expect(component.tabs).toMatchObject({
      activeText: "#3d3d3d"
    });
  });

  it("emits L'Oréal brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(lorealTheme);
    // L'Oréal ink action + ink text.
    expect(css).toContain("--st-semantic-action-primary: #3d3d3d;");
    expect(css).toContain("--st-semantic-text-primary: #3d3d3d;");
    // Deep red danger and pure-black inverse (master wordmark black).
    expect(css).toContain("--st-semantic-action-danger: #c2013a;");
    expect(css).toContain("--st-semantic-surface-inverse: #000000;");
    // L'Oréal font families (Helvetica Now Display UI/body, Halesworth serif display).
    expect(css).toContain("HelveticaNowDisplay");
    expect(css).toContain("Halesworth");
  });
});
