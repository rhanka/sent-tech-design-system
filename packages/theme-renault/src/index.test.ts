import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { renaultTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("renaultTheme", () => {
  it("maps the Renault brand identity into the Sentropic contract", () => {
    expect(renaultTheme).toMatchObject({
      id: "renault",
      label: "Renault",
      mode: "light"
    });

    const css = compileTheme(renaultTheme);
    expect(css).toContain('[data-st-theme="renault"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Renault form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = renaultTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f5f5f3"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Active tab label is the anthracite (the yellow rides the underline only).
    expect(component.tabs).toMatchObject({
      activeText: "#191c1f"
    });
  });

  it("emits Renault brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(renaultTheme);
    // Renault Yellow primary action + anthracite corporate-black text.
    expect(css).toContain("--st-semantic-action-primary: #efdf00;");
    expect(css).toContain("--st-semantic-text-primary: #191c1f;");
    // Derived danger red and Renault black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #c62828;");
    expect(css).toContain("--st-semantic-surface-inverse: #000000;");
    // Renault custom typeface (NouvelR / "Renault Group" webfont).
    expect(css).toContain("NouvelR");
    expect(css).toContain("Renault Group");
  });
});
