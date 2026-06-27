import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { saintGobainTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("saintGobainTheme", () => {
  it("maps the Saint-Gobain brand identity into the Sentropic contract", () => {
    expect(saintGobainTheme).toMatchObject({
      id: "saint-gobain",
      label: "Saint-Gobain",
      mode: "light"
    });

    const css = compileTheme(saintGobainTheme);
    expect(css).toContain('[data-st-theme="saint-gobain"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Saint-Gobain form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = saintGobainTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f4f6f9"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#17428C"
    });
  });

  it("emits Saint-Gobain brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(saintGobainTheme);
    // Brand blue action + brand slate text.
    expect(css).toContain("--st-semantic-action-primary: #17428C;");
    expect(css).toContain("--st-semantic-text-primary: #1c2430;");
    // Brand red danger and dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #D62A29;");
    expect(css).toContain("--st-semantic-surface-inverse: #1c2430;");
    // Saint-Gobain font family (Poppins, approximating the brand wordmark).
    expect(css).toContain("Poppins");
  });
});
