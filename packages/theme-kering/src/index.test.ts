import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { keringTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("keringTheme", () => {
  it("maps the Kering identity into the Sentropic contract", () => {
    expect(keringTheme).toMatchObject({
      id: "kering",
      label: "Kering",
      mode: "light"
    });

    const css = compileTheme(keringTheme);
    expect(css).toContain('[data-st-theme="kering"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Kering form fields are warm-filled squared boxes (filled-underline).
    expect(css).toContain("--st-field-style: filled-underline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = keringTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff", // surface.default
      hoverBackground: "#f8f2ed" // warm beige (surface.subtle, --beige-100)
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "filled-underline",
      fillBg: "#f8f2ed" // warm beige input fill
    });
    expect(component.tabs).toMatchObject({
      activeText: "#000000" // black ink (--black-pure)
    });
  });

  it("emits Kering brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(keringTheme);
    // Black primary action + primary text (--black-pure / --text-color).
    expect(css).toContain("--st-semantic-action-primary: #000000;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Kering error red (--red-400) and black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #af0505;");
    expect(css).toContain("--st-semantic-surface-inverse: #000000;");
    // Kering proprietary typeface (Akzidenz-Grotesk Std Ext) + grotesque fallback.
    expect(css).toContain("Akzidenz-Grotesk Std Ext");
    expect(css).toContain("Helvetica");
  });
});
