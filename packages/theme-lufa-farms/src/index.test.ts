import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { lufaFarmsTheme } from "./index.js";

describe("lufaFarmsTheme", () => {
  it("maps the Lufa Farms identity into the Sentropic contract", () => {
    expect(lufaFarmsTheme).toMatchObject({ id: "lufa-farms", label: "Lufa Farms", mode: "light" });
    const css = compileTheme(lufaFarmsTheme);
    expect(css).toContain('[data-st-theme="lufa-farms"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the inferred Lufa Farms brand colours in the compiled variables", () => {
    const css = compileTheme(lufaFarmsTheme);
    expect(css).toContain("--st-semantic-action-primary: #6cb33f;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #1a1a1a;");
    expect(css).toContain("--st-semantic-action-danger: #d72020;");
  });

  it("emits the inferred Inter sans font", () => {
    const css = compileTheme(lufaFarmsTheme);
    expect(css).toContain("Inter");
  });
});
