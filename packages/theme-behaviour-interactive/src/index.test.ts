import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { behaviourInteractiveTheme } from "./index.js";

describe("behaviourInteractiveTheme", () => {
  it("maps the Behaviour Interactive identity into the Sentropic contract", () => {
    expect(behaviourInteractiveTheme).toMatchObject({ id: "behaviour-interactive", label: "Behaviour Interactive", mode: "light" });
    const css = compileTheme(behaviourInteractiveTheme);
    expect(css).toContain('[data-st-theme="behaviour-interactive"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Behaviour brand colours in the compiled variables", () => {
    const css = compileTheme(behaviourInteractiveTheme);
    expect(css).toContain("--st-semantic-action-primary: #cc0000;");
    expect(css).toContain("--st-semantic-text-primary: #000000;");
    expect(css).toContain("--st-semantic-surface-inverse: #161616;");
    expect(css).toContain("--st-semantic-action-danger: #cc0000;");
  });

  it("emits the measured Inter font", () => {
    const css = compileTheme(behaviourInteractiveTheme);
    expect(css).toContain("Inter");
  });
});
