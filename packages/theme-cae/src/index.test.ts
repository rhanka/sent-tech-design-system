import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { caeTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("caeTheme", () => {
  it("maps CAE identity into the Sentropic contract", () => {
    expect(caeTheme).toMatchObject({
      id: "cae",
      label: "CAE",
      mode: "light"
    });

    const css = compileTheme(caeTheme);
    expect(css).toContain('[data-st-theme="cae"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // CAE form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = caeTheme.tokens.component as ThemeComponent;
    // CAE controls sit on white surfaces with a faint grey page hover
    // (surface.default #ffffff / surface.subtle #f8f8f8).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f8f8f8"
    });
    // The primary button IS the CAE interactive-blue CTA; the derived component
    // button radius follows the measured control radius (radius.md 8px).
    expect(component.button).toMatchObject({
      primaryBackground: "#2969F2",
      primaryText: "#ffffff",
      radius: "0.5rem"
    });
    // CAE form fields are boxed white outlines.
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // CAE active tab label is the interactive blue.
    expect(component.tabs).toMatchObject({
      activeText: "#2969F2"
    });
  });

  it("emits CAE interactive-blue + near-black ink, deep-navy inverse and Red Hat Display in the compiled variables", () => {
    const css = compileTheme(caeTheme);
    // THE CAE interactive-blue action + the near-black primary ink.
    expect(css).toContain("--st-semantic-action-primary: #2969F2;");
    expect(css).toContain("--st-semantic-text-primary: #111827;");
    // Measured danger red and the deep-navy reversed surface.
    expect(css).toContain("--st-semantic-action-danger: #dc2626;");
    expect(css).toContain("--st-semantic-surface-inverse: #06103D;");
    // CAE's brand face.
    expect(css).toContain("Red Hat Display");
  });
});
