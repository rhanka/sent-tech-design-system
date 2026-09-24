import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { essilorluxotticaTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("essilorluxotticaTheme", () => {
  it("maps the EssilorLuxottica brand identity into the Sentropic contract", () => {
    expect(essilorluxotticaTheme).toMatchObject({
      id: "essilorluxottica",
      label: "EssilorLuxottica",
      mode: "light"
    });

    const css = compileTheme(essilorluxotticaTheme);
    expect(css).toContain('[data-st-theme="essilorluxottica"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // EssilorLuxottica form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = essilorluxotticaTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f4f4f4"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#000000"
    });
  });

  it("emits EssilorLuxottica brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(essilorluxotticaTheme);
    // Brand black action + black primary text.
    expect(css).toContain("--st-semantic-action-primary: #000000;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Error red danger and black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #c62828;");
    expect(css).toContain("--st-semantic-surface-inverse: #000000;");
    // EssilorLuxottica brand font families (Avenir body, Libre Caslon display).
    expect(css).toContain("Avenir");
    expect(css).toContain("LibreCaslonDisplayRegular");
  });
});
