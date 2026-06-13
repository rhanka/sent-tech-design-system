import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { nationalBankTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("nationalBankTheme", () => {
  it("maps National Bank identity into the Sentropic contract", () => {
    expect(nationalBankTheme).toMatchObject({
      id: "national-bank",
      label: "National Bank",
      mode: "light"
    });

    const css = compileTheme(nationalBankTheme);
    expect(css).toContain('[data-st-theme="national-bank"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // National Bank form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = nationalBankTheme.tokens.component as ThemeComponent;
    // National Bank controls sit on white surfaces with a faint grey page hover
    // (surface.default #ffffff / surface.subtle #f5f5f5).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f5f5f5"
    });
    // The primary button IS the iconic National Bank red CTA. The brand CTA is a
    // fully-rounded pill (radius.pill 999px, encoded for the pill button family /
    // tags / badges); the derived component button radius follows the measured
    // control radius (radius.md 6px).
    expect(component.button).toMatchObject({
      primaryBackground: "#e41c23",
      primaryText: "#ffffff",
      radius: "6px"
    });
    // National Bank form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // National Bank active tab label is the brand red.
    expect(component.tabs).toMatchObject({
      activeText: "#e41c23"
    });
  });

  it("emits National Bank red + deep-navy ink and Gilroy/Korolev in the compiled variables", () => {
    const css = compileTheme(nationalBankTheme);
    // THE National Bank red action + the deep navy ink.
    expect(css).toContain("--st-semantic-action-primary: #e41c23;");
    expect(css).toContain("--st-semantic-text-primary: #00314d;");
    // Measured danger red and the deep-navy reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #d0011b;");
    expect(css).toContain("--st-semantic-surface-inverse: #00314d;");
    // National Bank's proprietary brand faces.
    expect(css).toContain("Gilroy");
    expect(css).toContain("Korolev");
  });
});
