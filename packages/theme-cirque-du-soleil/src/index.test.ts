import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { cirqueDuSoleilTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("cirqueDuSoleilTheme", () => {
  it("maps Cirque du Soleil identity into the Sentropic contract", () => {
    expect(cirqueDuSoleilTheme).toMatchObject({
      id: "cirque-du-soleil",
      label: "Cirque du Soleil",
      mode: "dark"
    });

    const css = compileTheme(cirqueDuSoleilTheme);
    expect(css).toContain('[data-st-theme="cirque-du-soleil"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Cirque form fields are dark-filled with a thin bottom underline.
    expect(css).toContain("--st-field-style: filled-underline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = cirqueDuSoleilTheme.tokens.component as ThemeComponent;
    // Dark-first: the input control sits on the black stage (#000000) and lifts
    // to night-sky (#191a1a) on hover.
    expect(component.control).toMatchObject({
      background: "#000000",
      hoverBackground: "#191a1a"
    });
    // The primary BUTTON is the glowing gold CTA (#dca85d), black text on gold.
    expect(component.button).toMatchObject({
      primaryBackground: "#dca85d",
      primaryText: "#000000"
    });
    // Cirque fields are dark-filled with a thin bottom underline.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "filled-underline",
      fillBg: "#191a1a"
    });
    // Cirque active tab label is the brand gold.
    expect(component.tabs).toMatchObject({
      activeText: "#dca85d"
    });
  });

  it("emits Cirque gold-on-black colours and the Cds Sans font in the compiled variables", () => {
    const css = compileTheme(cirqueDuSoleilTheme);
    // Cirque gold action + light-gold text on the dark stage.
    expect(css).toContain("--st-semantic-action-primary: #dca85d;");
    expect(css).toContain("--st-semantic-text-primary: #f2e7bb;");
    // Destructive red (--color-destructive) and the white inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #ec091a;");
    expect(css).toContain("--st-semantic-surface-inverse: #ffffff;");
    // The black stage is the default surface (dark-first).
    expect(css).toContain("--st-semantic-surface-default: #000000;");
    // Cirque's proprietary webfont (the "Cds Sans" brand sans).
    expect(css).toContain("Cds Sans");
  });
});
