import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { writerTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("writerTheme", () => {
  it("maps Writer identity into the Sentropic contract", () => {
    expect(writerTheme).toMatchObject({
      id: "writer",
      label: "Writer",
      mode: "light"
    });

    const css = compileTheme(writerTheme);
    expect(css).toContain('[data-st-theme="writer"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Writer form fields are boxed & outlined, not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = writerTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#eff0f2"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#5551ff"
    });
  });

  it("emits Writer brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(writerTheme);
    // Writer Indigo action + near-black grey text.
    expect(css).toContain("--st-semantic-action-primary: #5551ff;");
    expect(css).toContain("--st-semantic-text-primary: #151515;");
    // Danger red and dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #d92d20;");
    expect(css).toContain("--st-semantic-surface-inverse: #151515;");
    // Writer font families (Poppins UI, PP Formula Condensed display, SF Mono).
    expect(css).toContain("Poppins");
    expect(css).toContain("PP Formula Condensed");
    expect(css).toContain("SF Mono");
  });
});
