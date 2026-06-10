import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ColumnRangeChart } from "./index.js";
import type { ColumnRangeChartDatum } from "./ColumnRangeChart.js";

const data: ColumnRangeChartDatum[] = [
  { category: "Jan", low: -4, high: 3 },
  { category: "Avr", low: 5, high: 16 },
  { category: "Juil", low: 15, high: 28 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("ColumnRangeChart", () => {
  it("renders one range bar per datum", () => {
    const { container } = render(<ColumnRangeChart label="Temps" data={data} />);
    expect(container.querySelectorAll(".st-columnRangeChart__bar").length).toBe(3);
  });

  it("summarizes each range (low – high) in the accessible list", () => {
    const { container } = render(<ColumnRangeChart label="Temps" data={data} />);
    expect(listItems(container)).toEqual(["Jan: -4 – 3", "Avr: 5 – 16", "Juil: 15 – 28"]);
  });

  it("normalizes inverted low/high (lo <= hi)", () => {
    const { container } = render(
      <ColumnRangeChart label="Inv" data={[{ category: "X", low: 10, high: 2 }]} />,
    );
    expect(listItems(container)).toEqual(["X: 2 – 10"]);
    expect(container.querySelectorAll(".st-columnRangeChart__bar").length).toBe(1);
  });

  it("drops data with non-finite bounds", () => {
    const { container } = render(
      <ColumnRangeChart label="NaN" data={[{ category: "A", low: NaN, high: 5 }, { category: "B", low: 1, high: 4 }]} />,
    );
    expect(container.querySelectorAll(".st-columnRangeChart__bar").length).toBe(1);
    expect(listItems(container)).toEqual(["B: 1 – 4"]);
  });
});
