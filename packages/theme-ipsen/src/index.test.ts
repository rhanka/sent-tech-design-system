import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { ipsenTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("ipsenTheme", () => {
  it("maps the Ipsen brand identity into the Sentropic contract", () => {
    expect(ipsenTheme).toMatchObject({
      id: "ipsen",
      label: "Ipsen",
      mode: "light"
    });

    const css = compileTheme(ipsenTheme);
    expect(css).toContain('[data-st-theme="ipsen"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Ipsen form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = ipsenTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#edebe4"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#000e56"
    });
  });

  it("emits Ipsen brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(ipsenTheme);
    // Navy action + navy text.
    expect(css).toContain("--st-semantic-action-primary: #000e56;");
    expect(css).toContain("--st-semantic-text-primary: #000e56;");
    // Validation red danger and navy inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #c02b0a;");
    expect(css).toContain("--st-semantic-surface-inverse: #000e56;");
    // Ipsen brand font family (Rethink Sans, the theme's @font-face family).
    expect(css).toContain("Rethink Sans");
  });
});
