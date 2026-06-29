import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { vercelTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("vercelTheme", () => {
  it("maps Vercel Geist identity into the Sentropic contract", () => {
    expect(vercelTheme).toMatchObject({
      id: "vercel",
      label: "Vercel",
      mode: "light"
    });

    const css = compileTheme(vercelTheme);
    expect(css).toContain('[data-st-theme="vercel"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Geist form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = vercelTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#fafafa"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#171717"
    });
  });

  it("emits Geist brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(vercelTheme);
    // Iconic pure-black primary action + near-black Geist text.
    expect(css).toContain("--st-semantic-action-primary: #000000;");
    expect(css).toContain("--st-semantic-text-primary: #171717;");
    // Geist error red and pure-black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #ea001d;");
    expect(css).toContain("--st-semantic-surface-inverse: #000000;");
    // Geist font families (Geist Sans UI, Geist Mono code).
    expect(css).toContain("Geist");
    expect(css).toContain("Geist Mono");
  });
});
