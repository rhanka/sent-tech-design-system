import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const style = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");
const marker = "Checkbox vertical centring (2026-11-09)";
const blockIndex = style.indexOf(marker);
const tail = blockIndex < 0 ? "" : style.slice(blockIndex);

describe("Checkbox — vertical centring block", () => {
  it("is appended after the base choice rules so it wins the cascade", () => {
    expect(blockIndex).toBeGreaterThanOrEqual(0);
    expect(blockIndex).toBeGreaterThan(style.indexOf("margin: 0.125rem 0 0;"));
  });

  it("is scoped to .st-choice--checkbox (Radio keeps its own offset)", () => {
    expect(tail).toContain(".st-choice--checkbox {");
    expect(tail).toContain(".st-choice--checkbox .st-choice__input");
    expect(tail).toContain(".st-choice--checkbox .st-choice__trailing");
    expect(tail).toContain(".st-choice--checkbox .st-choice__help");
    expect(tail).not.toContain("--radio");
  });

  it("carries the label typography on the row so 1lh is one label line", () => {
    expect(tail).toContain(
      "font-size: var(--st-component-selection-choiceLabelFontSize, 0.9375rem);",
    );
    expect(tail).toContain(
      "line-height: var(--st-component-selection-choiceLabelLineHeight, normal);",
    );
  });

  it("offsets the 1rem box by half the difference between one label line and its height", () => {
    expect(tail).toContain("font: inherit;");
    // Fallback first for engines without the lh unit, then the exact offset.
    expect(tail).toContain("margin: 0.125rem 0 0;");
    expect(tail).toContain("margin: calc((1lh - 1rem) / 2) 0 0;");
  });

  it("keeps the trailing slot one label line high and helper text off the label line height", () => {
    expect(tail).toContain("height: 1lh;");
    expect(tail).toContain("line-height: normal;");
  });
});
