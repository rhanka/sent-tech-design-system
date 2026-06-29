import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { cohereTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("cohereTheme", () => {
  it("maps Cohere identity into the Sentropic contract", () => {
    expect(cohereTheme).toMatchObject({
      id: "cohere",
      label: "Cohere",
      mode: "light"
    });

    const css = compileTheme(cohereTheme);
    expect(css).toContain('[data-st-theme="cohere"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Cohere form fields are boxed & gently rounded (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = cohereTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#fafafa",
      hoverBackground: "#f2f2f2"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#ff7759"
    });
  });

  it("emits Cohere brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(cohereTheme);
    // Coral action + volcanic-black text.
    expect(css).toContain("--st-semantic-action-primary: #ff7759;");
    expect(css).toContain("--st-semantic-text-primary: #17171c;");
    // Measured error red and volcanic-black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #b30000;");
    expect(css).toContain("--st-semantic-surface-inverse: #17171c;");
    // Cohere custom typeface families (CohereText body, CohereMono code).
    expect(css).toContain("CohereText");
    expect(css).toContain("CohereMono");
  });
});
