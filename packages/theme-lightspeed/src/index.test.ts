import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { lightspeedTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("lightspeedTheme", () => {
  it("maps Lightspeed identity into the Sentropic contract", () => {
    expect(lightspeedTheme).toMatchObject({
      id: "lightspeed",
      label: "Lightspeed",
      mode: "light"
    });

    const css = compileTheme(lightspeedTheme);
    expect(css).toContain('[data-st-theme="lightspeed"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Lightspeed form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = lightspeedTheme.tokens.component as ThemeComponent;
    // Lightspeed controls are white-filled with a faint warm grey hover (#f6f4f3).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f6f4f3"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Lightspeed active tab label is near-black.
    expect(component.tabs).toMatchObject({
      activeText: "#000000"
    });
  });

  it("emits Lightspeed bold-red colours and the ls webfont in the compiled variables", () => {
    const css = compileTheme(lightspeedTheme);
    // Lightspeed red action + near-black text (the bold-red identity).
    expect(css).toContain("--st-semantic-action-primary: #e81c1c;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    // Danger reuses the brand red; charcoal warm inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #e81c1c;");
    expect(css).toContain("--st-semantic-surface-inverse: #191513;");
    // Lightspeed webfont aliases (lsRegular body + lsBold display).
    expect(css).toContain("lsRegular");
    expect(css).toContain("lsBold");
  });
});
