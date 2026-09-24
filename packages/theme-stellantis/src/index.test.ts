import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { stellantisTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("stellantisTheme", () => {
  it("maps the Stellantis brand identity into the Sentropic contract", () => {
    expect(stellantisTheme).toMatchObject({
      id: "stellantis",
      label: "Stellantis",
      mode: "light"
    });

    const css = compileTheme(stellantisTheme);
    expect(css).toContain('[data-st-theme="stellantis"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Stellantis form fields are boxed (four equal 1px #d3d3d3 borders), not
    // filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = stellantisTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f0f0f0"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#243882"
    });
  });

  it("emits Stellantis brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(stellantisTheme);
    // Stellantis corporate blue action + brand body grey text.
    expect(css).toContain("--st-semantic-action-primary: #243882;");
    expect(css).toContain("--st-semantic-text-primary: #505050;");
    // Stop-rule danger and the measured anthracite inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #cc4c27;");
    expect(css).toContain("--st-semantic-surface-inverse: #282b34;");
    // Every measured brand hex reaching a semantic role.
    expect(css).toContain("--st-semantic-action-primaryHover: #1c2d65;");
    expect(css).toContain("--st-semantic-surface-subtle: #f0f0f0;");
    expect(css).toContain("--st-semantic-border-subtle: #d3d3d3;");
    expect(css).toContain("--st-semantic-text-secondary: #6a6a6a;");
    expect(css).toContain("--st-semantic-text-muted: #6d6d6d;");
    expect(css).toContain("--st-semantic-feedback-success: #006e6a;");
    expect(css).toContain("--st-semantic-feedback-warning: #c63a14;");
    expect(css).toContain("--st-semantic-surface-overlay: rgb(40 43 52 / 0.5);");
    // The brand accent utilities reaching the categorical data palette.
    expect(css).toContain("--st-semantic-data-category2: #e94e24;");
    expect(css).toContain("--st-semantic-data-category3: #43aaa0;");
    expect(css).toContain("--st-semantic-data-category5: #7b88b4;");
    expect(css).toContain("--st-semantic-data-category6: #a0d4cd;");
    // Every font family name present in the compiled output.
    expect(css).toContain("Encode Sans Condensed");
    expect(css).toContain("'Encode Sans', sans-serif");
    expect(css).toContain("SFMono-Regular");
  });
});
