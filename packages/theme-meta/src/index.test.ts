import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { metaTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("metaTheme", () => {
  it("maps Meta AI identity into the Sentropic contract", () => {
    expect(metaTheme).toMatchObject({
      id: "meta",
      label: "Meta AI",
      mode: "light"
    });

    const css = compileTheme(metaTheme);
    expect(css).toContain('[data-st-theme="meta"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Meta form fields are boxed & rounded (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = metaTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#e4e6eb"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#0064e0"
    });
  });

  it("emits Meta brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(metaTheme);
    // Meta Blue action + Meta Gray text.
    expect(css).toContain("--st-semantic-action-primary: #0064e0;");
    expect(css).toContain("--st-semantic-text-primary: #1c2b33;");
    // Meta red danger and dark inverse surface (Meta Gray).
    expect(css).toContain("--st-semantic-action-danger: #e41e3f;");
    expect(css).toContain("--st-semantic-surface-inverse: #1c2b33;");
    // Meta custom font families (Optimistic Display / Optimistic Text).
    expect(css).toContain("Optimistic Display");
    expect(css).toContain("Optimistic Text");
  });
});
