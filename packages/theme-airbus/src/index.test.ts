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
      activeShadow: "inset 0 -2px 0 0 #00205b"
    });

    expect(component.card).toMatchObject({
      background: "#ffffff",
      border: "#e0e3e9",
      radius: "0.375rem",
      shadow: "0 1px 4px 0 rgb(0 0 0 / 0.24)"
    });

    expect(component.accordion).toMatchObject({
      text: "#14171d",
      paddingBlock: "0.5rem",
      paddingInline: "1rem",
      fontSize: "1rem",
      fontWeight: "700",
      lineHeight: "1.5rem"
    });

    expect(component.alert).toMatchObject({
      background: "#ffffff",
      text: "#14171d",
      borderTop: "none",
      borderRight: "none",
      borderBottom: "none",
      accentWidth: "0",
      filetWidth: "0",
      radius: "0.375rem",
      paddingTop: "0.5rem"
    });

    expect(component.breadcrumb).toMatchObject({
      text: "#63728a",
      linkText: "#255fcc",
      separator: "#919cb0",
      fontSize: "0.875rem",
      lineHeight: "1.5rem",
      currentWeight: "700"
    });

    expect(component.chat).toMatchObject({
      userBubbleBackground: "#00205b",
      userBubbleText: "#ffffff",
      assistantBubbleBackground: "#fafafa",
      assistantBubbleText: "#14171d",
      composerSurface: "#ffffff",
      toolCallSurface: "#fafafa"
    });

    expect(component.search).toMatchObject({
      paddingBlock: "0.5rem",
      paddingInline: "2.5rem",
      fontSize: "0.875rem",
      lineHeight: "1.25rem"
    });

    expect(component.pagination).toMatchObject({
      background: "#ffffff",
      border: "transparent",
      activeBackground: "transparent",
      activeText: "#14171d",
      disabledText: "#919cb0",
      borderWidth: "2px",
      activeBorder: "transparent",
      activeBorderWidth: "2px",
      paddingBlock: "0",
      paddingInline: "0",
      minSize: "2rem",
      fontSize: "0.875rem",
      lineHeight: "1.5rem"
    });

    expect(component.drawer).toMatchObject({
      backdrop: "rgb(20 23 29 / 0.48)",
      surface: "#ffffff",
      border: "#e0e3e9",
      shadow: "0 8px 32px 2px rgb(0 0 0 / 0.20)",
      width: "24rem",
      zIndex: 1300
    });

    expect(component.overlay).toMatchObject({
      backdrop: "rgb(20 23 29 / 0.48)",
      surface: "#ffffff",
      border: "#e0e3e9",
      shadow: "0 8px 32px 2px rgb(0 0 0 / 0.20)",
      radius: "0.375rem",
      zIndex: 1300
    });

    expect(component.popover).toMatchObject({
      background: "#ffffff",
      text: "#14171d",
      border: "#e0e3e9",
      shadow: "0 8px 32px 2px rgb(0 0 0 / 0.20)",
      radius: "0.375rem",
      zIndex: 1000
    });

    expect(component.toast).toMatchObject({
      background: "#ffffff",
      text: "#14171d",
      border: "#e0e3e9",
      shadow: "0 8px 32px 2px rgb(0 0 0 / 0.20)",
      radius: "0.375rem",
      zIndex: 1200
    });

    expect(component.tooltip).toMatchObject({
      background: "#14171d",
      text: "#ffffff",
      radius: "0.1875rem",
      shadow: "0 2px 8px 0 rgb(0 0 0 / 0.20)",
      zIndex: 1000
    });

    expect(component.emptyState).toMatchObject({
      background: "#fafafa",
      border: "#e0e3e9",
      titleText: "#14171d",
      messageText: "#63728a",
      radius: "0.375rem"
    });

    expect(component.loadingState).toMatchObject({
      indicator: "#00205b",
      track: "#fafafa",
      text: "#63728a",
      radius: "62.5rem"
    });

    expect(component.selection).toMatchObject({
      checkedBackground: "#00205b",
      checkedText: "#ffffff",
      border: "#e0e3e9",
      switchTrack: "#ffffff",
      switchTrackChecked: "#00205b",
      switchThumb: "#00205b",
      toggleTrackRadius: "0",
      toggleTrackWidth: "3rem"
    });

    expect(component.paginationNav).toMatchObject({
      text: "#14171d",
      activeText: "#14171d",
      hoverBackground: "#fafafa",
      activeBackground: "transparent"
    });

    expect(component.sideNav).toMatchObject({
      background: "#ffffff",
      itemText: "#63728a",
      activeText: "#14171d",
      width: "16rem"
    });

    expect(component.menu).toMatchObject({
      background: "#ffffff",
      text: "#14171d",
      itemHoverBackground: "#fafafa",
      dangerText: "#e4002b"
    });

    expect(component.dropdown).toMatchObject({
      background: "#ffffff",
      text: "#14171d",
      optionHoverBackground: "#fafafa",
      selectedBackground: "#00205b"
    });

    expect(component.dataTable).toMatchObject({
      rowBackground: "#ffffff",
      rowHoverBackground: "#fafafa",
      border: "#e0e3e9",
      captionText: "#63728a"
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
      activeShadow: "inset 0 -2px 0 0 #86a8e9"
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
    expect(light).toContain("--st-component-control-anatomy-field-underline: inset 0 -1px 0 0 #63728a;");
    expect(light).toContain("--st-component-chat-userBubbleBackground: #00205b;");
    expect(light).toContain("--st-component-chat-assistantBubbleBackground: #fafafa;");
    expect(light).toContain("--st-component-chat-composerSurface: #ffffff;");
    expect(light).toContain("--st-component-alert-background: #ffffff;");
    expect(light).toContain("--st-component-alert-text: #14171d;");
    expect(light).toContain("--st-component-alert-borderTop: none;");
    expect(light).toContain("--st-component-breadcrumb-linkText: #255fcc;");
    expect(light).toContain("--st-component-pagination-paddingInline: 0;");
    expect(light).toContain("--st-component-pagination-activeBorderWidth: 2px;");
    expect(light).toContain("--st-component-paginationNav-hoverBackground: #fafafa;");
    expect(light).toContain("--st-component-menu-itemHoverBackground: #fafafa;");
    expect(light).toContain("--st-component-dropdown-optionHoverBackground: #fafafa;");
    expect(light).toContain("--st-component-dataTable-rowHoverBackground: #fafafa;");
    expect(light).toContain("--st-component-drawer-zIndex: 1300;");
    expect(light).toContain("--st-component-overlay-zIndex: 1300;");
    expect(light).toContain("--st-component-popover-zIndex: 1000;");
    expect(light).toContain("--st-component-toast-zIndex: 1200;");
    expect(light).toContain("--st-component-tooltip-zIndex: 1000;");
    expect(light).toContain("--st-component-popover-background: #ffffff;");
    expect(light).toContain("--st-component-emptyState-titleText: #14171d;");
    expect(light).toContain("--st-component-emptyState-messageText: #63728a;");
    expect(light).toContain("--st-component-loadingState-indicator: #00205b;");
    expect(light).toContain("--st-component-selection-switchTrackChecked: #00205b;");
    expect(light).toContain("--st-component-selection-toggleTrackWidth: 3rem;");
    expect(light).toContain("--st-component-selection-toggleTrackHeight: 1.5rem;");
    expect(light).toContain("--st-component-tabs-tabPaddingBlock: 0.5rem;");
    expect(light).toContain("--st-component-tabs-tabPaddingInline: 1rem;");
    expect(light).toContain("--st-component-tabs-tabFontSize: 0.875rem;");
    expect(light).toContain("--st-component-tabs-tabLineHeight: 1.5rem;");
    expect(light).toContain("--st-component-tabs-activeText: #063b9e;");
    expect(light).toContain("--st-component-tabs-activeShadow: inset 0 -2px 0 0 #00205b;");
    expect(light).toContain("--st-component-button-anatomy-states-hover-bg: #002d80;");
    expect(light).toContain("--st-component-card-anatomy-states-hover-bg: #f1f1f1;");
    expect(light).toContain("--st-component-link-anatomy-states-hover-text: #00205b;");
    expect(light).toContain("--st-component-link-anatomy-states-hover-decoration: underline;");
    expect(light).toContain("--st-component-paginationNav-hoverBackground: #fafafa;");
    expect(light).toContain("--st-component-sideNav-itemText: #63728a;");
    expect(light).toContain("--st-component-menu-itemHoverBackground: #fafafa;");
    expect(light).toContain("--st-component-dropdown-optionHoverBackground: #fafafa;");
    expect(light).toContain("--st-component-dataTable-rowHoverBackground: #fafafa;");

    expect(dark).toContain("--st-component-control-hoverBackground: #25282e;");
    expect(dark).toContain("--st-component-control-focusRing: #e5ecf7;");
    expect(dark).toContain("--st-component-control-anatomy-states-hover-border: #ced5dd;");
    expect(dark).toContain("--st-component-control-anatomy-states-focus-border: #e5ecf7;");
    expect(dark).toContain("--st-component-control-anatomy-field-fillBg: #25282e;");
    expect(dark).toContain("--st-component-control-anatomy-field-underline: inset 0 -1px 0 0 #ced5dd;");
    expect(dark).toContain("--st-component-chat-userBubbleBackground: #86a8e9;");
    expect(dark).toContain("--st-component-chat-assistantBubbleBackground: #25282e;");
    expect(dark).toContain("--st-component-chat-composerSurface: #14171d;");
    expect(dark).toContain("--st-component-alert-background: #181c21;");
    expect(dark).toContain("--st-component-alert-text: #ffffff;");
    expect(dark).toContain("--st-component-alert-borderTop: none;");
    expect(dark).toContain("--st-component-breadcrumb-linkText: #638ee0;");
    expect(dark).toContain("--st-component-pagination-paddingInline: 0;");
    expect(dark).toContain("--st-component-pagination-activeText: #14171d;");
    expect(dark).toContain("--st-component-paginationNav-hoverBackground: #25282e;");
    expect(dark).toContain("--st-component-menu-itemHoverBackground: #25282e;");
    expect(dark).toContain("--st-component-dropdown-optionHoverBackground: #25282e;");
    expect(dark).toContain("--st-component-dataTable-rowHoverBackground: #25282e;");
    expect(dark).toContain("--st-component-drawer-zIndex: 1300;");
    expect(dark).toContain("--st-component-overlay-zIndex: 1300;");
    expect(dark).toContain("--st-component-popover-zIndex: 1000;");
    expect(dark).toContain("--st-component-toast-zIndex: 1200;");
    expect(dark).toContain("--st-component-tooltip-zIndex: 1000;");
    expect(dark).toContain("--st-component-popover-background: #14171d;");
    expect(dark).toContain("--st-component-emptyState-titleText: #ffffff;");
    expect(dark).toContain("--st-component-emptyState-messageText: #e0e3e9;");
    expect(dark).toContain("--st-component-loadingState-indicator: #86a8e9;");
    expect(dark).toContain("--st-component-selection-switchTrackChecked: #86a8e9;");
    expect(dark).toContain("--st-component-selection-toggleTrackWidth: 3rem;");
    expect(dark).toContain("--st-component-selection-toggleTrackHeight: 1.5rem;");
    expect(dark).toContain("--st-component-tabs-tabPaddingBlock: 0.5rem;");
    expect(dark).toContain("--st-component-tabs-tabPaddingInline: 1rem;");
    expect(dark).toContain("--st-component-tabs-tabFontSize: 0.875rem;");
    expect(dark).toContain("--st-component-tabs-tabLineHeight: 1.5rem;");
    expect(dark).toContain("--st-component-tabs-activeText: #86a8e9;");
    expect(dark).toContain("--st-component-tabs-activeShadow: inset 0 -2px 0 0 #86a8e9;");
    expect(dark).toContain("--st-component-button-anatomy-states-hover-bg: #b3cbf8;");
    expect(dark).toContain("--st-component-card-anatomy-states-hover-bg: #25282e;");
    expect(dark).toContain("--st-component-link-anatomy-states-hover-text: #86a8e9;");
    expect(dark).toContain("--st-component-link-anatomy-states-hover-decoration: underline;");
    expect(dark).toContain("--st-component-paginationNav-hoverBackground: #25282e;");
    expect(dark).toContain("--st-component-sideNav-itemText: #e0e3e9;");
    expect(dark).toContain("--st-component-sideNav-activeText: #ffffff;");
    expect(dark).toContain("--st-component-menu-itemHoverBackground: #25282e;");
    expect(dark).toContain("--st-component-dropdown-optionHoverBackground: #25282e;");
    expect(dark).toContain("--st-component-dataTable-rowHoverBackground: #25282e;");
  });
});
