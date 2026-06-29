import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { openaiTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("openaiTheme", () => {
  it("maps OpenAI identity into the Sentropic contract", () => {
    expect(openaiTheme).toMatchObject({ id: "openai", label: "OpenAI" });

    const css = compileTheme(openaiTheme);
    expect(css).toContain('[data-st-theme="openai"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    // OpenAI form fields are minimal boxed inputs (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes core control anatomy", () => {
    const component = openaiTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: expect.any(String),
      hoverBackground: expect.any(String)
    });
    expect(component.control.anatomy?.field).toMatchObject({ style: "outline" });
  });

  it("emits brand colour vars and fonts in the compiled output", () => {
    const css = compileTheme(openaiTheme);
    expect(css).toContain("--st-semantic-action-primary:");
    expect(css).toContain("--st-semantic-text-primary:");
    expect(css).toContain("--st-semantic-action-danger:");
    expect(css).toContain("--st-semantic-surface-inverse:");
    expect(css).toContain("OpenAI Sans");
  });
});
