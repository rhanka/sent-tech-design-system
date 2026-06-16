import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { stHubertTheme } from "./index.js";

describe("stHubertTheme", () => {
  it("maps the St-Hubert identity into the Sentropic contract", () => {
    expect(stHubertTheme).toMatchObject({ id: "st-hubert", label: "St-Hubert", mode: "light" });
    const css = compileTheme(stHubertTheme);
    expect(css).toContain('[data-st-theme="st-hubert"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the St-Hubert brand colours in the compiled variables", () => {
    const css = compileTheme(stHubertTheme);
    expect(css).toContain("--st-semantic-action-primary: #e2231a;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #1a1a1a;");
    expect(css).toContain("--st-semantic-action-danger: #e2231a;");
  });

  it("emits the St-Hubert Inter sans font", () => {
    const css = compileTheme(stHubertTheme);
    expect(css).toContain("Inter");
  });
});
