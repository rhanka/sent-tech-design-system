import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { ubisoftTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("ubisoftTheme", () => {
  it("maps Ubisoft (UDS) identity into the Sentropic contract", () => {
    expect(ubisoftTheme).toMatchObject({
      id: "ubisoft",
      label: "Ubisoft",
      mode: "dark"
    });

    const css = compileTheme(ubisoftTheme);
    expect(css).toContain('[data-st-theme="ubisoft"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // UDS form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = ubisoftTheme.tokens.component as ThemeComponent;
    // UDS controls sit on the dark stage: control surface is #0d0d0d with a
    // subtle-surface hover (#1f1f1f). The brand blue is the *action* accent,
    // asserted via the compiled --st-semantic-action-primary below.
    expect(component.control).toMatchObject({
      background: "#0d0d0d",
      hoverBackground: "#1f1f1f"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#1f1f1f"
    });
    // UDS active tab label is the near-white heading ink.
    expect(component.tabs).toMatchObject({
      activeText: "#f9f9f9"
    });
  });

  it("emits Ubisoft blue-on-black colours and the brand fonts in the compiled variables", () => {
    const css = compileTheme(ubisoftTheme);
    // Ubisoft blue action + near-white heading text on the dark stage.
    expect(css).toContain("--st-semantic-action-primary: #006ef5;");
    expect(css).toContain("--st-semantic-text-primary: #f9f9f9;");
    // UDS negative (danger) red and the white inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #cc2828;");
    expect(css).toContain("--st-semantic-surface-inverse: #ffffff;");
    // The dark-first stage surface (#0d0d0d).
    expect(css).toContain("--st-semantic-surface-default: #0d0d0d;");
    // Ubisoft brand fonts (Ubisoft Sans for display, Open Sans for body).
    expect(css).toContain("Ubisoft Sans");
    expect(css).toContain("Open Sans");
  });
});
