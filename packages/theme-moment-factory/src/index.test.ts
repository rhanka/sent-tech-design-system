import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { momentFactoryTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("momentFactoryTheme", () => {
  it("maps Moment Factory identity into the Sentropic contract", () => {
    expect(momentFactoryTheme).toMatchObject({
      id: "moment-factory",
      label: "Moment Factory",
      mode: "dark"
    });

    const css = compileTheme(momentFactoryTheme);
    expect(css).toContain('[data-st-theme="moment-factory"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Moment Factory form fields are borderless and SQUARE (outline style, no radius).
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = momentFactoryTheme.tokens.component as ThemeComponent;
    // Dark-first: the input control sits on the black stage (#000000) and lifts
    // to a near-black panel (#0d0d0d) on hover.
    expect(component.control).toMatchObject({
      background: "#000000",
      hoverBackground: "#0d0d0d"
    });
    // The primary BUTTON is the electric-yellow CTA (#ffea00), black text on yellow.
    expect(component.button).toMatchObject({
      primaryBackground: "#ffea00",
      primaryText: "#000000"
    });
    // Moment Factory fields are square (radius 0) flat boxes on the dark ground.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      radiusTop: "0",
      radiusBottom: "0"
    });
    // Moment Factory active tab label is white on the dark stage.
    expect(component.tabs).toMatchObject({
      activeText: "#ffffff"
    });
  });

  it("emits Moment Factory yellow-on-black colours and the Calibre font in the compiled variables", () => {
    const css = compileTheme(momentFactoryTheme);
    // Electric-yellow action + white text on the black stage.
    expect(css).toContain("--st-semantic-action-primary: #ffea00;");
    expect(css).toContain("--st-semantic-text-primary: #ffffff;");
    // Danger red and the white inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #e02424;");
    expect(css).toContain("--st-semantic-surface-inverse: #ffffff;");
    // The black stage is the default surface (dark-first).
    expect(css).toContain("--st-semantic-surface-default: #000000;");
    // Moment Factory's proprietary webfont (the "Calibre" brand sans).
    expect(css).toContain("Calibre");
  });
});
