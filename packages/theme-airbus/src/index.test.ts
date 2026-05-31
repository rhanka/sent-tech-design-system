import { compileTheme } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { airbusDarkTheme, airbusTheme, airbusThemes } from "./index.js";

describe("airbusTheme", () => {
  it("maps Airbus identity tokens into the Sentropic theme contract", () => {
    expect(airbusTheme).toMatchObject({
      id: "airbus",
      label: "Airbus",
      mode: "light"
    });

    const css = compileTheme(airbusTheme);
    expect(css).toContain('[data-st-theme="airbus"]');
    expect(css).toContain("--st-foundation-color-blue-60: #255fcc;");
    expect(css).toContain("--st-foundation-color-slate-90: #14171d;");
    expect(css).toContain("--st-semantic-action-primary: #00205b;");
    expect(css).toContain("--st-foundation-field-style: filled-underline;");
    expect(css).toContain("--st-foundation-focus-color: #255fcc;");
  });

  it("maps Airbus component anatomy beyond the pilot controls", () => {
    const css = compileTheme(airbusTheme);

    expect(css).toContain("--st-component-pagination-borderWidth: 0;");
    expect(css).toContain("--st-component-pagination-activeWeight: 700;");
    expect(css).toContain("--st-component-breadcrumb-fontSize: 0.875rem;");
    expect(css).toContain("--st-component-alert-accentWidth: 0.1875rem;");
    expect(css).toContain("--st-component-accordion-fontWeight: 700;");
    expect(css).toContain("--st-component-badge-infoBackground: #e5ecf7;");
    expect(css).toContain("--st-component-selection-choiceLabelLineHeight: 1.25rem;");
    expect(css).toContain("--st-component-selection-toggleTrackWidth: 2.5rem;");
  });

  it("exports a dark Airbus theme with dark semantic and component tokens", () => {
    expect(airbusThemes).toEqual([airbusTheme, airbusDarkTheme]);
    expect(airbusDarkTheme).toMatchObject({
      id: "airbus-dark",
      label: "Airbus Dark",
      mode: "dark"
    });

    const css = compileTheme(airbusDarkTheme);
    expect(css).toContain('[data-st-theme="airbus-dark"]');
    expect(css).toContain("--st-semantic-surface-default: #14171d;");
    expect(css).toContain("--st-semantic-text-primary: #eff1f4;");
    expect(css).toContain("--st-semantic-action-primary: #3cb7ff;");
    expect(css).toContain("--st-component-button-primaryBackground: #3cb7ff;");
    expect(css).toContain("--st-component-control-anatomy-field-fillBg: #3c4657;");
    expect(css).toContain("--st-component-tag-neutralBackground: #3c4657;");
  });
});
