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

    const css = compileTheme(airbusDarkTheme);
    expect(css).toContain('[data-st-theme="airbus-dark"]');
    expect(css).toContain("--st-semantic-action-primary: #86a8e9;");
    expect(css).toContain("--st-foundation-field-fillBg: #25282e;");
  });
});
