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

    expect(component.button).toMatchObject({
      primaryBackground: "#00205b",
      primaryText: "#ffffff",
      secondaryBackground: "#ffffff",
      secondaryBorder: "#00205b",
      secondaryHoverBackground: "#f1f1f1",
      secondaryText: "#00205b"
    });

    expect(component.input).toMatchObject({
      background: "#ffffff",
      border: "#e0e3e9",
      focusRing: "#255fcc",
      radius: "0.1875rem"
    });

    expect(component.link).toMatchObject({
      text: "#255fcc",
      hoverText: "#00205b",
      disabledText: "#919cb0"
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

    expect(component.control).toMatchObject({
      background: "#ffffff",
      text: "#14171d",
      placeholderText: "#919cb0",
      border: "#e0e3e9",
      hoverBorder: "#63728a",
      focusRing: "#255fcc",
      disabledText: "#919cb0",
      anatomy: {
        states: {
          hover: {
            border: "#63728a"
          },
          focus: {
            border: "#255fcc"
          },
          disabled: {
            bg: "#fafafa",
            text: "#919cb0"
          }
        }
      }
    });

    expect(component.field).toMatchObject({
      labelText: "#14171d",
      helpText: "#63728a",
      errorText: "#e4002b",
      gap: "0.5rem",
      labelTypography: {
        family: "Inter, Arial, sans-serif",
        size: "0.875rem",
        weight: "700",
        lineHeight: "1.25rem"
      }
    });

    expect(component.paginationNav).toMatchObject({
      text: "#14171d",
      activeText: "#14171d",
      hoverBackground: "#fafafa",
      activeBackground: "transparent"
    });

    expect(component.pagination).toMatchObject({
      background: "#ffffff",
      border: "transparent",
      text: "#14171d",
      activeBackground: "transparent",
      activeText: "#14171d"
    });

    expect(component.sideNav).toMatchObject({
      background: "#ffffff",
      border: "#e0e3e9",
      itemText: "#63728a",
      activeBackground: "#fafafa",
      activeText: "#14171d",
      width: "16rem"
    });

    expect(component.menu).toMatchObject({
      background: "#ffffff",
      text: "#14171d",
      itemHoverBackground: "#fafafa",
      dangerText: "#e4002b",
      dangerHoverBackground: "rgba(185, 28, 28, 0.08)",
      disabledText: "#919cb0"
    });

    expect(component.tag).toMatchObject({
      radius: "0.75rem",
      neutralBackground: "#e0e3e9",
      neutralText: "#14171d"
    });

    expect(component.graph).toMatchObject({
      panelBackground: "#14171d",
      panelText: "#ffffff",
      edgeDefault: "rgb(226 232 240 / 0.56)",
      community1: "#00205b",
      community2: "#3cb7ff",
      community3: "#00aec7",
      community4: "#08875b"
    });

    expect(component.dropdown).toMatchObject({
      background: "#ffffff",
      text: "#14171d",
      optionHoverBackground: "#fafafa",
      selectedBackground: "#00205b",
      selectedText: "#ffffff"
    });

    expect(component.dataTable).toMatchObject({
      headerBackground: "#fafafa",
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
    expect(darkComponent.control).toMatchObject({
      background: "#111111",
      text: "#ffffff",
      placeholderText: "#a3a3a3",
      border: "#3c4657",
      hoverBorder: "#ced5dd",
      focusRing: "#e5ecf7",
      disabledText: "#a3a3a3"
    });
    expect(darkComponent.field).toMatchObject({
      labelText: "#ffffff",
      helpText: "#e0e3e9",
      errorText: "#f86471",
      gap: "0.5rem"
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
    expect(darkComponent.button).toMatchObject({
      primaryBackground: "#86a8e9",
      primaryText: "#14171d",
      secondaryBackground: "#111111",
      secondaryBorder: "#86a8e9",
      secondaryHoverBackground: "#32353b",
      secondaryText: "#86a8e9"
    });
    expect(darkComponent.input).toMatchObject({
      background: "#111111",
      border: "#3c4657",
      focusRing: "#e5ecf7",
      radius: "0.1875rem"
    });
    expect(darkComponent.pagination).toMatchObject({
      background: "transparent",
      border: "transparent",
      text: "#ffffff",
      activeBackground: "#cfddf8",
      activeText: "#14171d"
    });
    expect(darkComponent.paginationNav).toMatchObject({
      background: "transparent",
      hoverBackground: "#25282e",
      activeBackground: "#cfddf8",
      activeText: "#14171d"
    });
    expect(darkComponent.sideNav).toMatchObject({
      background: "#111111",
      activeBackground: "#25282e",
      activeText: "#ffffff",
      border: "#3c4657",
      width: "16rem"
    });
    expect(darkComponent.menu).toMatchObject({
      background: "#14171d",
      text: "#ffffff",
      itemHoverBackground: "#25282e",
      dangerText: "#f86471",
      disabledText: "#a3a3a3"
    });
    expect(darkComponent.dropdown).toMatchObject({
      background: "#111111",
      text: "#ffffff",
      optionHoverBackground: "#25282e",
      selectedBackground: "#86a8e9",
      selectedText: "#14171d"
    });
    expect(darkComponent.dataTable).toMatchObject({
      headerBackground: "#25282e",
      rowBackground: "#111111",
      rowHoverBackground: "#25282e"
    });
    expect(darkComponent.link).toMatchObject({
      text: "#638ee0",
      hoverText: "#86a8e9",
      disabledText: "#a3a3a3"
    });
    expect(darkComponent.tag).toMatchObject({
      neutralBackground: "#25282e",
      neutralText: "#ffffff"
    });
    expect(darkComponent.graph).toMatchObject({
      panelBackground: "#ffffff",
      panelText: "#14171d",
      edgeDefault: "rgb(226 232 240 / 0.56)",
      community1: "#86a8e9",
      community2: "#82d1ff",
      community3: "#16d4f0",
      community4: "#27e7a7"
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
    expect(light).toContain("--st-component-control-disabledText: #919cb0;");
    expect(light).toContain("--st-component-control-anatomy-states-hover-border: #63728a;");
    expect(light).toContain("--st-component-control-anatomy-states-focus-border: #255fcc;");
    expect(light).toContain("--st-component-control-anatomy-states-disabled-bg: #fafafa;");
    expect(light).toContain("--st-component-control-anatomy-states-disabled-text: #919cb0;");
    expect(light).toContain("--st-component-control-anatomy-field-fillBg: #fafafa;");
    expect(light).toContain("--st-component-control-anatomy-field-underline: inset 0 -1px 0 0 #63728a;");
    expect(light).toContain("--st-component-control-anatomy-field-focusShadow: inset 0 -1px 0 0 #63728a;");
    expect(light).toContain("--st-component-chat-userBubbleBackground: #00205b;");
    expect(light).toContain("--st-component-chat-assistantBubbleBackground: #fafafa;");
    expect(light).toContain("--st-component-chat-composerSurface: #ffffff;");
    expect(light).toContain("--st-component-alert-background: #ffffff;");
    expect(light).toContain("--st-component-alert-text: #14171d;");
    expect(light).toContain("--st-component-alert-borderTop: none;");
    expect(light).toContain("--st-component-breadcrumb-linkText: #255fcc;");
    expect(light).toContain("--st-component-pagination-paddingInline: 0;");
    expect(light).toContain("--st-component-pagination-activeBorderWidth: 2px;");
    expect(light).toContain("--st-component-pagination-background: #ffffff;");
    expect(light).toContain("--st-component-pagination-text: #14171d;");
    expect(light).toContain("--st-component-pagination-activeBackground: transparent;");
    expect(light).toContain("--st-component-paginationNav-hoverBackground: #fafafa;");
    expect(light).toContain("--st-component-paginationNav-background: #ffffff;");
    expect(light).toContain("--st-component-menu-itemHoverBackground: #fafafa;");
    expect(light).toContain("--st-component-menu-background: #ffffff;");
    expect(light).toContain("--st-component-menu-border: #e0e3e9;");
    expect(light).toContain("--st-component-menu-text: #14171d;");
    expect(light).toContain("--st-component-menu-dangerText: #e4002b;");
    expect(light).toContain("--st-component-menu-dangerHoverBackground: rgba(185, 28, 28, 0.08);");
    expect(light).toContain("--st-component-menu-disabledText: #919cb0;");
    expect(light).toContain("--st-component-dropdown-optionHoverBackground: #fafafa;");
    expect(light).toContain("--st-component-dropdown-background: #ffffff;");
    expect(light).toContain("--st-component-dropdown-border: #e0e3e9;");
    expect(light).toContain("--st-component-dropdown-text: #14171d;");
    expect(light).toContain("--st-component-dropdown-selectedBackground: #00205b;");
    expect(light).toContain("--st-component-dropdown-selectedText: #ffffff;");
    expect(light).toContain("--st-component-dataTable-rowHoverBackground: #fafafa;");
    expect(light).toContain("--st-component-dataTable-headerBackground: #fafafa;");
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
    expect(light).toContain("--st-component-sideNav-background: #ffffff;");
    expect(light).toContain("--st-component-sideNav-border: #e0e3e9;");
    expect(light).toContain("--st-component-sideNav-activeBackground: #fafafa;");
    expect(light).toContain("--st-component-menu-itemHoverBackground: #fafafa;");
    expect(light).toContain("--st-component-dropdown-optionHoverBackground: #fafafa;");
    expect(light).toContain("--st-component-dataTable-rowHoverBackground: #fafafa;");
    expect(light).toContain("--st-component-field-labelText: #14171d;");
    expect(light).toContain("--st-component-field-labelTypography-size: 0.875rem;");
    expect(light).toContain("--st-component-button-primaryBackground: #00205b;");
    expect(light).toContain("--st-component-button-secondaryBackground: #ffffff;");
    expect(light).toContain("--st-component-input-background: #ffffff;");
    expect(light).toContain("--st-component-link-text: #255fcc;");
    expect(light).toContain("--st-component-link-hoverText: #00205b;");
    expect(light).toContain("--st-component-tag-neutralBackground: #e0e3e9;");
    expect(light).toContain("--st-component-graph-community4: #08875b;");

    expect(dark).toContain("--st-component-control-hoverBackground: #25282e;");
    expect(dark).toContain("--st-component-control-focusRing: #e5ecf7;");
    expect(dark).toContain("--st-component-control-disabledText: #a3a3a3;");
    expect(dark).toContain("--st-component-control-anatomy-states-hover-border: #ced5dd;");
    expect(dark).toContain("--st-component-control-anatomy-states-focus-border: #e5ecf7;");
    expect(dark).toContain("--st-component-control-anatomy-states-disabled-bg: #25282e;");
    expect(dark).toContain("--st-component-control-anatomy-states-disabled-text: #a3a3a3;");
    expect(dark).toContain("--st-component-control-anatomy-field-fillBg: #25282e;");
    expect(dark).toContain("--st-component-control-anatomy-field-underline: inset 0 -1px 0 0 #ced5dd;");
    expect(dark).toContain("--st-component-control-anatomy-field-focusShadow: inset 0 -1px 0 0 #ced5dd;");
    expect(dark).toContain("--st-component-chat-userBubbleBackground: #86a8e9;");
    expect(dark).toContain("--st-component-chat-assistantBubbleBackground: #25282e;");
    expect(dark).toContain("--st-component-chat-composerSurface: #14171d;");
    expect(dark).toContain("--st-component-alert-background: #181c21;");
    expect(dark).toContain("--st-component-alert-text: #ffffff;");
    expect(dark).toContain("--st-component-alert-borderTop: none;");
    expect(dark).toContain("--st-component-breadcrumb-linkText: #638ee0;");
    expect(dark).toContain("--st-component-pagination-paddingInline: 0;");
    expect(dark).toContain("--st-component-pagination-activeText: #14171d;");
    expect(dark).toContain("--st-component-pagination-background: transparent;");
    expect(dark).toContain("--st-component-pagination-text: #ffffff;");
    expect(dark).toContain("--st-component-pagination-activeBackground: #cfddf8;");
    expect(dark).toContain("--st-component-paginationNav-hoverBackground: #25282e;");
    expect(dark).toContain("--st-component-paginationNav-background: transparent;");
    expect(dark).toContain("--st-component-menu-itemHoverBackground: #25282e;");
    expect(dark).toContain("--st-component-menu-background: #14171d;");
    expect(dark).toContain("--st-component-menu-border: #3c4657;");
    expect(dark).toContain("--st-component-menu-text: #ffffff;");
    expect(dark).toContain("--st-component-menu-dangerText: #f86471;");
    expect(dark).toContain("--st-component-menu-dangerHoverBackground: rgba(185, 28, 28, 0.08);");
    expect(dark).toContain("--st-component-menu-disabledText: #a3a3a3;");
    expect(dark).toContain("--st-component-dropdown-optionHoverBackground: #25282e;");
    expect(dark).toContain("--st-component-dropdown-background: #111111;");
    expect(dark).toContain("--st-component-dropdown-border: #3c4657;");
    expect(dark).toContain("--st-component-dropdown-text: #ffffff;");
    expect(dark).toContain("--st-component-dropdown-selectedBackground: #86a8e9;");
    expect(dark).toContain("--st-component-dropdown-selectedText: #14171d;");
    expect(dark).toContain("--st-component-dataTable-rowHoverBackground: #25282e;");
    expect(dark).toContain("--st-component-dataTable-headerBackground: #25282e;");
    expect(dark).toContain("--st-component-button-primaryBackground: #86a8e9;");
    expect(dark).toContain("--st-component-button-secondaryBackground: #111111;");
    expect(dark).toContain("--st-component-input-background: #111111;");
    expect(dark).toContain("--st-component-link-text: #638ee0;");
    expect(dark).toContain("--st-component-link-hoverText: #86a8e9;");
    expect(dark).toContain("--st-component-tag-neutralBackground: #25282e;");
    expect(dark).toContain("--st-component-graph-community4: #27e7a7;");
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
    expect(dark).toContain("--st-component-sideNav-background: #111111;");
    expect(dark).toContain("--st-component-sideNav-border: #3c4657;");
    expect(dark).toContain("--st-component-sideNav-activeBackground: #25282e;");
    expect(dark).toContain("--st-component-sideNav-activeText: #ffffff;");
    expect(dark).toContain("--st-component-menu-itemHoverBackground: #25282e;");
    expect(dark).toContain("--st-component-dropdown-optionHoverBackground: #25282e;");
    expect(dark).toContain("--st-component-dataTable-rowHoverBackground: #25282e;");
    expect(dark).toContain("--st-component-field-labelText: #ffffff;");
    expect(dark).toContain("--st-component-field-labelTypography-size: 0.875rem;");
  });
});
