import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { saqTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("saqTheme", () => {
  it("maps SAQ identity into the Sentropic contract", () => {
    expect(saqTheme).toMatchObject({
      id: "saq",
      label: "SAQ",
      mode: "light"
    });

    const css = compileTheme(saqTheme);
    expect(css).toContain('[data-st-theme="saq"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // SAQ form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = saqTheme.tokens.component as ThemeComponent;
    // SAQ controls sit on white surfaces with a faint grey page hover
    // (surface.default #ffffff / surface.subtle #f2f2f2).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f2f2f2"
    });
    // The primary button IS the SAQ coral-red CTA. Button radius derives from the
    // measured radius.md (0.5rem / 8px — SAQ's only non-square step).
    expect(component.button).toMatchObject({
      primaryBackground: "#fc4d30",
      primaryText: "#ffffff",
      radius: "0.5rem"
    });
    // SAQ form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // SAQ active tab label is the brand coral-red.
    expect(component.tabs).toMatchObject({
      activeText: "#fc4d30"
    });
  });

  it("emits SAQ coral + near-black ink, burgundy inverse and Maax in the compiled variables", () => {
    const css = compileTheme(saqTheme);
    // THE SAQ coral-red action + the near-black ink.
    expect(css).toContain("--st-semantic-action-primary: #fc4d30;");
    expect(css).toContain("--st-semantic-text-primary: #1d1d1b;");
    // Measured danger red and the deep burgundy (#7e003f) reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #d0011b;");
    expect(css).toContain("--st-semantic-surface-inverse: #7e003f;");
    // SAQ's proprietary brand sans.
    expect(css).toContain("Maax");
  });
});
