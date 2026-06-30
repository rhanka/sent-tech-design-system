import { compileTheme } from "@sentropic/design-system-themes";
import type { createComponent } from "@sentropic/design-system-themes";
import { describe, expect, it } from "vitest";
import { databricksTheme } from "./index.js";

type ThemeComponent = ReturnType<typeof createComponent>;

describe("databricksTheme", () => {
  it("maps Databricks identity into the Sentropic contract", () => {
    expect(databricksTheme).toMatchObject({
      id: "databricks",
      label: "Databricks",
      mode: "light"
    });

    const css = compileTheme(databricksTheme);
    expect(css).toContain('[data-st-theme="databricks"]');
    expect(css).toContain("--st-component-control-hoverBackground:");
    expect(css).toContain("--st-component-control-hoverBorder:");
    expect(css).toContain("--st-component-selection-switchTrackChecked");
    // Databricks form fields are boxed & lightly rounded (outline), not filled-underline.
    expect(css).toContain("--st-field-style: outline;");
  });

  it("publishes expected anatomy for core control components", () => {
    const component = databricksTheme.tokens.component as ThemeComponent;
    expect(component.control).toMatchObject({
      background: "#ffffff",
      hoverBackground: "#f4f0e7"
    });
    expect(component.control.anatomy?.field).toMatchObject({
      style: "outline",
      fillBg: "#ffffff"
    });
    expect(component.tabs).toMatchObject({
      activeText: "#ff3621"
    });
  });

  it("emits Databricks brand colours and fonts in the compiled variables", () => {
    const css = compileTheme(databricksTheme);
    // Lava action + Navy text.
    expect(css).toContain("--st-semantic-action-primary: #ff3621;");
    expect(css).toContain("--st-semantic-text-primary: #1b3139;");
    // Deep-red danger and Navy dark inverse surface.
    expect(css).toContain("--st-semantic-action-danger: #c42b1c;");
    expect(css).toContain("--st-semantic-surface-inverse: #1b3139;");
    // Databricks brand typeface (DM Sans).
    expect(css).toContain("DM Sans");
  });
});
