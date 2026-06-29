import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { githubTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("githubTheme", () => {
  it("maps GitHub (Primer) identity into the Sentropic contract", () => {
    expect(githubTheme).toMatchObject({ id: "github", label: "GitHub" });

    const css = compileTheme(githubTheme);
    expect(css).toContain('[data-st-theme="github"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    // Primer inputs are boxed (outline) with a 6px radius.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes core control anatomy", () => {
    const component = githubTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: expect.any(String),
      hoverBackground: expect.any(String)
    });
    expect(component.control.anatomy?.field).toMatchObject({ style: "outline" });
  });

  it("emits brand colour vars and fonts in the compiled output", () => {
    const css = compileTheme(githubTheme);
    expect(css).toContain("--st-semantic-action-primary:");
    expect(css).toContain("--st-semantic-text-primary:");
    expect(css).toContain("--st-semantic-action-danger:");
    expect(css).toContain("--st-semantic-surface-inverse:");
    expect(css).toContain("Mona Sans");
  });
});
