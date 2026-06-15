import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { hopperTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("hopperTheme", () => {
  it("maps Hopper identity into the Sentropic contract", () => {
    expect(hopperTheme).toMatchObject({
      id: "hopper",
      label: "Hopper",
      mode: "light"
    });

    const css = compileTheme(hopperTheme);
    expect(css).toContain('[data-st-theme="hopper"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Hopper form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = hopperTheme.tokens.component as ThemeComponent;
    // Hopper controls are white-filled with a faint grey hover (#f5f5f5).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f5f5f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Hopper active tab label is near-black.
    expect(component.tabs).toMatchObject({
      activeText: "#111111"
    });
  });

  it("emits Hopper coral-brand colours and the Proxima Nova font in the compiled variables", () => {
    const css = compileTheme(hopperTheme);
    // Hopper coral action + near-black ink (the playful coral identity).
    expect(css).toContain("--st-semantic-action-primary: #f05754;");
    expect(css).toContain("--st-semantic-text-primary: #111111;");
    // Danger uses the measured red; charcoal warm inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #d72021;");
    expect(css).toContain("--st-semantic-surface-inverse: #232323;");
    // Hopper brand typeface.
    expect(css).toContain("Proxima Nova");
  });
});
