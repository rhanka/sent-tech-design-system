import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Stepper from "./Stepper.svelte";

const dir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(dir, "Stepper.svelte"), "utf8");
const style = (/<style>([\s\S]*?)<\/style>/.exec(source)?.[1] ?? "").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

function cssBlock(selector: string): string {
  const start = style.indexOf(`${selector} {`);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  const end = style.indexOf("}", start);
  return style.slice(start, end);
}

describe("Stepper — horizontal & vertical connector alignment", () => {
  it("aligns the horizontal indicator to flex-start and sizes the last step to its content", () => {
    const indicator = cssBlock(".st-stepper--horizontal .st-stepper__indicator");
    expect(indicator).toContain("justify-content: flex-start;");

    const lastStep = cssBlock(".st-stepper--horizontal .st-stepper__step:last-child");
    expect(lastStep).toContain("flex: 0 0 auto;");

    const lastStepCapped = cssBlock(
      ".st-stepper--horizontal .st-stepper__step:last-child:not(:first-child)",
    );
    expect(lastStepCapped).toContain("max-width: 40%;");
  });

  it("drops the double-counted margin offsets on horizontal and vertical connectors", () => {
    const hConnector = cssBlock(".st-stepper--horizontal .st-stepper__connector");
    expect(hConnector).toContain("height: 2px;");
    expect(hConnector).not.toContain("margin-top");

    const vConnector = cssBlock(".st-stepper--vertical .st-stepper__connector");
    expect(vConnector).toContain("width: 2px;");
    expect(vConnector).not.toContain("margin-left");
  });

  it("wraps long labels within their column without overlapping neighbours", () => {
    const text = cssBlock(".st-stepper--horizontal .st-stepper__text");
    expect(text).toContain("box-sizing: border-box;");
    expect(text).toContain("max-width: 100%;");

    expect(cssBlock(".st-stepper__label")).toContain("overflow-wrap: anywhere;");
    expect(cssBlock(".st-stepper__description")).toContain("overflow-wrap: anywhere;");
  });

  it("renders connectors on all steps except the last in a 4-step horizontal poll", () => {
    const { container } = render(Stepper, {
      props: {
        current: 1,
        steps: [
          { label: "Contexte" },
          { label: "Participants" },
          { label: "Questions" },
          { label: "Publication" },
        ],
      },
    });
    const steps = container.querySelectorAll(".st-stepper__step");
    expect(steps.length).toBe(4);
    expect(steps[0].querySelector(".st-stepper__connector")).toBeTruthy();
    expect(steps[1].querySelector(".st-stepper__connector")).toBeTruthy();
    expect(steps[2].querySelector(".st-stepper__connector")).toBeTruthy();
    expect(steps[3].querySelector(".st-stepper__connector")).toBeNull();
  });
});
