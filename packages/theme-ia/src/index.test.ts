import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { iaTheme } from "./index.js";

describe("iaTheme", () => {
  it("maps the iA identity into the Sentropic contract", () => {
    expect(iaTheme).toMatchObject({ id: "ia", label: "iA Groupe financier", mode: "light" });
    const css = compileTheme(iaTheme);
    expect(css).toContain('[data-st-theme="ia"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured iA brand colours in the compiled variables", () => {
    const css = compileTheme(iaTheme);
    expect(css).toContain("--st-semantic-action-primary: #064dd9;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #064dd9;");
    expect(css).toContain("--st-semantic-action-danger: #cc0000;");
  });

  it("emits the measured Verdana corporate font", () => {
    const css = compileTheme(iaTheme);
    expect(css).toContain("Verdana");
  });
});
