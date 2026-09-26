import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { getlinkTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("getlinkTheme", () => {
  it("maps the Getlink brand identity into the Sentropic contract", () => {
    expect(getlinkTheme).toMatchObject({
      id: "getlink",
      label: "Getlink",
      mode: "light"
    });

    const css = compileTheme(getlinkTheme);
    expect(css).toContain('[data-st-theme="getlink"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Getlink form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = getlinkTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f5f5f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#00205b"
    });
  });

  it("emits Getlink brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(getlinkTheme);
    // Primary navy action + black body text.
    expect(css).toContain("--st-semantic-action-primary: #00205b;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Error red danger and deep navy inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #f03130;");
    expect(css).toContain("--st-semantic-surface-inverse: #000050;");
    // Getlink brand font families (Open Sans body, Outfit display).
    expect(css).toContain("Open Sans");
    expect(css).toContain("Outfit");
  });
});
