import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { nuveiTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("nuveiTheme", () => {
  it("maps Nuvei identity into the Sentropic contract", () => {
    expect(nuveiTheme).toMatchObject({
      id: "nuvei",
      label: "Nuvei",
      mode: "light"
    });

    const css = compileTheme(nuveiTheme);
    expect(css).toContain('[data-st-theme="nuvei"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Nuvei form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = nuveiTheme.tokens.component as ThemeComponent;
    // Nuvei controls sit on white surfaces with a faint cream page hover
    // (surface.default #ffffff / surface.subtle #FAF9F8).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#FAF9F8"
    });
    // The primary button IS the iconic Nuvei deep-indigo CTA, modern-fintech
    // rounded (8px = foundation.radius.md, the createComponent button radius).
    expect(component.button).toMatchObject({
      primaryBackground: "#160850",
      primaryText: "#ffffff",
      radius: "8px"
    });
    // Nuvei form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Nuvei active tab label is the deep indigo.
    expect(component.tabs).toMatchObject({
      activeText: "#160850"
    });
  });

  it("emits Nuvei deep indigo + magenta danger and Inter Tight in the compiled variables", () => {
    const css = compileTheme(nuveiTheme);
    // THE Nuvei deep indigo action + ink.
    expect(css).toContain("--st-semantic-action-primary: #160850;");
    expect(css).toContain("--st-semantic-text-primary: #160850;");
    // Measured brand magenta danger and the deep-indigo inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #E40046;");
    expect(css).toContain("--st-semantic-surface-inverse: #160850;");
    // Nuvei's measured brand sans.
    expect(css).toContain("Inter Tight");
  });
});
