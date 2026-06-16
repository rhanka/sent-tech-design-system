import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { hydroQuebecTheme } from "./index.js";

describe("hydroQuebecTheme", () => {
  it("maps the Hydro-Québec identity into the Sentropic contract", () => {
    expect(hydroQuebecTheme).toMatchObject({ id: "hydro-quebec", label: "Hydro-Québec", mode: "light" });
    const css = compileTheme(hydroQuebecTheme);
    expect(css).toContain('[data-st-theme="hydro-quebec"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Hydro-Québec brand colours in the compiled variables", () => {
    const css = compileTheme(hydroQuebecTheme);
    expect(css).toContain("--st-semantic-action-primary: #0f096c;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #0f096c;");
    expect(css).toContain("--st-semantic-action-danger: #d72020;");
  });

  it("emits the measured Inter sans font", () => {
    const css = compileTheme(hydroQuebecTheme);
    expect(css).toContain("Inter");
  });
});
