import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { energirTheme } from "./index.js";

describe("energirTheme", () => {
  it("maps the Énergir identity into the Sentropic contract", () => {
    expect(energirTheme).toMatchObject({ id: "energir", label: "Énergir", mode: "light" });
    const css = compileTheme(energirTheme);
    expect(css).toContain('[data-st-theme="energir"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Énergir brand colours in the compiled variables", () => {
    const css = compileTheme(energirTheme);
    expect(css).toContain("--st-semantic-action-primary: #0047bb;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #002855;");
    expect(css).toContain("--st-semantic-action-danger: #d72020;");
  });

  it("emits the measured Arial font", () => {
    const css = compileTheme(energirTheme);
    expect(css).toContain("Arial");
  });
});
