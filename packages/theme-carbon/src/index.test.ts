import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { carbonTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("carbonTheme", () => {
  it("maps IBM Carbon identity into the Sentropic contract", () => {
    expect(carbonTheme).toMatchObject({
      id: "carbon",
      label: "IBM Carbon",
      mode: "light"
    });

    const css = compileTheme(carbonTheme);
    expect(css).toContain('[data-st-theme="carbon"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    expect(css).toContain("--st-field-style: filled-underline;");
    expect(css).toContain("--st-component-pagination-activeText");
    expect(css).toContain("--st-component-pagination-activeBorderWidth");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = carbonTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBorder: "#8d8d8d",
      hoverBackground: "#f4f4f4"
    });
    expect(component.pagination).toMatchObject({
      activeText: "#525252",
      activeBackground: "transparent"
    });
  });
});
