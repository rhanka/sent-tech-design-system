import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Angular styles", () => {
  it("matches the React package byte-for-byte", () => {
    const angular = readFileSync(resolve("src/styles.css"), "utf8");
    const react = readFileSync(resolve("../components-react/src/styles.css"), "utf8");

    expect(angular).toBe(react);
  });

  it("does not introduce raw hex colors after the GeoMap block starts", () => {
    const styles = readFileSync(resolve("src/styles.css"), "utf8");
    const geoMapStart = styles.indexOf(".st-geoMap {");

    expect(geoMapStart).toBeGreaterThanOrEqual(0);
    expect(styles.slice(geoMapStart)).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it("wires the Icon stroke width and colour to the theme tokens, inside the st-icon layer", () => {
    const styles = readFileSync(resolve("src/styles.css"), "utf8");
    const icon = readFileSync(resolve("src/Icon.ts"), "utf8");

    expect(styles).toContain(
      [
        "@layer st-icon {",
        '  :where(.st-icon[stroke-width="2.25"]:not([data-st-icon-stroke])) {',
        "    stroke-width: var(--st-component-icon-strokeWidth, 2.25);",
        "  }",
        "",
        '  :where(.st-icon[stroke="currentColor"]) {',
        "    stroke: var(--st-component-icon-color, currentColor);",
        "  }",
        "}",
      ].join("\n"),
    );
    // Declared once: no unlayered copy that would beat layered consumer CSS.
    expect(styles.split("var(--st-component-icon-strokeWidth, 2.25)").length - 1).toBe(1);
    expect(styles.split("var(--st-component-icon-color, currentColor)").length - 1).toBe(1);
    // An explicit strokeWidth input is marked so the token rule leaves it alone.
    expect(icon).toContain(`[attr.data-st-icon-stroke]="strokeWidth == null ? null : 'prop'"`);
  });
});
