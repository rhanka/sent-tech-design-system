import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { inflectionTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("inflectionTheme", () => {
  it("maps Inflection (Pi) identity into the Sentropic contract", () => {
    expect(inflectionTheme).toMatchObject({
      id: "inflection",
      label: "Inflection (Pi)",
      mode: "light"
    });

    const css = compileTheme(inflectionTheme);
    expect(css).toContain('[data-st-theme="inflection"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Pi form fields are boxed & rounded (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = inflectionTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#faf3ea",
      hoverBackground: "#f5eadc"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#fcfaf7"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#1a4631"
    });
  });

  it("emits Inflection (Pi) brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(inflectionTheme);
    // Pine-green action + warm near-black text.
    expect(css).toContain("--st-semantic-action-primary: #1a4631;");
    expect(css).toContain("--st-semantic-text-primary: #1a1918;");
    // Pi error red-orange and dark warm inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #d42600;");
    expect(css).toContain("--st-semantic-surface-inverse: #242322;");
    // Pi font families (GT Alpina display serif, ABC Oracle body sans).
    expect(css).toContain("GT Alpina");
    expect(css).toContain("ABC Oracle");
  });
});
