import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { amundiTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("amundiTheme", () => {
  it("maps the Amundi brand identity into the Sentropic contract", () => {
    expect(amundiTheme).toMatchObject({
      id: "amundi",
      label: "Amundi",
      mode: "light"
    });

    const css = compileTheme(amundiTheme);
    expect(css).toContain('[data-st-theme="amundi"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Amundi form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = amundiTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#faf8f8"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#001c4b"
    });
  });

  it("emits Amundi brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(amundiTheme);
    // Cerulean theme action + prussian body text.
    expect(css).toContain("--st-semantic-action-primary: #0294d1;");
    expect(css).toContain("--st-semantic-text-primary: #001c4b;");
    // Error red danger and prussian inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #dc2626;");
    expect(css).toContain("--st-semantic-surface-inverse: #001c4b;");
    // Amundi brand font family (Noto Sans, the `--awf-font-family`).
    expect(css).toContain("Noto Sans");
  });
});
