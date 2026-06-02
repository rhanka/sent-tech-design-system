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
    expect(component.control.anatomy?.field).toMatchObject({
      style: "filled-underline",
      fillBg: "#f4f4f4",
      borderTop: "none",
      borderBottom: "1px solid #8d8d8d",
      borderLeft: "none",
      borderRight: "none",
      underline: "none"
    });
    expect(component.pagination).toMatchObject({
      activeText: "#525252",
      activeBackground: "transparent"
    });
    expect(component.tabs).toMatchObject({
      activeBorderBottomWidth: "1px",
      activeBorderTopWidth: "0",
      tabPaddingBlock: "0.75rem",
      tabPaddingInline: "0",
      tabFontSize: "0.875rem",
      activeShadow: "none",
      inactiveBackground: "transparent"
    });
  });

  it("emits phase2 anatomy variables used for rollout controls", () => {
    const css = compileTheme(carbonTheme);
    const component = carbonTheme.tokens.component as ThemeComponent;

    expect(css).toContain("--st-component-control-anatomy-field-style: filled-underline;");
    expect(css).toContain("--st-component-control-anatomy-field-fillBg: #f4f4f4;");
    expect(css).toContain("--st-component-control-anatomy-field-borderBottom: 1px solid #8d8d8d;");
    expect(css).toContain("--st-component-control-anatomy-states-focus-border: #0f62fe;");
    expect(css).toContain("--st-component-control-anatomy-field-focusShadow: inset 0 0 0 2px #0f62fe;");
    expect(css).toContain("--st-component-tabs-tabPaddingBlock: 0.75rem;");
    expect(css).toContain("--st-component-link-anatomy-states-hover-decoration: underline;");
    expect(component.tabs).toMatchObject({
      activeText: "#161616",
      activeBackground: "transparent"
    });
  });
});
