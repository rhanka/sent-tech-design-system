import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { worldlineTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("worldlineTheme", () => {
  it("maps the Worldline identity into the Sentropic contract", () => {
    expect(worldlineTheme).toMatchObject({
      id: "worldline",
      label: "Worldline",
      mode: "light"
    });

    const css = compileTheme(worldlineTheme);
    expect(css).toContain('[data-st-theme="worldline"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Worldline form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = worldlineTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f4f7f9"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#0066a1"
    });
  });

  it("emits Worldline brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(worldlineTheme);
    // Worldline blue action + dark-navy text.
    expect(css).toContain("--st-semantic-action-primary: #0066a1;");
    expect(css).toContain("--st-semantic-text-primary: #0c2233;");
    // Derived danger red and Worldline dark-blue inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #cc1a2b;");
    expect(css).toContain("--st-semantic-surface-inverse: #003a5c;");
    // Worldline neutral corporate sans stack.
    expect(css).toContain("system-ui");
  });
});
