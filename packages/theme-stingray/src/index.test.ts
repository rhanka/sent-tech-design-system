import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { stingrayTheme } from "./index.js";

describe("stingrayTheme", () => {
  it("maps the Stingray identity into the Sentropic contract", () => {
    expect(stingrayTheme).toMatchObject({ id: "stingray", label: "Stingray", mode: "light" });
    const css = compileTheme(stingrayTheme);
    expect(css).toContain('[data-st-theme="stingray"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the identity-derived Stingray brand colours in the compiled variables", () => {
    const css = compileTheme(stingrayTheme);
    expect(css).toContain("--st-semantic-action-primary: #ee3e38;");
    expect(css).toContain("--st-semantic-text-primary: #1a2b3c;");
    expect(css).toContain("--st-semantic-surface-inverse: #1a2b3c;");
    expect(css).toContain("--st-semantic-action-danger: #d32f2f;");
  });

  it("emits the clean modern Inter sans font", () => {
    const css = compileTheme(stingrayTheme);
    expect(css).toContain("Inter");
  });
});
