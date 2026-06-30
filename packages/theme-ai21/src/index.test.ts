import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { ai21Theme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("ai21Theme", () => {
  it("maps AI21 Labs identity into the Sentropic contract", () => {
    expect(ai21Theme).toMatchObject({
      id: "ai21",
      label: "AI21 Labs",
      mode: "light"
    });

    const css = compileTheme(ai21Theme);
    expect(css).toContain('[data-st-theme="ai21"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // AI21 form fields are underlined (filled-underline), not boxed outlines.
    expect(css).toContain("--st-field-style: filled-underline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = ai21Theme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f8f7fc"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "filled-underline",
      fillBg: "transparent"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#e61e93"
    });
  });

  it("emits AI21 brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(ai21Theme);
    // AI21 brand pink action + purple-tinted near-black text.
    expect(css).toContain("--st-semantic-action-primary: #e61e93;");
    expect(css).toContain("--st-semantic-text-primary: #141125;");
    // AI21 deep-crimson danger and deep purple-black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #ac043d;");
    expect(css).toContain("--st-semantic-surface-inverse: #0a071b;");
    // AI21 font families (Inter body, Polysans display, Aeonik Fono controls).
    expect(css).toContain("Inter");
    expect(css).toContain("Polysans");
    expect(css).toContain("Aeonik Fono");
  });
});
