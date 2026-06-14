import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { aldoTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("aldoTheme", () => {
  it("maps ALDO identity into the Sentropic contract", () => {
    expect(aldoTheme).toMatchObject({
      id: "aldo",
      label: "ALDO",
      mode: "light"
    });

    const css = compileTheme(aldoTheme);
    expect(css).toContain('[data-st-theme="aldo"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // ALDO form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = aldoTheme.tokens.component as ThemeComponent;
    // ALDO controls are white-filled with a faint grey hover (#f7f7f7).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f7f7f7"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // ALDO active tab label is dark ink.
    expect(component.tabs).toMatchObject({
      activeText: "#111111"
    });
  });

  it("emits ALDO black-on-white colours, the signature yellow, and the grotesque font", () => {
    const css = compileTheme(aldoTheme);
    // ALDO black action + dark-ink text + black inverse surface.
    expect(css).toContain("--st-semantic-action-primary: #000000;");
    expect(css).toContain("--st-semantic-text-primary: #111111;");
    expect(css).toContain("--st-semantic-surface-inverse: #000000;");
    // Restrained danger red (à confirmer).
    expect(css).toContain("--st-semantic-action-danger: #c0202e;");
    // The signature bright yellow is the distinguishing accent — assert it
    // reaches the compiled CSS (secondary action surface + data category).
    expect(css).toContain("--st-semantic-action-secondary: #ffef71;");
    expect(css).toContain("#ffef71");
    // ALDO webfont family (the Helvetica-Neue grotesque stack).
    expect(css).toContain("Helvetica Neue");
  });
});
