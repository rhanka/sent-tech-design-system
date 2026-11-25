import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const style = readFileSync(resolve("src/styles.css"), "utf8");

function cssBlock(selector: string): string {
  const start = style.indexOf(`${selector} {`);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  const end = style.indexOf("}", start);
  return style.slice(start, end);
}

describe("Stepper — horizontal & vertical connector alignment", () => {
  it("aligns the horizontal indicator to flex-start and sizes the last step to its content", () => {
    expect(cssBlock(".st-stepper--horizontal .st-stepper__indicator")).toContain(
      "justify-content: flex-start;",
    );
    expect(cssBlock(".st-stepper--horizontal .st-stepper__step:last-child")).toContain(
      "flex: 0 0 auto;",
    );
    expect(
      cssBlock(".st-stepper--horizontal .st-stepper__step:last-child:not(:first-child)"),
    ).toContain("max-width: 40%;");
  });

  it("drops the double-counted margin offsets on horizontal and vertical connectors", () => {
    const hConnector = cssBlock(".st-stepper--horizontal .st-stepper__connector");
    expect(hConnector).toContain("height: 2px;");
    expect(hConnector).not.toContain("margin-top");

    const vConnector = cssBlock(".st-stepper--vertical .st-stepper__connector");
    expect(vConnector).toContain("width: 2px;");
    expect(vConnector).not.toContain("margin-left");
  });

  it("wraps long labels within their column", () => {
    const text = cssBlock(".st-stepper--horizontal .st-stepper__text");
    expect(text).toContain("box-sizing: border-box;");
    expect(text).toContain("max-width: 100%;");
    expect(cssBlock(".st-stepper__label")).toContain("overflow-wrap: anywhere;");
    expect(cssBlock(".st-stepper__description")).toContain("overflow-wrap: anywhere;");
  });
});
