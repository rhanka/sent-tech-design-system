import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { benevaTheme } from "./index.js";

describe("benevaTheme", () => {
  it("maps the Beneva identity into the Sentropic contract", () => {
    expect(benevaTheme).toMatchObject({ id: "beneva", label: "Beneva", mode: "light" });
    const css = compileTheme(benevaTheme);
    expect(css).toContain('[data-st-theme="beneva"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Beneva brand colours in the compiled variables", () => {
    const css = compileTheme(benevaTheme);
    expect(css).toContain("--st-semantic-action-primary: #00a651;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #0a3d22;");
    expect(css).toContain("--st-semantic-action-danger: #d72020;");
  });

  it("emits the measured Inter font", () => {
    const css = compileTheme(benevaTheme);
    expect(css).toContain("Inter");
  });
});
