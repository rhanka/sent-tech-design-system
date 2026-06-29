import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { xaiTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("xaiTheme", () => {
  it("maps xAI (Grok) identity into the Sentropic contract", () => {
    expect(xaiTheme).toMatchObject({
      id: "xai",
      label: "xAI (Grok)",
      mode: "dark"
    });

    const css = compileTheme(xaiTheme);
    expect(css).toContain('[data-st-theme="xai"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // xAI / Grok form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = xaiTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      // Jet dark app surface + umbra subtle/hover (x.ai --background / --background-hover).
      background: "#0a0a0a",
      hoverBackground: "#1f2228"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#1f2228"
    });
    expect(component.tabs).toMatchObject({
      // xAI selected tab label = monochrome white on dark.
      activeText: "#ffffff"
    });
  });

  it("emits xAI brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(xaiTheme);
    // Iconic inverted white primary action + off-white (dove) primary text.
    expect(css).toContain("--st-semantic-action-primary: #ffffff;");
    expect(css).toContain("--st-semantic-text-primary: #d5d9e2;");
    // Dark-mode danger red and the warm cream (ivory) inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #e66565;");
    expect(css).toContain("--st-semantic-surface-inverse: #f9f8f6;");
    // xAI brand typeface (Universal Sans) + Geist Mono code voice.
    expect(css).toContain("universalSans");
    expect(css).toContain("Geist Mono");
  });
});
