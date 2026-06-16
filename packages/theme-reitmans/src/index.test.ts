import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { reitmansTheme } from "./index.js";

describe("reitmansTheme", () => {
  it("maps the Reitmans identity into the Sentropic contract", () => {
    expect(reitmansTheme).toMatchObject({ id: "reitmans", label: "Reitmans", mode: "light" });
    const css = compileTheme(reitmansTheme);
    expect(css).toContain('[data-st-theme="reitmans"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Reitmans brand colours in the compiled variables", () => {
    const css = compileTheme(reitmansTheme);
    expect(css).toContain("--st-semantic-action-primary: #e70404;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #1a1a1a;");
    expect(css).toContain("--st-semantic-action-danger: #e70404;");
    expect(css).toContain("--st-semantic-surface-subtle: #f8f3ec;");
  });

  it("emits the measured Suisse Int'l → Inter substitute font", () => {
    const css = compileTheme(reitmansTheme);
    expect(css).toContain("Inter");
  });
});
