import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { nousHermesTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("nousHermesTheme", () => {
  it("maps Nous Research / Hermes identity into the Sentropic contract", () => {
    expect(nousHermesTheme).toMatchObject({
      id: "nous-hermes",
      label: "Nous Hermes",
      mode: "dark"
    });

    const css = compileTheme(nousHermesTheme);
    expect(css).toContain('[data-st-theme="nous-hermes"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Hermes / shadcn form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = nousHermesTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#05091a",
      hoverBackground: "#161c2c"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#161c2c"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#d8f0ff"
    });
  });

  it("emits Nous brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(nousHermesTheme);
    // Ice accent action + ice primary ink on the near-black navy stage.
    expect(css).toContain("--st-semantic-action-primary: #d8f0ff;");
    expect(css).toContain("--st-semantic-text-primary: #d8f0ff;");
    // shadcn destructive and the ice inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #f0616d;");
    expect(css).toContain("--st-semantic-surface-inverse: #d8f0ff;");
    // Nous font families (Share Tech Mono terminal voice, Open Sans body).
    expect(css).toContain("Share Tech Mono");
    expect(css).toContain("Open Sans");
  });
});
