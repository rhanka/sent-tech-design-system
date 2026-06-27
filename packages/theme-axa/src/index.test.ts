import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { axaTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("axaTheme", () => {
  it("maps the AXA identity into the Sentropic contract", () => {
    expect(axaTheme).toMatchObject({
      id: "axa",
      label: "AXA",
      mode: "light"
    });

    const css = compileTheme(axaTheme);
    expect(css).toContain('[data-st-theme="axa"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // AXA form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = axaTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f4f4f8"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#00008f"
    });
  });

  it("emits AXA brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(axaTheme);
    // AXA blue action + near-black text.
    expect(css).toContain("--st-semantic-action-primary: #00008f;");
    expect(css).toContain("--st-semantic-text-primary: #16161d;");
    // AXA red danger and AXA-blue inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #ff1721;");
    expect(css).toContain("--st-semantic-surface-inverse: #00008f;");
    // AXA corporate typeface (Source Sans Pro).
    expect(css).toContain("Source Sans Pro");
  });
});
