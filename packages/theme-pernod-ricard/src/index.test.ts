import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { pernodRicardTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("pernodRicardTheme", () => {
  it("maps Pernod Ricard identity into the Sentropic contract", () => {
    expect(pernodRicardTheme).toMatchObject({
      id: "pernod-ricard",
      label: "Pernod Ricard",
      mode: "light"
    });

    const css = compileTheme(pernodRicardTheme);
    expect(css).toContain('[data-st-theme="pernod-ricard"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Pernod Ricard form fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = pernodRicardTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f9f8f7"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    // Active tab underline = the bright interactive blue.
    expect(component.tabs).toMatchObject({
      activeText: "#0057d9"
    });
  });

  it("emits Pernod Ricard brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(pernodRicardTheme);
    // Corporate navy action + warm-slate primary text.
    expect(css).toContain("--st-semantic-action-primary: #0c294e;");
    expect(css).toContain("--st-semantic-text-primary: #222d38;");
    // Rust error and inverse navy surface.
    expect(css).toContain("--st-semantic-action-danger: #d05428;");
    expect(css).toContain("--st-semantic-surface-inverse: #0c294e;");
    // Pernod Ricard font families (Weave display, Noto Sans body).
    expect(css).toContain("Noto Sans");
    expect(css).toContain("Weave");
  });
});
