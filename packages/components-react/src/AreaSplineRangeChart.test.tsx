import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AreaSplineRangeChart } from "./AreaSplineRangeChart.js";
import type { AreaSplineRangeChartDatum } from "./AreaSplineRangeChart.js";

const data: AreaSplineRangeChartDatum[] = [
  { x: "Jan", low: -4, high: 3 },
  { x: "Avr", low: 5, high: 16 },
  { x: "Juil", low: 15, high: 28 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("AreaSplineRangeChart", () => {
  it("renders a filled band (area path) and low/high lines", () => {
    const { container } = render(<AreaSplineRangeChart label="Temps" data={data} />);
    const area = container.querySelector(".st-areaSplineRangeChart__area");
    expect(area).toBeTruthy();
    expect(area?.getAttribute("d")).toBeTruthy();
    expect(area?.getAttribute("d")?.trim().endsWith("Z")).toBe(true);
    expect(area?.getAttribute("fill")).toContain("url(#st-areasplinerangechart-gradient-");
    expect(container.querySelector(".st-areaSplineRangeChart__line--high")).toBeTruthy();
    expect(container.querySelector(".st-areaSplineRangeChart__line--low")).toBeTruthy();
  });

  it("always smooths contours (cubic Bézier in high/low/area paths)", () => {
    const { container } = render(<AreaSplineRangeChart label="Spline" data={data} />);
    expect(container.querySelector(".st-areaSplineRangeChart__line--high")?.getAttribute("d")).toContain("C");
    expect(container.querySelector(".st-areaSplineRangeChart__line--low")?.getAttribute("d")).toContain("C");
    expect(container.querySelector(".st-areaSplineRangeChart__area")?.getAttribute("d")).toContain("C");
  });

  it("renders two dots (low + high) per datum", () => {
    const { container } = render(<AreaSplineRangeChart label="Temps" data={data} />);
    expect(container.querySelectorAll(".st-areaSplineRangeChart__dot").length).toBe(6);
  });

  it("summarizes each range (low – high) in the accessible list", () => {
    const { container } = render(<AreaSplineRangeChart label="Temps" data={data} />);
    expect(listItems(container)).toEqual(["Jan: -4 – 3", "Avr: 5 – 16", "Juil: 15 – 28"]);
  });

  it("normalizes inverted low/high (lo <= hi)", () => {
    const { container } = render(<AreaSplineRangeChart label="Inv" data={[{ x: "X", low: 10, high: 2 }]} />);
    expect(listItems(container)).toEqual(["X: 2 – 10"]);
  });

  it("drops data with non-finite bounds", () => {
    const { container } = render(
      <AreaSplineRangeChart label="NaN" data={[{ x: "A", low: NaN, high: 5 }, { x: "B", low: 1, high: 4 }]} />,
    );
    expect(listItems(container)).toEqual(["B: 1 – 4"]);
    expect(container.querySelectorAll(".st-areaSplineRangeChart__dot").length).toBe(2);
  });

  it("applies the tone modifier class", () => {
    const { container } = render(<AreaSplineRangeChart label="Tone" data={data} tone="category3" />);
    expect(container.querySelector(".st-areaSplineRangeChart")?.classList.contains("st-areaSplineRangeChart--category3")).toBe(true);
  });

  it("shows tooltip on pointer move and hides on leave", () => {
    const { container } = render(<AreaSplineRangeChart label="Interactive" data={data} />);
    expect(screen.queryByRole("presentation")).toBeNull();

    const dots = container.querySelectorAll(".st-areaSplineRangeChart__dot");
    fireEvent.pointerMove(dots[2]);
    expect(screen.getByRole("presentation")).toBeTruthy();
    expect(screen.getAllByText("Avr").length).toBeGreaterThan(0);
    expect(screen.getAllByText("5 – 16").length).toBeGreaterThan(0);

    fireEvent.pointerLeave(container.querySelector(".st-areaSplineRangeChart__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });
});
