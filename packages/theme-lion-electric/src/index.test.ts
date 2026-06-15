import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { lionElectricTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("lionElectricTheme", () => {
  it("maps Lion Electric identity into the Sentropic contract", () => {
    expect(lionElectricTheme).toMatchObject({
      id: "lion-electric",
      label: "Lion Electric",
      mode: "light"
    });

    const css = compileTheme(lionElectricTheme);
    expect(css).toContain('[data-st-theme="lion-electric"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Lion form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = lionElectricTheme.tokens.component as ThemeComponent;
    // Lion controls sit on white surfaces with a faint pale-blue-grey page hover
    // (surface.default #ffffff / surface.subtle #ebf0f3).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#ebf0f3"
    });
    // The primary button IS the iconic Lion electric-blue CTA, with the measured soft
    // Le builder dérive button.radius de foundation.radius.md (6px ici).
    expect(component.button).toMatchObject({
      primaryBackground: "#4164ff",
      primaryText: "#ffffff",
      radius: "6px"
    });
    // Lion form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Lion active tab label is the brand electric-blue.
    expect(component.tabs).toMatchObject({
      activeText: "#4164ff"
    });
  });

  it("emits Lion electric-blue + black ink and Roobert LE in the compiled variables", () => {
    const css = compileTheme(lionElectricTheme);
    // THE Lion electric-blue action + the pure-black ink.
    expect(css).toContain("--st-semantic-action-primary: #4164ff;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Danger red and the black reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #d12c2c;");
    expect(css).toContain("--st-semantic-surface-inverse: #000000;");
    // Lion's measured brand face: Roobert LE across body and display.
    expect(css).toContain("Roobert LE");
  });
});
