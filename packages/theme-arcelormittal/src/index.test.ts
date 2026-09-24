import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { arcelorMittalTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("arcelorMittalTheme", () => {
  it("maps the ArcelorMittal brand identity into the Sentropic contract", () => {
    expect(arcelorMittalTheme).toMatchObject({
      id: "arcelormittal",
      label: "ArcelorMittal",
      mode: "light"
    });

    const css = compileTheme(arcelorMittalTheme);
    expect(css).toContain('[data-st-theme="arcelormittal"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // ArcelorMittal form fields are underlined (filled-underline), not boxed.
    expect(css).toContain("--st-field-style: filled-underline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = arcelorMittalTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#e6eaef"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "filled-underline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#d92f00"
    });
  });

  it("emits ArcelorMittal brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(arcelorMittalTheme);
    // Brand orange action + body-text slate.
    expect(css).toContain("--st-semantic-action-primary: #ff3700;");
    expect(css).toContain("--st-semantic-text-primary: #2a2a2a;");
    // Error red danger and near-black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #d13438;");
    expect(css).toContain("--st-semantic-surface-inverse: #151515;");
    // ArcelorMittal brand font families (Gilroy, the corporate-site typeface),
    // pinned separately so a swap between body and display faces fails.
    expect(css).toContain("Gilroy Standard");
    expect(css).toContain("Gilroy Standard-SemiBold");
  });
});
