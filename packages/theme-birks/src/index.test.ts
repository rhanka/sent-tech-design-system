import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { birksTheme } from "./index.js";

describe("birksTheme", () => {
  it("maps the Birks identity into the Sentropic contract", () => {
    expect(birksTheme).toMatchObject({ id: "birks", label: "Maison Birks", mode: "light" });
    const css = compileTheme(birksTheme);
    expect(css).toContain('[data-st-theme="birks"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Birks brand colours in the compiled variables", () => {
    const css = compileTheme(birksTheme);
    expect(css).toContain("--st-semantic-action-primary: #00558c;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #1a1a1a;");
    expect(css).toContain("--st-semantic-action-danger: #c0392b;");
  });

  it("emits the measured Inter substitute font", () => {
    const css = compileTheme(birksTheme);
    expect(css).toContain("Inter");
  });
});
