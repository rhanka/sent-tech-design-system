import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { gameloftTheme } from "./index.js";

describe("gameloftTheme", () => {
  it("maps the Gameloft identity into the Sentropic contract", () => {
    expect(gameloftTheme).toMatchObject({ id: "gameloft", label: "Gameloft", mode: "light" });
    const css = compileTheme(gameloftTheme);
    expect(css).toContain('[data-st-theme="gameloft"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Gameloft brand colours in the compiled variables", () => {
    const css = compileTheme(gameloftTheme);
    expect(css).toContain("--st-semantic-action-primary: #0095f3;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #1a1a1a;");
    expect(css).toContain("--st-semantic-action-danger: #e02424;");
  });

  it("emits the measured Montserrat font", () => {
    const css = compileTheme(gameloftTheme);
    expect(css).toContain("Montserrat");
  });
});
