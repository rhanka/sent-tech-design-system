import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { eiffageTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("eiffageTheme", () => {
  it("maps the Eiffage brand identity into the Sentropic contract", () => {
    expect(eiffageTheme).toMatchObject({
      id: "eiffage",
      label: "Eiffage",
      mode: "light"
    });

    const css = compileTheme(eiffageTheme);
    expect(css).toContain('[data-st-theme="eiffage"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Eiffage form fields carry a fill + bottom rule (filled-underline), not
    // a four-sided box.
    expect(css).toContain("--st-field-style: filled-underline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = eiffageTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#eeeeee"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "filled-underline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#ffffff",
      activeBackground: "#eb0000"
    });
  });

  it("locks the measured control typography and the density geometry", () => {
    // Regression lock for the review corrections: `.tg-link`
    // (`font-size: 1rem` at the 18px brand root → 1.125rem at 16px;
    // `line-height: 1em` → 1), the general form-input spec
    // (0.8333rem → 0.9375rem, 0.8889rem → 1.07), and the repeated brand
    // button block padding (11.5px → 0.71875rem at 16px, seven declarations
    // across five contexts — see MAPPING.md evidence). The inline axis
    // stays reference-aligned (fluid brand inline values, undeclared field
    // right side).
    expect(eiffageTheme.tokens.foundation).toMatchObject({
      typography: {
        control: { size: "1.125rem", weight: "600", lineHeight: "1" },
        field: { size: "0.9375rem", weight: "400", lineHeight: "1.07" }
      },
      density: {
        sm: {
          controlHeight: "2rem",
          paddingBlock: "0.71875rem",
          paddingInline: "0.5rem"
        },
        md: {
          controlHeight: "2.5rem",
          paddingBlock: "0.71875rem",
          paddingInline: "0.75rem",
          fontSize: "1rem"
        },
        lg: {
          controlHeight: "3rem",
          paddingBlock: "0.71875rem",
          paddingInline: "1rem"
        }
      }
    });
  });

  it("emits Eiffage brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(eiffageTheme);
    // Action red + body black text.
    expect(css).toContain("--st-semantic-action-primary: #eb0000;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Derived error red danger and dark footer inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #b3261e;");
    expect(css).toContain("--st-semantic-surface-inverse: #333333;");
    // Eiffage brand font families (controls/body + display titles).
    expect(css).toContain("Montserrat");
    expect(css).toContain("DM Serif Text");
    // Named fallback families in the shipped stacks.
    expect(css).toContain("Georgia");
    expect(css).toContain("SFMono-Regular");
  });
});
