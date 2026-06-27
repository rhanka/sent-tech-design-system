import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { orangeTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("orangeTheme", () => {
  it("maps the Orange brand identity into the Sentropic contract", () => {
    expect(orangeTheme).toMatchObject({
      id: "orange",
      label: "Orange",
      mode: "light"
    });

    const css = compileTheme(orangeTheme);
    expect(css).toContain('[data-st-theme="orange"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Orange Boosted form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = orangeTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f6f6f6"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Active tab = AA-safe Orange.
    expect(component.tabs).toMatchObject({
      activeText: "#f16e00"
    });
  });

  it("emits Orange brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(orangeTheme);
    // Bright brand orange primary action + black brand text.
    expect(css).toContain("--st-semantic-action-primary: #ff7900;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Functional red danger and black inverse surface (Orange's black panels).
    expect(css).toContain("--st-semantic-action-danger: #cd3c14;");
    expect(css).toContain("--st-semantic-surface-inverse: #000000;");
    // Orange Boosted type stack (Helvetica Neue).
    expect(css).toContain("Helvetica Neue");
  });
});
