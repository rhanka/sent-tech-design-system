import { describe, it, expect } from "vitest";
import { compileTheme } from "@sentropic/design-system-themes";
import { laurentianBankTheme } from "./index.js";

describe("laurentianBankTheme", () => {
  it("maps the Laurentian Bank identity into the Sentropic contract", () => {
    expect(laurentianBankTheme).toMatchObject({ id: "laurentian-bank", label: "Banque Laurentienne", mode: "light" });
    const css = compileTheme(laurentianBankTheme);
    expect(css).toContain('[data-st-theme="laurentian-bank"]');
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes the measured Laurentian brand colours in the compiled variables", () => {
    const css = compileTheme(laurentianBankTheme);
    expect(css).toContain("--st-semantic-action-primary: #0068b8;");
    expect(css).toContain("--st-semantic-text-primary: #1a1a1a;");
    expect(css).toContain("--st-semantic-surface-inverse: #003054;");
    expect(css).toContain("--st-semantic-action-danger: #d72020;");
  });

  it("emits the measured Verdana system sans font", () => {
    const css = compileTheme(laurentianBankTheme);
    expect(css).toContain("Verdana");
  });
});
