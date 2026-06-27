import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { publicisTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("publicisTheme", () => {
  it("maps the Publicis Groupe brand identity into the Sentropic contract", () => {
    expect(publicisTheme).toMatchObject({
      id: "publicis",
      label: "Publicis Groupe",
      mode: "light"
    });

    const css = compileTheme(publicisTheme);
    expect(css).toContain('[data-st-theme="publicis"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Publicis form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = publicisTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f4f4f5"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Active tab marked with the deep Publicis Gold accent.
    expect(component.tabs).toMatchObject({
      activeText: "#7d6831"
    });
  });

  it("emits Publicis brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(publicisTheme);
    // Publicis Black corporate primary action + black body text.
    expect(css).toContain("--st-semantic-action-primary: #212129;");
    expect(css).toContain("--st-semantic-text-primary: #212129;");
    // Derived error red danger and Publicis Black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #c62828;");
    expect(css).toContain("--st-semantic-surface-inverse: #212129;");
    // Publicis editorial font pairing: Gotham Narrow (UI/display) + ITC New
    // Baskerville (body serif).
    expect(css).toContain("Gotham");
    expect(css).toContain("Baskerville");
  });
});
