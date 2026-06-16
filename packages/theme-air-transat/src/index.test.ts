import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { airTransatTheme } from "./index.js";

describe("airTransatTheme", () => {
  it("maps the Air Transat identity into the Sentropic contract", () => {
    expect(airTransatTheme).toMatchObject({ id: "air-transat", label: "Air Transat", mode: "light" });
    const css = compileTheme(airTransatTheme);
    expect(css).toContain('[data-st-theme="air-transat"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Air Transat brand colours in the compiled variables", () => {
    const css = compileTheme(airTransatTheme);
    expect(css).toContain("--st-semantic-action-primary: #005eba;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #002855;");
    expect(css).toContain("--st-semantic-action-danger: #d72020;");
  });

  it("emits the measured Inter sans substitute font", () => {
    const css = compileTheme(airTransatTheme);
    expect(css).toContain("Inter");
  });
});
