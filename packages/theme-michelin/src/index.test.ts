import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { michelinTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("michelinTheme", () => {
  it("maps the Michelin brand identity into the Sentropic contract", () => {
    expect(michelinTheme).toMatchObject({
      id: "michelin",
      label: "Michelin",
      mode: "light"
    });

    const css = compileTheme(michelinTheme);
    expect(css).toContain('[data-st-theme="michelin"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Michelin form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = michelinTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f2f2f2"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#27509b"
    });
  });

  it("emits Michelin brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(michelinTheme);
    // Michelin blue action + ink text.
    expect(css).toContain("--st-semantic-action-primary: #27509b;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    // Error red danger and deep navy inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #b71c1c;");
    expect(css).toContain("--st-semantic-surface-inverse: #00205b;");
    // Michelin brand font families (body + display).
    expect(css).toContain("Noto Sans");
    expect(css).toContain("Michelin Unit Titling");
  });
});
