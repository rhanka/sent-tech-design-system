import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DivergentBarChart } from "./index.js";

describe("DivergentBarChart parity with Svelte", () => {
  const data = [
    { label: "Quality", value: 42 },
    { label: "Risk", value: -18 },
    { label: "Neutral", value: 0 },
    { label: "Invalid", value: Number.NaN },
  ];

  it("renders divergent bars around a zero axis and exposes data values", () => {
    const { container } = render(<DivergentBarChart label="Sentiment" data={data} />);

    expect(container.querySelector(".st-divergentBarChart")).toBeTruthy();
    expect(container.querySelector(".st-divergentBarChart__visual")?.getAttribute("aria-label")).toBe("Sentiment");
    expect(container.querySelector(".st-divergentBarChart__zeroAxis")).toBeTruthy();
    expect(container.querySelectorAll(".st-divergentBarChart__bar")).toHaveLength(3);
    expect(container.querySelector(".st-divergentBarChart__bar--positive")).toBeTruthy();
    expect(container.querySelector(".st-divergentBarChart__bar--negative")).toBeTruthy();
    expect(container.querySelector(".st-divergentBarChart__bar--zero")).toBeTruthy();
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "Quality: 42",
      "Risk: -18",
      "Neutral: 0",
    ]);
  });

  it("places negative bars left of positive bars", () => {
    const { container } = render(<DivergentBarChart label="Balance" data={data} />);
    const positive = container.querySelector('[data-chart-key="Quality"]') as SVGRectElement;
    const negative = container.querySelector('[data-chart-key="Risk"]') as SVGRectElement;

    expect(Number(negative.getAttribute("x"))).toBeLessThan(Number(positive.getAttribute("x")));
    expect(Number(negative.getAttribute("width"))).toBeGreaterThan(0);
    expect(Number(positive.getAttribute("width"))).toBeGreaterThan(0);
  });

  it("shows a tooltip on pointer move over a bar", () => {
    const { container } = render(<DivergentBarChart label="Tooltip" data={data} />);
    fireEvent.pointerMove(container.querySelector(".st-divergentBarChart__bar")!);
    expect(container.querySelector(".st-divergentBarChart__tooltip")).toBeTruthy();
  });
});
