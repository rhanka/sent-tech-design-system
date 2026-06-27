import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { thalesTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("thalesTheme", () => {
  it("maps the Thales brand identity into the Sentropic contract", () => {
    expect(thalesTheme).toMatchObject({
      id: "thales",
      label: "Thales",
      mode: "light"
    });

    const css = compileTheme(thalesTheme);
    expect(css).toContain('[data-st-theme="thales"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Thales form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = thalesTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f4f9fb"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#0816a1"
    });
  });

  it("emits Thales brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(thalesTheme);
    // Vivid action blue primary + near-black body text.
    expect(css).toContain("--st-semantic-action-primary: #0816a1;");
    expect(css).toContain("--st-semantic-text-primary: #252526;");
    // Error red danger and navy dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #e32700;");
    expect(css).toContain("--st-semantic-surface-inverse: #00005c;");
    // Thales digital fonts: Inter (body) and Saira (display titles).
    expect(css).toContain("Inter");
    expect(css).toContain("Saira");
  });
});
