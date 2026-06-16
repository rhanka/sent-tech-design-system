import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { agropurTheme } from "./index.js";

describe("agropurTheme", () => {
  it("maps the Agropur identity into the Sentropic contract", () => {
    expect(agropurTheme).toMatchObject({ id: "agropur", label: "Agropur", mode: "light" });
    const css = compileTheme(agropurTheme);
    expect(css).toContain('[data-st-theme="agropur"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Agropur brand colours in the compiled variables", () => {
    const css = compileTheme(agropurTheme);
    expect(css).toContain("--st-semantic-action-primary: #162f53;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #162f53;");
    expect(css).toContain("--st-semantic-action-danger: #d72020;");
  });

  it("emits the measured Inter (Maax substitute) font", () => {
    const css = compileTheme(agropurTheme);
    expect(css).toContain("Inter");
  });
});
