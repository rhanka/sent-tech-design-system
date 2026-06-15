import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { eidosMontrealTheme } from "./index.js";

describe("eidosMontrealTheme", () => {
  it("maps the Eidos-Montréal identity into the Sentropic contract", () => {
    expect(eidosMontrealTheme).toMatchObject({ id: "eidos-montreal", label: "Eidos-Montréal", mode: "light" });
    const css = compileTheme(eidosMontrealTheme);
    expect(css).toContain('[data-st-theme="eidos-montreal"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Eidos-Montréal brand colours in the compiled variables", () => {
    const css = compileTheme(eidosMontrealTheme);
    expect(css).toContain("--st-semantic-action-primary: #e8552d;");
    expect(css).toContain("--st-semantic-text-primary: #1d1d1d;");
    expect(css).toContain("--st-semantic-surface-inverse: #1a1a1a;");
    expect(css).toContain("--st-semantic-action-danger: #d32f2f;");
  });

  it("emits the measured Inter studio grotesk font", () => {
    const css = compileTheme(eidosMontrealTheme);
    expect(css).toContain("Inter");
  });
});
