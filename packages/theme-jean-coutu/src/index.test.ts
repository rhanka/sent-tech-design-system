import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { jeanCoutuTheme } from "./index.js";

describe("jeanCoutuTheme", () => {
  it("maps the Jean Coutu identity into the Sentropic contract", () => {
    expect(jeanCoutuTheme).toMatchObject({ id: "jean-coutu", label: "Jean Coutu", mode: "light" });
    const css = compileTheme(jeanCoutuTheme);
    expect(css).toContain('[data-st-theme="jean-coutu"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Jean Coutu brand colours in the compiled variables", () => {
    const css = compileTheme(jeanCoutuTheme);
    expect(css).toContain("--st-semantic-action-primary: #ff3000;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #234b8d;");
    expect(css).toContain("--st-semantic-action-danger: #ff3000;");
  });

  it("emits the measured Figtree font", () => {
    const css = compileTheme(jeanCoutuTheme);
    expect(css).toContain("Figtree");
  });
});
