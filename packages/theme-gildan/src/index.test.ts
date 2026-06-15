import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { gildanTheme } from "./index.js";

describe("gildanTheme", () => {
  it("maps the Gildan identity into the Sentropic contract", () => {
    expect(gildanTheme).toMatchObject({ id: "gildan", label: "Gildan", mode: "light" });
    const css = compileTheme(gildanTheme);
    expect(css).toContain('[data-st-theme="gildan"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Gildan brand colours in the compiled variables", () => {
    const css = compileTheme(gildanTheme);
    expect(css).toContain("--st-semantic-action-primary: #003087;");
    expect(css).toContain("--st-semantic-text-primary: #313131;");
    expect(css).toContain("--st-semantic-surface-inverse: #00205a;");
    expect(css).toContain("--st-semantic-action-danger: #c0392b;");
  });

  it("emits the measured Inter sans font", () => {
    const css = compileTheme(gildanTheme);
    expect(css).toContain("Inter");
  });
});
