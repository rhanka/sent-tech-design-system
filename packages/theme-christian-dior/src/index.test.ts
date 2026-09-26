import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { christianDiorTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("christianDiorTheme", () => {
  it("maps the Christian Dior SE brand identity into the Sentropic contract", () => {
    expect(christianDiorTheme).toMatchObject({
      id: "christian-dior",
      label: "Christian Dior",
      mode: "light"
    });

    const css = compileTheme(christianDiorTheme);
    expect(css).toContain('[data-st-theme="christian-dior"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Dior form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = christianDiorTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#eeeeee"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#ffffff"
    });
  });

  it("emits Christian Dior SE brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(christianDiorTheme);
    // Brand navy action + title dark-grey text.
    expect(css).toContain("--st-semantic-action-primary: #013755;");
    expect(css).toContain("--st-semantic-text-primary: #393939;");
    // Derived error red danger and dark navbar inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #b3261e;");
    expect(css).toContain("--st-semantic-surface-inverse: #313131;");
    // Dior brand font families (Montserrat UI, EB Garamond display).
    expect(css).toContain("Montserrat");
    expect(css).toContain("EB Garamond");
  });
});
