import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { togetherTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("togetherTheme", () => {
  it("maps Together AI identity into the Sentropic contract", () => {
    expect(togetherTheme).toMatchObject({
      id: "together",
      label: "Together AI",
      mode: "light"
    });

    const css = compileTheme(togetherTheme);
    expect(css).toContain('[data-st-theme="together"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Together form fields are boxed & rounded (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = togetherTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f6fafd"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#0f6fff"
    });
  });

  it("emits Together brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(togetherTheme);
    // Together brand blue action + brand dark-blue text.
    expect(css).toContain("--st-semantic-action-primary: #0f6fff;");
    expect(css).toContain("--st-semantic-text-primary: #010120;");
    // Together brand red danger and dark-blue inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #dd464c;");
    expect(css).toContain("--st-semantic-surface-inverse: #010120;");
    // Together font families (The Future display/body, The Future Mono buttons).
    expect(css).toContain("The Future");
    expect(css).toContain("The Future Mono");
  });
});
