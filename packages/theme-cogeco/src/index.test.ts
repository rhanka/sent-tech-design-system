import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { cogecoTheme } from "./index.js";

describe("cogecoTheme", () => {
  it("maps the Cogeco identity into the Sentropic contract", () => {
    expect(cogecoTheme).toMatchObject({ id: "cogeco", label: "Cogeco", mode: "light" });
    const css = compileTheme(cogecoTheme);
    expect(css).toContain('[data-st-theme="cogeco"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Cogeco brand colours in the compiled variables", () => {
    const css = compileTheme(cogecoTheme);
    expect(css).toContain("--st-semantic-action-primary: #001e62;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #001e62;");
    expect(css).toContain("--st-semantic-action-danger: #d72020;");
  });

  it("emits the inferred Inter sans font", () => {
    const css = compileTheme(cogecoTheme);
    expect(css).toContain("Inter");
  });
});
