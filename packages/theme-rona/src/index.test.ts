import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { ronaTheme } from "./index.js";

describe("ronaTheme", () => {
  it("maps the RONA identity into the Sentropic contract", () => {
    expect(ronaTheme).toMatchObject({ id: "rona", label: "RONA", mode: "light" });
    const css = compileTheme(ronaTheme);
    expect(css).toContain('[data-st-theme="rona"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured RONA brand colours in the compiled variables", () => {
    const css = compileTheme(ronaTheme);
    expect(css).toContain("--st-semantic-action-primary: #0046AD;");
    expect(css).toContain("--st-semantic-text-primary: #111827;");
    expect(css).toContain("--st-semantic-surface-inverse: #111827;");
    expect(css).toContain("--st-semantic-action-danger: #d32f2f;");
  });

  it("emits the measured Roboto font", () => {
    const css = compileTheme(ronaTheme);
    expect(css).toContain("Roboto");
  });
});
