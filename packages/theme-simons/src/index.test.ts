import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { simonsTheme } from "./index.js";

describe("simonsTheme", () => {
  it("maps the Simons identity into the Sentropic contract", () => {
    expect(simonsTheme).toMatchObject({ id: "simons", label: "Simons", mode: "light" });
    const css = compileTheme(simonsTheme);
    expect(css).toContain('[data-st-theme="simons"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Simons brand colours in the compiled variables", () => {
    const css = compileTheme(simonsTheme);
    expect(css).toContain("--st-semantic-action-primary: #010101;");
    expect(css).toContain("--st-semantic-text-primary: #404040;");
    expect(css).toContain("--st-semantic-surface-inverse: #010101;");
    expect(css).toContain("--st-semantic-action-danger: #b3001b;");
  });

  it("emits the measured Times serif font", () => {
    const css = compileTheme(simonsTheme);
    expect(css).toContain("Times New Roman");
  });
});
