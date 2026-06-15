import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { videotronTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("videotronTheme", () => {
  it("maps Vidéotron identity into the Sentropic contract", () => {
    expect(videotronTheme).toMatchObject({
      id: "videotron",
      label: "Vidéotron",
      mode: "light"
    });

    const css = compileTheme(videotronTheme);
    expect(css).toContain('[data-st-theme="videotron"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Vidéotron form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = videotronTheme.tokens.component as ThemeComponent;
    // Vidéotron controls sit on white surfaces with a faint warm grey page hover
    // (surface.default #ffffff / surface.subtle #f2f2f0).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f2f2f0"
    });
    // The primary button IS the iconic Vidéotron yellow CTA with charcoal label.
    // The derived component button radius follows the measured control radius
    // (radius.md 4px — the --bf-border-radius-small token).
    expect(component.button).toMatchObject({
      primaryBackground: "#ffd200",
      primaryText: "#2a2a27",
      radius: "4px"
    });
    // Vidéotron form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Vidéotron active tab label is the charcoal ink.
    expect(component.tabs).toMatchObject({
      activeText: "#2a2a27"
    });
  });

  it("emits Vidéotron yellow action + charcoal ink and Urbanist/Nunito Sans in the compiled variables", () => {
    const css = compileTheme(videotronTheme);
    // THE Vidéotron yellow action + the charcoal ink.
    expect(css).toContain("--st-semantic-action-primary: #ffd200;");
    expect(css).toContain("--st-semantic-text-primary: #2a2a27;");
    // Measured warm danger (orange-brown, not red) and the charcoal reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #cc6002;");
    expect(css).toContain("--st-semantic-surface-inverse: #2a2a27;");
    // Vidéotron's measured brand faces.
    expect(css).toContain("Urbanist");
    expect(css).toContain("Nunito Sans");
  });
});
