import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileTheme, compileThemeWithModes } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { devmtlTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

describe("devmtlTheme", () => {
  it("maps /dev/mtl identity into the Sentropic contract", () => {
    expect(devmtlTheme).toMatchObject({
      id: "devmtl",
      label: "/dev/mtl",
      mode: "light"
    });

    const css = compileTheme(devmtlTheme);
    expect(css).toContain('[data-st-theme="devmtl"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // /dev/mtl fields are boxed (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = devmtlTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f3f4fb"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.control.anatomy?.focus).toMatchObject({
      strategy: "outline",
      width: "3px",
      offset: "1px",
      color: "#e87432"
    });
    expect(component.button).toMatchObject({
      primaryBackground: "#01055e",
      primaryText: "#ffffff",
      secondaryBackground: "#ffffff",
      secondaryBorder: "#01055e",
      secondaryHoverBackground: "#f3f4fb",
      secondaryText: "#01055e",
      radius: "0.5rem"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#01055e"
    });
  });

  it("emits /dev/mtl brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(devmtlTheme);
    // Navy primary action, foreground body text, error danger, navy inverse.
    expect(css).toContain("--st-semantic-action-primary: #01055e;");
    expect(css).toContain("--st-semantic-text-primary: #1f2437;");
    expect(css).toContain("--st-semantic-action-danger: #dc2626;");
    expect(css).toContain("--st-semantic-surface-inverse: #01055e;");
    // Orange focus outline.
    expect(css).toContain("--st-foundation-focus-color: #e87432;");
    // /dev/mtl font stack.
    expect(css).toContain("Inter Variable");
    expect(css).toContain("Inter");
  });

  it("keeps css/devmtl.css up to date with src/index.ts", () => {
    const committed = readFileSync(join(packageRoot, "css", "devmtl.css"), "utf8");
    const generated = execFileSync(
      process.execPath,
      [join(packageRoot, "scripts", "build-css.mjs"), "--stdout"],
      { encoding: "utf8" }
    );
    const compiled = compileThemeWithModes(devmtlTheme, {
      selector: ':root, [data-theme="devmtl"], [data-st-theme="devmtl"]'
    });
    expect(committed).toBe(generated);
    expect(committed).toContain(compiled);
    expect(committed).toContain(':root, [data-theme="devmtl"], [data-st-theme="devmtl"] {');
    expect(committed).toContain("--st-foundation-color-blue-60: #01055e;");
    expect(committed).toContain("--st-semantic-action-primary: #01055e;");
    expect(committed).toContain("--st-component-button-primaryBackground: #01055e;");
  });
});
