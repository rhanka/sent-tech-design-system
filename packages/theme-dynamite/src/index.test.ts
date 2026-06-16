import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { dynamiteTheme } from "./index.js";

describe("dynamiteTheme", () => {
  it("maps the Dynamite identity into the Sentropic contract", () => {
    expect(dynamiteTheme).toMatchObject({ id: "dynamite", label: "Dynamite", mode: "light" });
    const css = compileTheme(dynamiteTheme);
    expect(css).toContain('[data-st-theme="dynamite"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the inferred Dynamite brand colours in the compiled variables", () => {
    const css = compileTheme(dynamiteTheme);
    expect(css).toContain("--st-semantic-action-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #1a1a1a;");
    expect(css).toContain("--st-semantic-action-danger: #c0392b;");
  });

  it("emits the inferred Inter sans font", () => {
    const css = compileTheme(dynamiteTheme);
    expect(css).toContain("Inter");
  });
});
