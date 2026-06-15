import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { frankAndOakTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("frankAndOakTheme", () => {
  it("maps Frank And Oak identity into the Sentropic contract", () => {
    expect(frankAndOakTheme).toMatchObject({
      id: "frank-and-oak",
      label: "Frank And Oak",
      mode: "light"
    });

    const css = compileTheme(frankAndOakTheme);
    expect(css).toContain('[data-st-theme="frank-and-oak"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Frank And Oak form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = frankAndOakTheme.tokens.component as ThemeComponent;
    // Frank And Oak controls are white-filled with a faint grey hover (#f7f7f7).
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f7f7f7"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Button radius is derived from foundation.radius.md (2px — barely-rounded).
    expect(component.button).toMatchObject({ radius: "2px" });
    // Frank And Oak active tab label is the soft ink.
    expect(component.tabs).toMatchObject({
      activeText: "#292929"
    });
  });

  it("emits Frank And Oak monochrome colours and the CircularStd font in the compiled variables", () => {
    const css = compileTheme(frankAndOakTheme);
    // Frank And Oak black action + soft-ink text (the minimal identity).
    expect(css).toContain("--st-semantic-action-primary: #000000;");
    expect(css).toContain("--st-semantic-text-primary: #292929;");
    // Restrained danger red (à confirmer) and #202020 inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #c0202e;");
    expect(css).toContain("--st-semantic-surface-inverse: #202020;");
    // Frank And Oak brand webfont (the CircularStd geometric sans).
    expect(css).toContain("CircularStd");
  });
});
