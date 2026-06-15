import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { dialogueTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("dialogueTheme", () => {
  it("maps Dialogue identity into the Sentropic contract", () => {
    expect(dialogueTheme).toMatchObject({
      id: "dialogue",
      label: "Dialogue",
      mode: "light"
    });

    const css = compileTheme(dialogueTheme);
    expect(css).toContain('[data-st-theme="dialogue"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Dialogue form fields are filled-underline (white fill, blue focus rule).
    expect(css).toContain("--st-field-style: filled-underline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = dialogueTheme.tokens.component as ThemeComponent;
    // Dialogue controls sit on white surfaces with a faint lavender page hover
    // (surface.default #ffffff / surface.subtle #f9f7fa).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f9f7fa"
    });
    // The primary button IS the Dialogue coral CTA with cream text, softly
    // rounded (5px shape radius).
    expect(component.button).toMatchObject({
      primaryBackground: "#dd7146",
      primaryText: "#ffefe2",
      radius: "5px"
    });
    // Dialogue form fields are filled-underline white fills.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "filled-underline",
      fillBg: "#ffffff"
    });
    // Dialogue active tab label is the brand coral.
    expect(component.tabs).toMatchObject({
      activeText: "#dd7146"
    });
  });

  it("emits Dialogue coral + soft-black ink and Roboto/Poynter in the compiled variables", () => {
    const css = compileTheme(dialogueTheme);
    // THE Dialogue coral action + the soft near-black ink (not pure black).
    expect(css).toContain("--st-semantic-action-primary: #dd7146;");
    expect(css).toContain("--st-semantic-text-primary: #212120;");
    // Danger red and the soft-black (#212120) inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #c0392b;");
    expect(css).toContain("--st-semantic-surface-inverse: #212120;");
    // Dialogue's body sans (Roboto) and serif display face (Poynter Oldstyle).
    expect(css).toContain("Roboto");
    expect(css).toContain("Poynter Oldstyle Disp Semi Bd");
  });
});
