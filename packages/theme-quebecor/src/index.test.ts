import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { quebecorTheme } from "./index.js";

describe("quebecorTheme", () => {
  it("maps the Quebecor identity into the Sentropic contract", () => {
    expect(quebecorTheme).toMatchObject({ id: "quebecor", label: "Quebecor", mode: "light" });
    const css = compileTheme(quebecorTheme);
    expect(css).toContain('[data-st-theme="quebecor"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Quebecor brand colours in the compiled variables", () => {
    const css = compileTheme(quebecorTheme);
    expect(css).toContain("--st-semantic-action-primary: #4d7fa7;");
    expect(css).toContain("--st-semantic-text-primary: #263238;");
    expect(css).toContain("--st-semantic-surface-inverse: #18364d;");
    expect(css).toContain("--st-semantic-action-danger: #c0392b;");
  });

  it("emits the measured Montserrat font", () => {
    const css = compileTheme(quebecorTheme);
    expect(css).toContain("Montserrat");
  });
});
