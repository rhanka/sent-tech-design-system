import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { cascadesTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("cascadesTheme", () => {
  it("maps Cascades identity into the Sentropic contract", () => {
    expect(cascadesTheme).toMatchObject({
      id: "cascades",
      label: "Cascades",
      mode: "light"
    });

    const css = compileTheme(cascadesTheme);
    expect(css).toContain('[data-st-theme="cascades"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Cascades form fields are boxed (outline) with a recycled-paper cream fill.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = cascadesTheme.tokens.component as ThemeComponent;
    // Cascades controls sit on white surfaces with a pale recycled-cream page hover
    // (surface.default #ffffff / surface.subtle #f3f2ed).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f3f2ed"
    });
    // The primary button IS the deep forest Cascades green CTA, generously rounded
    // (10px — measured border-radius:1rem @ the site's 10px root).
    expect(component.button).toMatchObject({
      primaryBackground: "#00483c",
      primaryText: "#ffffff",
      radius: "10px"
    });
    // Cascades form fields are boxed outlines filled with recycled-paper cream.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ebe8db"
    });
    // Cascades active tab label is the brand green.
    expect(component.tabs).toMatchObject({
      activeText: "#00483c"
    });
  });

  it("emits Cascades green + warm ink and Roboto/Cambon fonts in the compiled variables", () => {
    const css = compileTheme(cascadesTheme);
    // THE deep forest Cascades green action + the warm near-black body ink.
    expect(css).toContain("--st-semantic-action-primary: #00483c;");
    expect(css).toContain("--st-semantic-text-primary: #464646;");
    // Measured Bootstrap danger red and the deep-green reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #dc3545;");
    expect(css).toContain("--st-semantic-surface-inverse: #00483c;");
    // Cascades's body sans + serif display face.
    expect(css).toContain("Roboto-Regular");
    expect(css).toContain("Cambon-ExtraBold");
  });
});
