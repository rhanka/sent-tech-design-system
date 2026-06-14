import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { stmTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("stmTheme", () => {
  it("maps STM identity into the Sentropic contract", () => {
    expect(stmTheme).toMatchObject({
      id: "stm",
      label: "STM",
      mode: "light"
    });

    const css = compileTheme(stmTheme);
    expect(css).toContain('[data-st-theme="stm"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // STM form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = stmTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#ebebeb"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#009ee0"
    });
  });

  it("emits STM brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(stmTheme);
    // STM signature blue action + measured ink text.
    expect(css).toContain("--st-semantic-action-primary: #009ee0;");
    expect(css).toContain("--st-semantic-text-primary: #3c3c3c;");
    // Danger red and inverse dark ink surface.
    expect(css).toContain("--st-semantic-action-danger: #d0021b;");
    expect(css).toContain("--st-semantic-surface-inverse: #3c3c3c;");
    // STM transit sans (Helvetica Neue stack).
    expect(css).toContain("Helvetica Neue");
  });
});
