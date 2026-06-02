import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { dsfrTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("dsfrTheme", () => {
  it("maps DSFR identity into the Sentropic contract", () => {
    expect(dsfrTheme).toMatchObject({
      id: "dsfr",
      label: "DSFR",
      mode: "light"
    });

    const css = compileTheme(dsfrTheme);
    expect(css).toContain('[data-st-theme="dsfr"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    expect(css).toContain("--st-field-style: filled-underline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = dsfrTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBorder: "#666666",
      hoverBackground: "#f6f6f6"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "filled-underline",
      fillBg: "#eeeeee",
      borderTop: "none",
      borderBottom: "none",
      borderLeft: "none",
      borderRight: "none",
      underline: "inset 0 -1px 0 0 #3a3a3a"
    });
    expect((component.selection as unknown as { toggleTrackWidth?: string; toggleTrackHeight?: string; toggleThumbSize?: string })).toMatchObject({
      toggleTrackWidth: "2.25rem",
      toggleTrackHeight: "1.25rem",
      toggleThumbSize: "1rem"
    });
    expect(component.tabs).toMatchObject({
      activeBorderBottomWidth: "0",
      activeBorderTopWidth: "0",
      tabPaddingBlock: "0.5rem",
      tabPaddingInline: "1rem",
      tabFontSize: "1rem",
      activeShadow: "inset 0 1px 0 0 #000091",
      inactiveBackground: "#e3e3fd"
    });
  });

  it("emits phase2 anatomy variables used for rollout controls", () => {
    const css = compileTheme(dsfrTheme);
    const component = dsfrTheme.tokens.component as ThemeComponent;

    expect(css).toContain("--st-component-control-anatomy-field-style: filled-underline;");
    expect(css).toContain("--st-component-control-anatomy-field-fillBg: #eeeeee;");
    expect(css).toContain("--st-component-control-anatomy-field-borderTop: none;");
    expect(css).toContain("--st-component-control-anatomy-field-underline: inset 0 -1px 0 0 #3a3a3a;");
    expect(css).toContain("--st-component-control-anatomy-states-focus-border: #000091;");
    expect(css).toContain("--st-component-tabs-tabFontSize: 1rem;");
    expect(css).toContain("--st-component-link-anatomy-states-hover-decoration: underline;");
    expect(component.tabs).toMatchObject({
      activeText: "#000091",
      activeBackground: "#ffffff"
    });
  });
});
