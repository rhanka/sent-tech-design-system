import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { deepseekTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("deepseekTheme", () => {
  it("maps DeepSeek identity into the Sentropic contract", () => {
    expect(deepseekTheme).toMatchObject({
      id: "deepseek",
      label: "DeepSeek",
      mode: "light"
    });

    const css = compileTheme(deepseekTheme);
    expect(css).toContain('[data-st-theme="deepseek"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // DeepSeek form fields are boxed & rounded (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = deepseekTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f1f3f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#3964fe"
    });
  });

  it("emits DeepSeek brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(deepseekTheme);
    // DeepSeek brand blue action + bluish primary text.
    expect(css).toContain("--st-semantic-action-primary: #3964fe;");
    expect(css).toContain("--st-semantic-text-primary: #0f1115;");
    // DeepSeek error red and dark inverse canvas.
    expect(css).toContain("--st-semantic-action-danger: #ec1313;");
    expect(css).toContain("--st-semantic-surface-inverse: #151517;");
    // DeepSeek font family (Inter UI + monospace stack).
    expect(css).toContain("Inter");
    expect(css).toContain("monospace");
  });
});
