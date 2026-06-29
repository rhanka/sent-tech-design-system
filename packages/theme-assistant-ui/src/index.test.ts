import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { assistantUiTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("assistantUiTheme", () => {
  it("maps the assistant-ui (shadcn/Radix) identity into the Sentropic contract", () => {
    expect(assistantUiTheme).toMatchObject({
      id: "assistant-ui",
      label: "assistant-ui",
      mode: "light"
    });

    const css = compileTheme(assistantUiTheme);
    expect(css).toContain('[data-st-theme="assistant-ui"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // shadcn/assistant-ui inputs are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = assistantUiTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f4f4f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#18181b"
    });
  });

  it("emits assistant-ui brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(assistantUiTheme);
    // Dark zinc primary action + near-black zinc foreground text.
    expect(css).toContain("--st-semantic-action-primary: #18181b;");
    expect(css).toContain("--st-semantic-text-primary: #09090b;");
    // shadcn destructive red and dark zinc inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #e7000b;");
    expect(css).toContain("--st-semantic-surface-inverse: #18181b;");
    // Geist font families (Geist sans + Geist Mono).
    expect(css).toContain("Geist");
    expect(css).toContain("Geist Mono");
  });
});
