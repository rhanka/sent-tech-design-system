import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { sonderTheme } from "./index.js";

describe("sonderTheme", () => {
  it("maps the Sonder identity into the Sentropic contract", () => {
    expect(sonderTheme).toMatchObject({ id: "sonder", label: "Sonder", mode: "light" });
    const css = compileTheme(sonderTheme);
    expect(css).toContain('[data-st-theme="sonder"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Sonder brand colours in the compiled variables", () => {
    const css = compileTheme(sonderTheme);
    expect(css).toContain("--st-semantic-action-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #1a1a1a;");
    expect(css).toContain("--st-semantic-action-danger: #c0392b;");
    // The signature warm cream surface (Sonder's measured theme-color).
    expect(css).toContain("--st-semantic-surface-subtle: #f7f3ea;");
  });

  it("emits the measured Inter grotesk font", () => {
    const css = compileTheme(sonderTheme);
    expect(css).toContain("Inter");
  });
});
