import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { cossetteTheme } from "./index.js";

describe("cossetteTheme", () => {
  it("maps the Cossette identity into the Sentropic contract", () => {
    expect(cossetteTheme).toMatchObject({ id: "cossette", label: "Cossette", mode: "light" });
    const css = compileTheme(cossetteTheme);
    expect(css).toContain('[data-st-theme="cossette"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Cossette brand colours in the compiled variables", () => {
    const css = compileTheme(cossetteTheme);
    expect(css).toContain("--st-semantic-action-primary: #ffee00;");
    expect(css).toContain("--st-semantic-text-primary: #111111;");
    expect(css).toContain("--st-semantic-surface-inverse: #111111;");
    expect(css).toContain("--st-semantic-action-danger: #d32f2f;");
  });

  it("emits the measured Helvetica Neue agency grotesk font", () => {
    const css = compileTheme(cossetteTheme);
    expect(css).toContain("Helvetica");
  });
});
