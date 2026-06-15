import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { workleapTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("workleapTheme", () => {
  it("maps Workleap identity into the Sentropic contract", () => {
    expect(workleapTheme).toMatchObject({
      id: "workleap",
      label: "Workleap",
      mode: "light"
    });

    const css = compileTheme(workleapTheme);
    expect(css).toContain('[data-st-theme="workleap"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Workleap form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = workleapTheme.tokens.component as ThemeComponent;
    // Workleap controls sit on white surfaces with a faint cream page hover
    // (surface.default #ffffff / surface.subtle #F9F8F6).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#F9F8F6"
    });
    // The primary button IS the iconic Workleap electric-blue CTA. The derived
    // component button radius follows the measured control radius (radius.md 8px).
    expect(component.button).toMatchObject({
      primaryBackground: "#2545FF",
      primaryText: "#ffffff",
      radius: "8px"
    });
    // Workleap form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Workleap active tab label is the brand electric blue.
    expect(component.tabs).toMatchObject({
      activeText: "#2545FF"
    });
  });

  it("emits Workleap electric blue + near-black ink and Inter in the compiled variables", () => {
    const css = compileTheme(workleapTheme);
    // THE Workleap electric-blue action + the near-black ink.
    expect(css).toContain("--st-semantic-action-primary: #2545FF;");
    expect(css).toContain("--st-semantic-text-primary: #171417;");
    // Danger red and the deep-navy reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #d72020;");
    expect(css).toContain("--st-semantic-surface-inverse: #0C1754;");
    // Workleap's brand face (Inter).
    expect(css).toContain("Inter");
  });
});
