import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AreaRangeChart } from "./index.js";
import type { AreaRangeChartDatum } from "./AreaRangeChart.js";

const data: AreaRangeChartDatum[] = [
  { x: "Jan", low: -4, high: 3 },
  { x: "Avr", low: 5, high: 16 },
  { x: "Juil", low: 15, high: 28 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("AreaRangeChart", () => {
  it("renders a filled band (area path) and low/high lines", () => {
    const { container } = render(<AreaRangeChart label="Temps" data={data} />);
    const area = container.querySelector(".st-areaRangeChart__area");
    expect(area).toBeTruthy();
    expect(area?.getAttribute("d")).toBeTruthy();
    expect(area?.getAttribute("d")?.trim().endsWith("Z")).toBe(true);
    expect(area?.getAttribute("fill")).toContain("url(#st-arearangechart-gradient-");
    expect(container.querySelector(".st-areaRangeChart__line--high")).toBeTruthy();
    expect(container.querySelector(".st-areaRangeChart__line--low")).toBeTruthy();
  });

  it("renders two dots (low + high) per datum", () => {
    const { container } = render(<AreaRangeChart label="Temps" data={data} />);
    expect(container.querySelectorAll(".st-areaRangeChart__dot").length).toBe(6);
  });

  it("summarizes each range (low – high) in the accessible list", () => {
    const { container } = render(<AreaRangeChart label="Temps" data={data} />);
    expect(listItems(container)).toEqual(["Jan: -4 – 3", "Avr: 5 – 16", "Juil: 15 – 28"]);
  });

  it("normalizes inverted low/high (lo <= hi)", () => {
    const { container } = render(<AreaRangeChart label="Inv" data={[{ x: "X", low: 10, high: 2 }]} />);
    expect(listItems(container)).toEqual(["X: 2 – 10"]);
  });

  it("drops data with non-finite bounds", () => {
    const { container } = render(
      <AreaRangeChart label="NaN" data={[{ x: "A", low: NaN, high: 5 }, { x: "B", low: 1, high: 4 }]} />,
    );
    expect(listItems(container)).toEqual(["B: 1 – 4"]);
    expect(container.querySelectorAll(".st-areaRangeChart__dot").length).toBe(2);
  });

  it("applies the tone modifier class", () => {
    const { container } = render(<AreaRangeChart label="Tone" data={data} tone="category3" />);
    expect(container.querySelector(".st-areaRangeChart")?.className).toContain("st-areaRangeChart--category3");
  });
});
