import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DumbbellChart } from "./index.js";
import type { DumbbellChartDatum } from "./DumbbellChart.js";

const data: DumbbellChartDatum[] = [
  { category: "Ingénierie", low: 62, high: 78 },
  { category: "Design", low: 54, high: 69 },
  { category: "Ventes", low: 50, high: 72 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("DumbbellChart", () => {
  it("renders a connector line per category", () => {
    const { container } = render(<DumbbellChart label="Salaires" data={data} />);
    expect(container.querySelectorAll(".st-dumbbellChart__connector").length).toBe(3);
  });

  it("renders two dots (low + high) per category", () => {
    const { container } = render(<DumbbellChart label="Salaires" data={data} />);
    expect(container.querySelectorAll(".st-dumbbellChart__dot").length).toBe(6);
    expect(container.querySelectorAll(".st-dumbbellChart__dot--low").length).toBe(3);
    expect(container.querySelectorAll(".st-dumbbellChart__dot--high").length).toBe(3);
  });

  it("summarizes each range (low – high) in the accessible list", () => {
    const { container } = render(<DumbbellChart label="Salaires" data={data} />);
    expect(listItems(container)).toEqual(["Ingénierie: 62 – 78", "Design: 54 – 69", "Ventes: 50 – 72"]);
  });

  it("normalizes inverted low/high (lo <= hi)", () => {
    const { container } = render(<DumbbellChart label="Inv" data={[{ category: "X", low: 10, high: 2 }]} />);
    expect(listItems(container)).toEqual(["X: 2 – 10"]);
  });

  it("drops data with non-finite bounds", () => {
    const { container } = render(
      <DumbbellChart label="NaN" data={[{ category: "A", low: NaN, high: 5 }, { category: "B", low: 1, high: 4 }]} />,
    );
    expect(listItems(container)).toEqual(["B: 1 – 4"]);
    expect(container.querySelectorAll(".st-dumbbellChart__dot").length).toBe(2);
  });

  it("applies the low/high tone classes to the dots", () => {
    const { container } = render(<DumbbellChart label="Tone" data={data} lowTone="category3" highTone="category5" />);
    expect(container.querySelector(".st-dumbbellChart__dot--low")?.classList.contains("st-dumbbellChart__dot--category3")).toBe(true);
    expect(container.querySelector(".st-dumbbellChart__dot--high")?.classList.contains("st-dumbbellChart__dot--category5")).toBe(true);
  });

  it("renders a legend with the low/high labels", () => {
    const { getByText } = render(<DumbbellChart label="Legend" data={data} lowLabel="2019" highLabel="2024" />);
    expect(getByText("2019")).toBeTruthy();
    expect(getByText("2024")).toBeTruthy();
  });
});
