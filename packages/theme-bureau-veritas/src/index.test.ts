import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { bureauVeritasTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("bureauVeritasTheme", () => {
  it("maps the Bureau Veritas brand identity into the Sentropic contract", () => {
    expect(bureauVeritasTheme).toMatchObject({
      id: "bureau-veritas",
      label: "Bureau Veritas",
      mode: "light"
    });

    const css = compileTheme(bureauVeritasTheme);
    expect(css).toContain('[data-st-theme="bureau-veritas"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Bureau Veritas form fields are underlined (filled-underline), not boxed.
    expect(css).toContain("--st-field-style: filled-underline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = bureauVeritasTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#eaeaea"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "filled-underline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#00049e"
    });
  });

  it("emits Bureau Veritas brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(bureauVeritasTheme);
    // Brand deep-blue action + near-black body text.
    expect(css).toContain("--st-semantic-action-primary: #00049e;");
    expect(css).toContain("--st-semantic-text-primary: #333333;");
    // Derived error red (brand `red` #ff0000, 1 stop-rule step) on danger,
    // feedback-error and failed roles; brand-blue inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #e60000;");
    expect(css).toContain("--st-semantic-feedback-error: #e60000;");
    expect(css).toContain("--st-semantic-status-failed: #e60000;");
    expect(css).toContain("--st-semantic-surface-inverse: #00049e;");
    // Native select chevron redrawn in the brand's measured grey.
    expect(css).toContain("fill='%23333333'");
    // Muted text kept on the brand's measured de-emphasized grey; buttons
    // carry the effective (overridden) line-height 0.9, not the 1.25 of the
    // display-face rule.
    expect(css).toContain("--st-semantic-text-muted: #808080;");
    expect(css).toContain("--st-foundation-typography-control-lineHeight: 0.9;");
    // Bureau Veritas brand font families (display, body, labels).
    expect(css).toContain("BureauVeritas-ExtBdUltraCond");
    expect(css).toContain("Source-Sans-RegularPro");
    expect(css).toContain("Source-Sans-BoldPro");
  });
});
