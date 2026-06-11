import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { canadaTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("canadaTheme", () => {
  it("maps GC Design System identity into the Sentropic contract", () => {
    expect(canadaTheme).toMatchObject({
      id: "canada",
      label: "Government of Canada",
      mode: "light"
    });

    const css = compileTheme(canadaTheme);
    expect(css).toContain('[data-st-theme="canada"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // GCDS form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = canadaTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f2f2f2"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#1f497a"
    });
  });

  it("emits GC brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(canadaTheme);
    // Federal blue action + GC text.
    expect(css).toContain("--st-semantic-action-primary: #1f497a;");
    expect(css).toContain("--st-semantic-text-primary: #333333;");
    // GC danger red and inverse FIP blue.
    expect(css).toContain("--st-semantic-action-danger: #b3192e;");
    expect(css).toContain("--st-semantic-surface-inverse: #26374a;");
    // GCDS font families (Lato headings, Noto Sans body).
    expect(css).toContain("Noto Sans");
    expect(css).toContain("Lato");
  });
});
