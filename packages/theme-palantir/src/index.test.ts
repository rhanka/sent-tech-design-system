import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { palantirTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("palantirTheme", () => {
  it("maps Palantir Blueprint identity into the Sentropic contract", () => {
    expect(palantirTheme).toMatchObject({
      id: "palantir",
      label: "Palantir",
      mode: "dark"
    });

    const css = compileTheme(palantirTheme);
    expect(css).toContain('[data-st-theme="palantir"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Blueprint form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = palantirTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      // Dark app surface + dark panel hover (Blueprint $dark-gray1 / $dark-gray2).
      background: "#1c2127",
      hoverBackground: "#252a31"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#252a31"
    });
    expect(component.tabs).toMatchObject({
      // Blueprint selected tab label = lighter intent blue on dark ($blue4).
      activeText: "#4c90f0"
    });
  });

  it("emits Blueprint brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(palantirTheme);
    // Intent-primary blue action + Blueprint dark text colour.
    expect(css).toContain("--st-semantic-action-primary: #2d72d2;");
    expect(css).toContain("--st-semantic-text-primary: #f6f7f9;");
    // Intent-danger red and the light inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #cd4246;");
    expect(css).toContain("--st-semantic-surface-inverse: #f6f7f9;");
    // Blueprint uses the platform system font stack (no custom typeface) + monospace.
    expect(css).toContain("BlinkMacSystemFont");
    expect(css).toContain("Segoe UI");
    expect(css).toContain("monospace");
  });
});
