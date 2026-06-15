import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { laVieEnRoseTheme } from "./index.js";

describe("laVieEnRoseTheme", () => {
  it("maps the La Vie en Rose identity into the Sentropic contract", () => {
    expect(laVieEnRoseTheme).toMatchObject({ id: "la-vie-en-rose", label: "La Vie en Rose", mode: "light" });
    const css = compileTheme(laVieEnRoseTheme);
    expect(css).toContain('[data-st-theme="la-vie-en-rose"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured La Vie en Rose brand colours in the compiled variables", () => {
    const css = compileTheme(laVieEnRoseTheme);
    expect(css).toContain("--st-semantic-action-primary: #d4667c;");
    expect(css).toContain("--st-semantic-text-primary: #404040;");
    expect(css).toContain("--st-semantic-surface-inverse: #212121;");
    expect(css).toContain("--st-semantic-action-danger: #c0203a;");
  });

  it("emits the measured Roboto font", () => {
    const css = compileTheme(laVieEnRoseTheme);
    expect(css).toContain("Roboto");
  });
});
