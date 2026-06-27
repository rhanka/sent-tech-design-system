import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { bnpParibasTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("bnpParibasTheme", () => {
  it("maps the BNP Paribas identity into the Sentropic contract", () => {
    expect(bnpParibasTheme).toMatchObject({
      id: "bnp-paribas",
      label: "BNP Paribas",
      mode: "light"
    });

    const css = compileTheme(bnpParibasTheme);
    expect(css).toContain('[data-st-theme="bnp-paribas"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // BNP form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = bnpParibasTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f5f5f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#00915a"
    });
  });

  it("emits BNP brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(bnpParibasTheme);
    // BNP green action + near-black text.
    expect(css).toContain("--st-semantic-action-primary: #00915a;");
    expect(css).toContain("--st-semantic-text-primary: #181d1d;");
    // BNP error red and dark-green inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #ce1e43;");
    expect(css).toContain("--st-semantic-surface-inverse: #013222;");
    // BNPP font families (BNP Type display, BNP Sans body).
    expect(css).toContain("BNP Sans");
    expect(css).toContain("BNP Type");
  });
});
