import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { airbusDarkTheme, airbusTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("airbusTheme", () => {
  it("maps Airbus identity tokens into the Sentropic theme contract", () => {
    expect(airbusTheme).toMatchObject({
      id: "airbus",
      label: "Airbus",
      mode: "light"
    });

    const css = compileTheme(airbusTheme);
    expect(css).toContain('[data-st-theme="airbus"]');
    expect(css).toContain("--st-foundation-color-blue-60: #255fcc;");
    expect(css).toContain("--st-foundation-color-slate-90: #14171d;");
    expect(css).toContain("--st-semantic-action-primary: #00205b;");
    expect(css).toContain("--st-foundation-field-style: filled-underline;");
    expect(css).toContain("--st-foundation-focus-color: #255fcc;");
  });

  it("maps Airbus component anatomy beyond the initial pilot path", () => {
    const component = airbusTheme.tokens.component as ThemeComponent;

    expect(component.pagination).toMatchObject({
      activeBackground: "transparent",
      activeBorderWidth: "2px",
      activeText: "#14171d",
      activeWeight: "500",
      minSize: "2rem",
      fontSize: "0.875rem",
      lineHeight: "1.5rem"
    });

    expect(component.breadcrumb).toMatchObject({
      fontSize: "0.875rem",
      lineHeight: "1.5rem",
      currentWeight: "700"
    });

    expect(component.alert).toMatchObject({
      accentWidth: "0",
      paddingTop: "0.5rem",
      paddingLeft: "1.5rem",
      fontSize: "0.875rem",
      lineHeight: "1.25rem"
    });

    expect(component.accordion).toMatchObject({
      text: "#14171d",
      paddingBlock: "0.5rem",
      paddingInline: "1rem",
      fontSize: "1rem",
      fontWeight: "700",
      lineHeight: "1.5rem"
    });

    expect(component.badge).toMatchObject({
      radius: "1rem",
      paddingBlock: "0",
      paddingInline: "0.1875rem",
      fontSize: "0.875rem",
      lineHeight: "1rem",
      minHeight: "1rem",
      infoBackground: "#255fcc",
      infoText: "#ffffff"
    });

    expect(component.selection).toMatchObject({
      choiceLabelFontSize: "0.875rem",
      choiceLabelLineHeight: "1rem",
      choiceRadioLineHeight: "1rem",
      toggleTrackWidth: "3rem",
      toggleTrackHeight: "1.5rem",
      toggleThumbSize: "1.125rem",
      toggleTrackPadding: "0"
    });

    expect(component.tabs).toMatchObject({
      activeText: "#063b9e",
      activeBackground: "transparent",
      activeWeight: "700",
      tabPaddingBlock: "0.5rem",
      tabPaddingInline: "1rem",
      tabFontSize: "0.875rem",
      tabLineHeight: "1.5rem",
      activeBorderTopWidth: "0",
      activeBorderBottomWidth: "0",
      activeShadow: "inset 0 -1px 0 0 #00205b"
    });

    expect(component.search).toMatchObject({
      paddingBlock: "0.5rem",
      paddingInline: "2.5rem",
      paddingLeft: "2.25rem",
      paddingRight: "0.5rem",
      fontSize: "0.875rem",
      lineHeight: "1.25rem"
    });
    expect(component.field).toMatchObject({ maxWidth: "17.0625rem" });

    expect(component.card).toMatchObject({
      border: "#e0e3e9",
      shadow: "0 1px 4px 0 rgb(0 0 0 / 0.24)",
      anatomy: {
        states: {
          hover: {
            bg: "#f1f1f1"
          }
        }
      }
    });

    expect(component.drawer).toMatchObject({
      backdrop: "rgb(20 23 29 / 0.48)",
      zIndex: 1300
    });

    expect(component.overlay).toMatchObject({
      backdrop: "rgb(20 23 29 / 0.48)",
      zIndex: 1300,
      radius: "0.375rem"
    });

    expect(component.popover).toMatchObject({
      shadow: "0 8px 32px 2px rgb(0 0 0 / 0.20)",
      zIndex: 1000
    });

    expect(component.toast).toMatchObject({
      border: "#e0e3e9",
      zIndex: 1200
    });

    expect(component.tooltip).toMatchObject({
      background: "#14171d",
      zIndex: 1000
    });

    expect(component.emptyState).toMatchObject({
      background: "#fafafa",
      border: "#e0e3e9"
    });

    expect(component.loadingState).toMatchObject({
      indicator: "#00205b",
      track: "#fafafa",
      text: "#63728a"
    });

    expect(component.dataTable).toMatchObject({
      headerBackground: "#fafafa",
      rowHoverBackground: "#fafafa",
      border: "#e0e3e9"
    });

    expect(component.menu).toMatchObject({
      itemHoverBackground: "#fafafa",
      dangerHoverBackground: "rgba(185, 28, 28, 0.08)",
      disabledText: "#919cb0",
      shadow: "0 2px 8px 0 rgb(0 0 0 / 0.20)"
    });

    expect(component.paginationNav).toMatchObject({
      hoverBackground: "#fafafa",
      ellipsisText: "#919cb0"
    });

    expect(component.sideNav).toMatchObject({
      width: "16rem",
      activeBackground: "#fafafa"
    });
  });

  it("exports a dark Airbus theme mapped from Airbus dark decision tokens", () => {
    expect(airbusDarkTheme).toMatchObject({
      id: "airbus-dark",
      label: "Airbus Dark",
      mode: "dark"
    });

    expect(airbusDarkTheme.tokens.semantic).toMatchObject({
      surface: {
        default: "#111111",
        subtle: "#25282e",
        raised: "#14171d"
      },
      text: {
        primary: "#ffffff",
        secondary: "#e0e3e9",
        link: "#638ee0"
      },
      action: {
        primary: "#86a8e9",
        primaryHover: "#b3cbf8",
        primaryText: "#14171d"
      }
    });

    const darkComponent = airbusDarkTheme.tokens.component as ThemeComponent;
    expect(darkComponent.control.anatomy?.field).toMatchObject({
      fillBg: "#25282e",
      underline: "inset 0 -1px 0 0 #ced5dd"
    });
    expect(darkComponent.field).toMatchObject({ maxWidth: "17.0625rem" });
    expect(darkComponent.tabs).toMatchObject({
      activeText: "#86a8e9",
      activeBackground: "transparent",
      activeWeight: "700",
      tabPaddingBlock: "0.5rem",
      tabPaddingInline: "1rem",
      tabFontSize: "0.875rem",
      tabLineHeight: "1.5rem",
      activeBorderTopWidth: "0",
      activeBorderBottomWidth: "0",
      activeShadow: "inset 0 -1px 0 0 #86a8e9"
    });

    const css = compileTheme(airbusDarkTheme);
    expect(css).toContain('[data-st-theme="airbus-dark"]');
    expect(css).toContain("--st-semantic-action-primary: #86a8e9;");
    expect(css).toContain("--st-foundation-field-fillBg: #25282e;");
  });

  it("keeps phase 2 anatomy shared tokens explicit in emitted CSS", () => {
    const light = compileTheme(airbusTheme);
    const dark = compileTheme(airbusDarkTheme);

    expect(light).toContain("--st-component-control-hoverBackground: #fafafa;");
    expect(light).toContain("--st-component-control-focusRing: #255fcc;");
    expect(light).toContain("--st-component-control-anatomy-states-hover-border: #63728a;");
    expect(light).toContain("--st-component-control-anatomy-states-focus-border: #255fcc;");
    expect(light).toContain("--st-component-control-anatomy-field-fillBg: #fafafa;");
    expect(light).toContain("--st-component-tabs-tabPaddingBlock: 0.5rem;");
    expect(light).toContain("--st-component-tabs-tabPaddingInline: 1rem;");
    expect(light).toContain("--st-component-tabs-tabFontSize: 0.875rem;");
    expect(light).toContain("--st-component-tabs-tabLineHeight: 1.5rem;");
    expect(light).toContain("--st-component-tabs-activeText: #063b9e;");
    expect(light).toContain("--st-component-tabs-activeShadow: inset 0 -1px 0 0 #00205b;");
    expect(light).toContain("--st-component-button-anatomy-states-hover-bg: #002d80;");
    expect(light).toContain("--st-component-drawer-zIndex: 1300;");
    expect(light).toContain("--st-component-overlay-zIndex: 1300;");
    expect(light).toContain("--st-component-popover-zIndex: 1000;");
    expect(light).toContain("--st-component-tooltip-zIndex: 1000;");
    expect(light).toContain("--st-component-toast-zIndex: 1200;");
    expect(light).toContain("--st-component-dataTable-rowHoverBackground: #fafafa;");
    expect(light).toContain("--st-component-loadingState-indicator: #00205b;");
    expect(light).toContain("--st-component-emptyState-background: #fafafa;");
    expect(light).toContain("--st-component-card-anatomy-states-hover-bg: #f1f1f1;");
    expect(light).toContain("--st-component-link-anatomy-states-hover-text: #00205b;");
    expect(light).toContain("--st-component-link-anatomy-states-hover-decoration: underline;");
    expect(light).toContain("--st-component-field-maxWidth: 17.0625rem;");
    expect(light).toContain("--st-foundation-borderWidth-thin: 1px;");

    expect(dark).toContain("--st-component-control-hoverBackground: #25282e;");
    expect(dark).toContain("--st-component-control-focusRing: #e5ecf7;");
    expect(dark).toContain("--st-component-control-anatomy-states-hover-border: #ced5dd;");
    expect(dark).toContain("--st-component-control-anatomy-states-focus-border: #e5ecf7;");
    expect(dark).toContain("--st-component-control-anatomy-field-fillBg: #25282e;");
    expect(dark).toContain("--st-component-tabs-tabPaddingBlock: 0.5rem;");
    expect(dark).toContain("--st-component-tabs-tabPaddingInline: 1rem;");
    expect(dark).toContain("--st-component-tabs-tabFontSize: 0.875rem;");
    expect(dark).toContain("--st-component-tabs-tabLineHeight: 1.5rem;");
    expect(dark).toContain("--st-component-tabs-activeText: #86a8e9;");
    expect(dark).toContain("--st-component-tabs-activeShadow: inset 0 -1px 0 0 #86a8e9;");
    expect(dark).toContain("--st-component-drawer-zIndex: 1300;");
    expect(dark).toContain("--st-component-overlay-zIndex: 1300;");
    expect(dark).toContain("--st-component-popover-zIndex: 1000;");
    expect(dark).toContain("--st-component-tooltip-zIndex: 1000;");
    expect(dark).toContain("--st-component-toast-zIndex: 1200;");
    expect(dark).toContain("--st-component-emptyState-background: #25282e;");
    expect(dark).toContain("--st-component-loadingState-indicator: #86a8e9;");
    expect(dark).toContain("--st-component-button-anatomy-states-hover-bg: #b3cbf8;");
    expect(dark).toContain("--st-component-card-anatomy-states-hover-bg: #25282e;");
    expect(dark).toContain("--st-component-link-anatomy-states-hover-text: #86a8e9;");
    expect(dark).toContain("--st-component-link-anatomy-states-hover-decoration: underline;");
  });
});
