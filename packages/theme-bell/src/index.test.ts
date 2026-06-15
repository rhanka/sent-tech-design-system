import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { bellTheme } from "./index.js";

describe("bellTheme", () => {
  it("maps the Bell identity into the Sentropic contract", () => {
    expect(bellTheme).toMatchObject({ id: "bell", label: "Bell", mode: "light" });
    const css = compileTheme(bellTheme);
    expect(css).toContain('[data-st-theme="bell"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Bell brand colours in the compiled variables", () => {
    const css = compileTheme(bellTheme);
    expect(css).toContain("--st-semantic-action-primary: #0070CE;");
    expect(css).toContain("--st-semantic-text-primary: #1d1d1b;");
    expect(css).toContain("--st-semantic-surface-inverse: #003078;");
    expect(css).toContain("--st-semantic-action-danger: #d72020;");
  });

  it("emits the measured Inter font", () => {
    const css = compileTheme(bellTheme);
    expect(css).toContain("Inter");
  });
});
