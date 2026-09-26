import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { klepierreTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("klepierreTheme", () => {
  it("maps Klépierre identity into the Sentropic contract", () => {
    expect(klepierreTheme).toMatchObject({
      id: "klepierre",
      label: "Klépierre",
      mode: "light"
    });

    const css = compileTheme(klepierreTheme);
    expect(css).toContain('[data-st-theme="klepierre"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Klépierre form fields are underline fields, not boxed.
    expect(css).toContain("--st-field-style: filled-underline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = klepierreTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#eeeeee"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "filled-underline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#141b4d"
    });
  });

  it("emits Klépierre brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(klepierreTheme);
    // Main-blue action + ink text.
    expect(css).toContain("--st-semantic-action-primary: #141b4d;");
    expect(css).toContain("--st-semantic-text-primary: #111111;");
    // Derived danger rose and main-blue inverse.
    expect(css).toContain("--st-semantic-action-danger: #c44d69;");
    expect(css).toContain("--st-semantic-surface-inverse: #141b4d;");
    // Klépierre font families (Calibre webfont under its hashed "b8ffa454"
    // family name for body, Avenir stack for display).
    expect(css).toContain("b8ffa454");
    expect(css).toContain("Calibre");
    expect(css).toContain("Avenir");
  });
});
