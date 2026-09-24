import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { unibailRodamcoWestfieldTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("unibailRodamcoWestfieldTheme", () => {
  it("maps the Unibail-Rodamco-Westfield brand identity into the Sentropic contract", () => {
    expect(unibailRodamcoWestfieldTheme).toMatchObject({
      id: "unibail-rodamco-westfield",
      label: "Unibail-Rodamco-Westfield",
      mode: "light"
    });

    const css = compileTheme(unibailRodamcoWestfieldTheme);
    expect(css).toContain('[data-st-theme="unibail-rodamco-westfield"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // URW form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = unibailRodamcoWestfieldTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#e8e8e8"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#d62d20"
    });
  });

  it("emits Unibail-Rodamco-Westfield brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(unibailRodamcoWestfieldTheme);
    // Main Red action + brand near-black text.
    expect(css).toContain("--st-semantic-action-primary: #d62d20;");
    expect(css).toContain("--st-semantic-text-primary: #242424;");
    // Main Red danger and near-black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #d62d20;");
    expect(css).toContain("--st-semantic-surface-inverse: #242424;");
    // URW brand font families (FlamaCondensed display, Helvetica body).
    expect(css).toContain("FlamaCondensed");
    expect(css).toContain("Helvetica");
  });
});
