import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { capgeminiTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("capgeminiTheme", () => {
  it("maps the Capgemini brand identity into the Sentropic contract", () => {
    expect(capgeminiTheme).toMatchObject({
      id: "capgemini",
      label: "Capgemini",
      mode: "light"
    });

    const css = compileTheme(capgeminiTheme);
    expect(css).toContain('[data-st-theme="capgemini"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Capgemini form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = capgeminiTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f2f6f9"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#0070AD"
    });
  });

  it("emits Capgemini brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(capgeminiTheme);
    // Capgemini Blue primary action + brand slate text.
    expect(css).toContain("--st-semantic-action-primary: #0070AD;");
    expect(css).toContain("--st-semantic-text-primary: #1c2a35;");
    // Error red danger and dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #d6273c;");
    expect(css).toContain("--st-semantic-surface-inverse: #1c2a35;");
    // Capgemini web font family (Ubuntu).
    expect(css).toContain("Ubuntu");
  });
});
