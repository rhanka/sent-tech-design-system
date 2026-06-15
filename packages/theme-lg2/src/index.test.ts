import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { lg2Theme } from "./index.js";

describe("lg2Theme", () => {
  it("maps the LG2 identity into the Sentropic contract", () => {
    expect(lg2Theme).toMatchObject({ id: "lg2", label: "LG2", mode: "light" });
    const css = compileTheme(lg2Theme);
    expect(css).toContain('[data-st-theme="lg2"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured LG2 brand colours in the compiled variables", () => {
    const css = compileTheme(lg2Theme);
    expect(css).toContain("--st-semantic-action-primary: #ff2300;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #111111;");
    expect(css).toContain("--st-semantic-action-danger: #d32f2f;");
  });

  it("emits the measured IBM Plex Mono monospace stack", () => {
    const css = compileTheme(lg2Theme);
    expect(css).toContain("monospace");
  });
});
