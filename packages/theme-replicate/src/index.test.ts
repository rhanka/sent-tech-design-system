import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { replicateTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("replicateTheme", () => {
  it("maps Replicate identity into the Sentropic contract", () => {
    expect(replicateTheme).toMatchObject({
      id: "replicate",
      label: "Replicate",
      mode: "light"
    });

    const css = compileTheme(replicateTheme);
    expect(css).toContain('[data-st-theme="replicate"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Replicate form fields are boxed (outline), white fill + square corners.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = replicateTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f9f9f9"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#202020"
    });
  });

  it("emits Replicate brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(replicateTheme);
    // Iconic black primary action + near-black Radix gray text.
    expect(css).toContain("--st-semantic-action-primary: #000000;");
    expect(css).toContain("--st-semantic-text-primary: #202020;");
    // Tomato danger red and the dark inverse canvas.
    expect(css).toContain("--st-semantic-action-danger: #d13415;");
    expect(css).toContain("--st-semantic-surface-inverse: #111111;");
    // Replicate font families (Basier Square body, RB Freigeist Neue display, JetBrains Mono).
    expect(css).toContain("basier-square");
    expect(css).toContain("rb-freigeist-neue");
    expect(css).toContain("jetbrains-mono");
  });
});
