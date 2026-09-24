import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { euronextTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("euronextTheme", () => {
  it("maps the Euronext brand identity into the Sentropic contract", () => {
    expect(euronextTheme).toMatchObject({
      id: "euronext",
      label: "Euronext",
      mode: "light"
    });

    const css = compileTheme(euronextTheme);
    expect(css).toContain('[data-st-theme="euronext"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Euronext form fields are filled-underline (brand search input draws a
    // single bottom hairline), not boxed.
    expect(css).toContain("--st-field-style: filled-underline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = euronextTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f2f4f6"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "filled-underline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#252631"
    });
  });

  it("emits Euronext brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(euronextTheme);
    // Brand teal action + primary-dark ink text.
    expect(css).toContain("--st-semantic-action-primary: #008d7f;");
    expect(css).toContain("--st-semantic-text-primary: #252631;");
    // Error red danger and primary-dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #fe4d6a;");
    expect(css).toContain("--st-semantic-surface-inverse: #252631;");
    // Euronext brand font family (Inter, the body typeface) and the
    // measured monospace stack.
    expect(css).toContain("Inter");
    expect(css).toContain("SFMono-Regular");
    expect(css).toContain("Menlo");
  });
});
