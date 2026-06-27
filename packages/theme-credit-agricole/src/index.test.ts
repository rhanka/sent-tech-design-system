import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { creditAgricoleTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("creditAgricoleTheme", () => {
  it("maps the Crédit Agricole identity into the Sentropic contract", () => {
    expect(creditAgricoleTheme).toMatchObject({
      id: "credit-agricole",
      label: "Crédit Agricole",
      mode: "light"
    });

    const css = compileTheme(creditAgricoleTheme);
    expect(css).toContain('[data-st-theme="credit-agricole"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // CA form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = creditAgricoleTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f4f6f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#006f4e"
    });
  });

  it("emits Crédit Agricole brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(creditAgricoleTheme);
    // CA "banque verte" green action + near-black text.
    expect(css).toContain("--st-semantic-action-primary: #006f4e;");
    expect(css).toContain("--st-semantic-text-primary: #16201b;");
    // CA red danger and CA dark-green inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #ed1c24;");
    expect(css).toContain("--st-semantic-surface-inverse: #04392a;");
    // CA neutral humanist sans stack.
    expect(css).toContain("system-ui");
  });
});
