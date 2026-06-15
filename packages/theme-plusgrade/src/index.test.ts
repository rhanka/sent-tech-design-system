import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { plusgradeTheme } from "./index.js";

describe("plusgradeTheme", () => {
  it("maps the Plusgrade identity into the Sentropic contract", () => {
    expect(plusgradeTheme).toMatchObject({ id: "plusgrade", label: "Plusgrade", mode: "light" });
    const css = compileTheme(plusgradeTheme);
    expect(css).toContain('[data-st-theme="plusgrade"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Plusgrade brand colours in the compiled variables", () => {
    const css = compileTheme(plusgradeTheme);
    expect(css).toContain("--st-semantic-action-primary: #ff5722;");
    expect(css).toContain("--st-semantic-text-primary: #000414;");
    expect(css).toContain("--st-semantic-surface-inverse: #000414;");
    expect(css).toContain("--st-semantic-action-danger: #d32f2f;");
  });

  it("emits the measured Inter grotesk font", () => {
    const css = compileTheme(plusgradeTheme);
    expect(css).toContain("Inter");
  });
});
