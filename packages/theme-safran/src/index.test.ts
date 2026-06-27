import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { safranTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("safranTheme", () => {
  it("maps the Safran brand identity into the Sentropic contract", () => {
    expect(safranTheme).toMatchObject({
      id: "safran",
      label: "Safran",
      mode: "light"
    });

    const css = compileTheme(safranTheme);
    expect(css).toContain('[data-st-theme="safran"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Safran form fields are boxed (outline), square corners — not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = safranTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#F9FAFC"
    });
    // Boxed white field with SQUARE corners (measured border-radius:0).
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff",
      radiusTop: "0",
      radiusBottom: "0"
    });
    // Active tab label uses the AA action blue.
    expect(component.tabs).toMatchObject({
      activeText: "#1767AD"
    });
  });

  it("emits Safran brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(safranTheme);
    // AA action blue (CTA gradient mid-stop) + near-black navy text.
    expect(css).toContain("--st-semantic-action-primary: #1767AD;");
    expect(css).toContain("--st-semantic-text-primary: #1B1D27;");
    // Rust danger and deep-navy inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #C6541C;");
    expect(css).toContain("--st-semantic-surface-inverse: #141D29;");
    // Safran brand font family (Barlow).
    expect(css).toContain("Barlow");
  });
});
