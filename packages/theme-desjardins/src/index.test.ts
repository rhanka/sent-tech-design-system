import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { desjardinsTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("desjardinsTheme", () => {
  it("maps Desjardins identity into the Sentropic contract", () => {
    expect(desjardinsTheme).toMatchObject({
      id: "desjardins",
      label: "Desjardins",
      mode: "light"
    });

    const css = compileTheme(desjardinsTheme);
    expect(css).toContain('[data-st-theme="desjardins"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Desjardins form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = desjardinsTheme.tokens.component as ThemeComponent;
    // Desjardins controls sit on white surfaces with a faint grey page hover
    // (surface.default #ffffff / surface.subtle #f4f4f4).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f4f4f4"
    });
    // The primary button IS the iconic Desjardins green CTA, mildly rounded (4px).
    expect(component.button).toMatchObject({
      primaryBackground: "#00874e",
      primaryText: "#ffffff",
      radius: "4px"
    });
    // Desjardins form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Desjardins active tab label is the accessible dark green.
    expect(component.tabs).toMatchObject({
      activeText: "#055b37"
    });
  });

  it("emits Desjardins green + soft-black ink and Desjardins Sans in the compiled variables", () => {
    const css = compileTheme(desjardinsTheme);
    // THE Desjardins green action + the soft near-black ink (not pure black).
    expect(css).toContain("--st-semantic-action-primary: #00874e;");
    expect(css).toContain("--st-semantic-text-primary: #2f2f2f;");
    // Measured danger red and the soft-black (#383838) reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #ca241a;");
    expect(css).toContain("--st-semantic-surface-inverse: #383838;");
    // Desjardins's proprietary brand sans.
    expect(css).toContain("Desjardins Sans");
  });
});
