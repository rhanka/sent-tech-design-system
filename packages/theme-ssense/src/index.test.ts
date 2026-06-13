import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { ssenseTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("ssenseTheme", () => {
  it("maps SSENSE identity into the Sentropic contract", () => {
    expect(ssenseTheme).toMatchObject({
      id: "ssense",
      label: "SSENSE",
      mode: "light"
    });

    const css = compileTheme(ssenseTheme);
    expect(css).toContain('[data-st-theme="ssense"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // SSENSE form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = ssenseTheme.tokens.component as ThemeComponent;
    // SSENSE controls are white-filled with a faint grey hover (#fbfbfb).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#fbfbfb"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // SSENSE active tab label is pure black.
    expect(component.tabs).toMatchObject({
      activeText: "#000000"
    });
  });

  it("emits SSENSE monochrome colours and the grotesque font in the compiled variables", () => {
    const css = compileTheme(ssenseTheme);
    // SSENSE black action + black text (the monochrome identity).
    expect(css).toContain("--st-semantic-action-primary: #000000;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Restrained danger red (à confirmer) and black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #c0202e;");
    expect(css).toContain("--st-semantic-surface-inverse: #000000;");
    // SSENSE webfont aliases (the interFont grotesque + regularFont).
    expect(css).toContain("interFont");
    expect(css).toContain("regularFont");
  });
});
