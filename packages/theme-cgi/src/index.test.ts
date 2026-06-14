import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { cgiTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("cgiTheme", () => {
  it("maps CGI identity into the Sentropic contract", () => {
    expect(cgiTheme).toMatchObject({
      id: "cgi",
      label: "CGI",
      mode: "light"
    });

    const css = compileTheme(cgiTheme);
    expect(css).toContain('[data-st-theme="cgi"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // CGI form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = cgiTheme.tokens.component as ThemeComponent;
    // CGI controls sit on white surfaces with a faint grey page hover
    // (surface.default #ffffff / surface.subtle #f8f8f8).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f8f8f8"
    });
    // The primary button IS the CGI purple CTA, tightly rounded (4px).
    expect(component.button).toMatchObject({
      primaryBackground: "#5236ab",
      primaryText: "#ffffff",
      radius: "4px"
    });
    // CGI form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // CGI active tab label is the brand purple.
    expect(component.tabs).toMatchObject({
      activeText: "#5236ab"
    });
  });

  it("emits CGI purple + near-black ink and Source Sans Pro in the compiled variables", () => {
    const css = compileTheme(cgiTheme);
    // THE CGI purple action + the near-black ink.
    expect(css).toContain("--st-semantic-action-primary: #5236ab;");
    expect(css).toContain("--st-semantic-text-primary: #151515;");
    // Classic CGI red danger and the deep-indigo (#200a58) reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #e41937;");
    expect(css).toContain("--st-semantic-surface-inverse: #200a58;");
    // CGI's body sans.
    expect(css).toContain("Source Sans Pro");
  });
});
