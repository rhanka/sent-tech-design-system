import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { societeGeneraleTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("societeGeneraleTheme", () => {
  it("maps the Société Générale identity into the Sentropic contract", () => {
    expect(societeGeneraleTheme).toMatchObject({
      id: "societe-generale",
      label: "Société Générale",
      mode: "light"
    });

    const css = compileTheme(societeGeneraleTheme);
    expect(css).toContain('[data-st-theme="societe-generale"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // SG form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = societeGeneraleTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f5f5f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#e9041e"
    });
  });

  it("emits Société Générale brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(societeGeneraleTheme);
    // Rouge SG action + SG-black text.
    expect(css).toContain("--st-semantic-action-primary: #e9041e;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Rouge SG danger and SG-black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #e9041e;");
    expect(css).toContain("--st-semantic-surface-inverse: #000000;");
    // SG neutral grotesque stack.
    expect(css).toContain("Helvetica Neue");
  });
});
