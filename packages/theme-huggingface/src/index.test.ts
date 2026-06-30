import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { huggingfaceTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("huggingfaceTheme", () => {
  it("maps Hugging Face identity into the Sentropic contract", () => {
    expect(huggingfaceTheme).toMatchObject({
      id: "huggingface",
      label: "Hugging Face",
      mode: "light"
    });

    const css = compileTheme(huggingfaceTheme);
    expect(css).toContain('[data-st-theme="huggingface"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // HF form fields are boxed & rounded (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = huggingfaceTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f3f4f6"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#101828"
    });
  });

  it("emits Hugging Face brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(huggingfaceTheme);
    // HF brand yellow action + dark gray primary text.
    expect(css).toContain("--st-semantic-action-primary: #ffd21e;");
    expect(css).toContain("--st-semantic-text-primary: #101828;");
    // HF error red and dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #e7000b;");
    expect(css).toContain("--st-semantic-surface-inverse: #101828;");
    // HF font families (Source Sans Pro body/display, IBM Plex Mono code).
    expect(css).toContain("Source Sans Pro");
    expect(css).toContain("IBM Plex Mono");
  });
});
