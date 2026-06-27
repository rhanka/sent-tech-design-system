import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { edfTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("edfTheme", () => {
  it("maps the EDF brand identity into the Sentropic contract", () => {
    expect(edfTheme).toMatchObject({
      id: "edf",
      label: "EDF",
      mode: "light"
    });

    const css = compileTheme(edfTheme);
    expect(css).toContain('[data-st-theme="edf"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // EDF form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = edfTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f5f6f9"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#FE5716"
    });
  });

  it("emits EDF brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(edfTheme);
    // Deep-blue primary action + brand slate text.
    expect(css).toContain("--st-semantic-action-primary: #10367A;");
    expect(css).toContain("--st-semantic-text-primary: #1b2236;");
    // Derived danger red and dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #d92d20;");
    expect(css).toContain("--st-semantic-surface-inverse: #1b2236;");
    // EDF font family (Open Sans proxy for the proprietary "Edf" typeface).
    expect(css).toContain("Open Sans");
  });
});
