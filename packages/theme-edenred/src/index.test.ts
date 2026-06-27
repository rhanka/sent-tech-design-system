import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { edenredTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("edenredTheme", () => {
  it("maps the Edenred identity into the Sentropic contract", () => {
    expect(edenredTheme).toMatchObject({
      id: "edenred",
      label: "Edenred",
      mode: "light"
    });

    const css = compileTheme(edenredTheme);
    expect(css).toContain('[data-st-theme="edenred"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Edenred form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = edenredTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f7f6f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#f72717"
    });
  });

  it("emits Edenred brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(edenredTheme);
    // Edenred red action + near-black text.
    expect(css).toContain("--st-semantic-action-primary: #f72717;");
    expect(css).toContain("--st-semantic-text-primary: #1a1614;");
    // Edenred red danger and near-black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #f72717;");
    expect(css).toContain("--st-semantic-surface-inverse: #1a1614;");
    // Edenred brand typography (proprietary "Edenred" face + "Ubuntu" companion).
    expect(css).toContain("Edenred");
    expect(css).toContain("Ubuntu");
  });
});
