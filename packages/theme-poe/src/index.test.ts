import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { poeTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("poeTheme", () => {
  it("maps Poe identity into the Sentropic contract", () => {
    expect(poeTheme).toMatchObject({
      id: "poe",
      label: "Poe",
      mode: "light"
    });

    const css = compileTheme(poeTheme);
    expect(css).toContain('[data-st-theme="poe"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Poe form fields are boxed & rounded (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = poeTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f6f6f8"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#5d5cde"
    });
  });

  it("emits Poe brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(poeTheme);
    // Poe violet action + near-black grey text.
    expect(css).toContain("--st-semantic-action-primary: #5d5cde;");
    expect(css).toContain("--st-semantic-text-primary: #0d0d0d;");
    // Poe danger pink-red and dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #d00e49;");
    expect(css).toContain("--st-semantic-surface-inverse: #0d0d0d;");
    // Poe ships the native system stack (no webfont) + SFMono for code.
    expect(css).toContain("system-ui");
    expect(css).toContain("SFMono-Regular");
  });
});
