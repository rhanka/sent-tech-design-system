import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { sidLeeTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("sidLeeTheme", () => {
  it("maps Sid Lee identity into the Sentropic contract", () => {
    expect(sidLeeTheme).toMatchObject({
      id: "sid-lee",
      label: "Sid Lee",
      mode: "light"
    });

    const css = compileTheme(sidLeeTheme);
    expect(css).toContain('[data-st-theme="sid-lee"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Sid Lee form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = sidLeeTheme.tokens.component as ThemeComponent;
    // Sid Lee controls are white-filled with a faint grey hover (#f5f5f5).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f5f5f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Sid Lee active tab label is ink (#1a1a1a).
    expect(component.tabs).toMatchObject({
      activeText: "#1a1a1a"
    });
    // Sid Lee buttons inherit foundation.radius.md (4px) — the gentle rounding.
    expect(component.button).toMatchObject({
      radius: "4px"
    });
  });

  it("emits Sid Lee bold-creative colours and the visuelt/serif fonts in the compiled variables", () => {
    const css = compileTheme(sidLeeTheme);
    // Sid Lee vivid orange-red brand action + ink text (the bold-creative identity).
    // (compileTheme preserves the source hex casing — emitted as #FF440B.)
    expect(css).toContain("--st-semantic-action-primary: #FF440B;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    // Measured danger red and the dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #dc3545;");
    expect(css).toContain("--st-semantic-surface-inverse: #191919;");
    // Sid Lee webfont aliases (the visuelt body sans + sang-bleu-kingdom serif).
    expect(css).toContain("visuelt");
    expect(css).toContain("sang-bleu-kingdom");
  });
});
