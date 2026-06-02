import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { dsfrTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("dsfrTheme", () => {
  it("maps DSFR identity into the Sentropic contract", () => {
    expect(dsfrTheme).toMatchObject({
      id: "dsfr",
      label: "DSFR",
      mode: "light"
    });

    const css = compileTheme(dsfrTheme);
    expect(css).toContain('[data-st-theme="dsfr"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    expect(css).toContain("--st-field-style: filled-underline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = dsfrTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBorder: "#666666",
      hoverBackground: "#f6f6f6"
    });
    expect((component.selection as unknown as { toggleTrackWidth?: string; toggleTrackHeight?: string; toggleThumbSize?: string })).toMatchObject({
      toggleTrackWidth: "2.25rem",
      toggleTrackHeight: "1.25rem",
      toggleThumbSize: "1rem"
    });
  });
});
