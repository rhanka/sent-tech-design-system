import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { bolloreTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("bolloreTheme", () => {
  it("maps the Bolloré SE brand identity into the Sentropic contract", () => {
    expect(bolloreTheme).toMatchObject({
      id: "bollore",
      label: "Bolloré",
      mode: "light"
    });

    const css = compileTheme(bolloreTheme);
    expect(css).toContain('[data-st-theme="bollore"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Bolloré form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = bolloreTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f9f9f9"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#007bc0"
    });
  });

  it("emits Bolloré SE brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(bolloreTheme);
    // Brand action blue + body-text grey.
    expect(css).toContain("--st-semantic-action-primary: #007bc0;");
    expect(css).toContain("--st-semantic-text-primary: #585857;");
    // Measured key-figure red danger and painted dark-grey inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #ce1a37;");
    expect(css).toContain("--st-semantic-surface-inverse: #58585a;");
    // Bolloré brand font family (Gotham UI + display).
    expect(css).toContain("Gotham");
  });
});
