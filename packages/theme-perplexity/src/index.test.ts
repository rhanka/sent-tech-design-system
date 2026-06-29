import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { perplexityTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("perplexityTheme", () => {
  it("maps Perplexity identity into the Sentropic contract", () => {
    expect(perplexityTheme).toMatchObject({ id: "perplexity", label: "Perplexity" });

    const css = compileTheme(perplexityTheme);
    expect(css).toContain('[data-st-theme="perplexity"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes core control anatomy", () => {
    const component = perplexityTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: expect.any(String),
      hoverBackground: expect.any(String)
    });
    expect(component.control.anatomy?.field).toMatchObject({ style: "outline" });
  });

  it("emits brand colour vars and fonts in the compiled output", () => {
    const css = compileTheme(perplexityTheme);
    expect(css).toContain("--st-semantic-action-primary:");
    expect(css).toContain("--st-semantic-text-primary:");
    expect(css).toContain("--st-semantic-action-danger:");
    expect(css).toContain("--st-semantic-surface-inverse:");
    expect(css).toContain("FK Grotesk Neue");
  });
});
