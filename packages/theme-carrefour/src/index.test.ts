import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { carrefourTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("carrefourTheme", () => {
  it("maps the Carrefour brand identity into the Sentropic contract", () => {
    expect(carrefourTheme).toMatchObject({
      id: "carrefour",
      label: "Carrefour",
      mode: "light"
    });

    const css = compileTheme(carrefourTheme);
    expect(css).toContain('[data-st-theme="carrefour"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // `.c-base-input__container` is a white fill with four equal 1px borders:
    // a BOXED field, not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = carrefourTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f7f7f7"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#0864e6"
    });
  });

  it("emits Carrefour brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(carrefourTheme);
    // Action blue + brand near-black text.
    expect(css).toContain("--st-semantic-action-primary: #0970e6;");
    expect(css).toContain("--st-semantic-text-primary: #121212;");
    // Negative red danger and the near-black inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #df1116;");
    expect(css).toContain("--st-semantic-surface-inverse: #121212;");
    // Regression lock on EVERY font family present in the compiled output, not
    // only the display face. Measured brand faces first:
    expect(css).toContain("'Open Sans'"); // body,html{font-family:Open Sans,…}
    expect(css).toContain("'cf-body-fallback'"); // Carrefour's metric-matched body fallback
    expect(css).toContain("'Ubuntu'"); // h1..h6 + --ds-font-family
    expect(css).toContain("'cf-heading-fallback'"); // Carrefour's metric-matched heading fallback
    // …then every remaining family the compiled output emits, so a shifted
    // stack fails loudly instead of silently:
    for (const family of [
      "'SFMono-Regular'",
      "'Liberation Mono'",
      "'Courier New'",
      "'Helvetica Neue'",
      "'Segoe UI'",
      "-apple-system",
      "BlinkMacSystemFont",
      "Roboto",
      "Menlo",
      "Monaco",
      "Consolas",
      "monospace",
      "sans-serif"
    ]) {
      expect(css).toContain(family);
    }
  });

  it("locks every measured hex that carries a Sentropic role", () => {
    const css = compileTheme(carrefourTheme);
    // Action / interactive family.
    expect(css).toContain("--st-semantic-action-primaryHover: #004e9b;");
    expect(css).toContain("--st-semantic-action-primaryText: #ffffff;");
    expect(css).toContain("--st-semantic-border-interactive: #0970e6;");
    expect(css).toContain("--st-semantic-text-link: #0970e6;");
    // Neutral ramp.
    expect(css).toContain("--st-semantic-surface-default: #ffffff;");
    expect(css).toContain("--st-semantic-surface-subtle: #f7f7f7;");
    expect(css).toContain("--st-semantic-text-secondary: #454545;");
    expect(css).toContain("--st-semantic-text-muted: #575757;");
    expect(css).toContain("--st-semantic-border-subtle: #d9d9d9;");
    expect(css).toContain("--st-semantic-border-strong: #878787;");
    // The measured modal backdrop (#121212 at 50%), the key most often shipped
    // without provenance.
    expect(css).toContain("--st-semantic-surface-overlay: rgb(18 18 18 / 0.5);");
    // Functional family.
    expect(css).toContain("--st-semantic-feedback-success: #2c815e;");
    expect(css).toContain("--st-semantic-feedback-warning: #8a5f00;");
    expect(css).toContain("--st-semantic-feedback-info: #173eb4;");
    // Measured focus technique: a 2px outline in the action blue, 2px offset.
    expect(css).toContain("--st-focus-strategy: outline;");
    expect(css).toContain("--st-focus-color: #0970e6;");
  });
});
