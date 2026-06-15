import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { ellioTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("ellioTheme", () => {
  it("maps the ELLIO identity into the Sentropic contract", () => {
    expect(ellioTheme).toMatchObject({
      id: "ellio",
      label: "Ellio",
      mode: "light"
    });

    const css = compileTheme(ellioTheme);
    expect(css).toContain('[data-st-theme="ellio"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // ELLIO form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = ellioTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f1f1f1"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#194f90"
    });
  });

  it("emits ELLIO brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(ellioTheme);
    // Ellio blue action + body ink.
    expect(css).toContain("--st-semantic-action-primary: #194f90;");
    expect(css).toContain("--st-semantic-text-primary: #333333;");
    // Ellio error red and brand-blue inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #ea384c;");
    expect(css).toContain("--st-semantic-surface-inverse: #194f90;");
    // ELLIO font family (Exo everywhere, served from Google Fonts).
    expect(css).toContain("Exo");
  });
});
