import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { fireworksTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("fireworksTheme", () => {
  it("maps Fireworks AI identity into the Sentropic contract", () => {
    expect(fireworksTheme).toMatchObject({
      id: "fireworks",
      label: "Fireworks AI",
      mode: "dark"
    });

    const css = compileTheme(fireworksTheme);
    expect(css).toContain('[data-st-theme="fireworks"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Fireworks form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = fireworksTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      // Dark app stage (--background) + neutrals-900 subtle/hover surface.
      background: "#101113",
      hoverBackground: "#16181d"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#1a1a1f"
    });
    expect(component.tabs).toMatchObject({
      // Fireworks selected tab label = light brand purple on dark.
      activeText: "#9d72fe"
    });
  });

  it("emits Fireworks brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(fireworksTheme);
    // The Fireworks Purple primary action + off-white primary text.
    expect(css).toContain("--st-semantic-action-primary: #6726fe;");
    expect(css).toContain("--st-semantic-text-primary: #f2f2f2;");
    // Measured red danger + off-white inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #f14539;");
    expect(css).toContain("--st-semantic-surface-inverse: #f2f2f2;");
    // Fireworks brand typefaces (Aspekta UI + Favorit display).
    expect(css).toContain("Aspekta");
    expect(css).toContain("Favorit");
  });
});
