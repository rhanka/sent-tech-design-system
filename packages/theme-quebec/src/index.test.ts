import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { quebecTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("quebecTheme", () => {
  it("maps SDG (Gouvernement du Québec) identity into the Sentropic contract", () => {
    expect(quebecTheme).toMatchObject({
      id: "quebec",
      label: "Gouvernement du Québec",
      mode: "light"
    });

    const css = compileTheme(quebecTheme);
    expect(css).toContain('[data-st-theme="quebec"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // SDG champs : style "outline" (pas de filled-underline).
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = quebecTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f1f1f2"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#095797"
    });
  });

  it("emits SDG brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(quebecTheme);
    // Bleu PIV (action primaire) et texte primaire SDG.
    expect(css).toContain("--st-semantic-action-primary: #095797;");
    expect(css).toContain("--st-semantic-text-primary: #1c2025;");
    // Danger rouge SDG et surface inverse (bandeau foncé).
    expect(css).toContain("--st-semantic-action-danger: #cb381f;");
    expect(css).toContain("--st-semantic-surface-inverse: #223654;");
    // Police Open Sans (SDG : titres ET corps).
    expect(css).toContain("Open Sans");
  });
});
