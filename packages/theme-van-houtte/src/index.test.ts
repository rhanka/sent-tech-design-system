import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { vanHoutteTheme } from "./index.js";

describe("vanHoutteTheme", () => {
  it("maps the Van Houtte identity into the Sentropic contract", () => {
    expect(vanHoutteTheme).toMatchObject({ id: "van-houtte", label: "Van Houtte", mode: "light" });
    const css = compileTheme(vanHoutteTheme);
    expect(css).toContain('[data-st-theme="van-houtte"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the Van Houtte brand colours in the compiled variables", () => {
    const css = compileTheme(vanHoutteTheme);
    expect(css).toContain("--st-semantic-action-primary: #9e1b32;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #1a1a1a;");
    expect(css).toContain("--st-semantic-action-danger: #c0392b;");
    expect(css).toContain("--st-semantic-surface-subtle: #f6f0e8;");
  });

  it("emits the Inter sans font", () => {
    const css = compileTheme(vanHoutteTheme);
    expect(css).toContain("Inter");
  });
});
