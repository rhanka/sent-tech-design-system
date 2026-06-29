import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { amazonTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("amazonTheme", () => {
  it("maps Amazon Cloudscape identity into the Sentropic contract", () => {
    expect(amazonTheme).toMatchObject({
      id: "amazon",
      label: "Amazon",
      mode: "light"
    });

    const css = compileTheme(amazonTheme);
    expect(css).toContain('[data-st-theme="amazon"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    // Cloudscape form fields are boxed & rounded (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = amazonTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f9f9fa"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#006ce0"
    });
  });

  it("emits Amazon brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(amazonTheme);
    // AWS Blue action + Cloudscape near-black body text.
    expect(css).toContain("--st-semantic-action-primary: #006ce0;");
    expect(css).toContain("--st-semantic-text-primary: #0f141a;");
    // Cloudscape error red and squid-ink dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #db0000;");
    expect(css).toContain("--st-semantic-surface-inverse: #232f3e;");
    // Amazon font names (Amazon Ember brand face, Open Sans fallback, Monaco mono).
    expect(css).toContain("Amazon Ember");
    expect(css).toContain("Open Sans");
    expect(css).toContain("Monaco");
  });
});
