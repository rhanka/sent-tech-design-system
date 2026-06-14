import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PointAndFigureChart } from "./PointAndFigureChart.js";

const series = [
  { date: 0, close: 100 },
  { date: 1, close: 110 },
  { date: 2, close: 120 },
  { date: 3, close: 130 },
  { date: 4, close: 100 },
  { date: 5, close: 90 },
];

const marks = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-pointAndFigureChart__mark"));

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("PointAndFigureChart", () => {
  it("renders an img role and X/O marks from the price series", () => {
    const { container } = render(<PointAndFigureChart data={series} boxSize={10} reversal={3} label="P&F" />);
    expect(container.querySelector('[role="img"]')).toBeTruthy();
    expect(marks(container).length).toBeGreaterThan(0);
  });

  it("draws X marks for the rising column", () => {
    const { container } = render(
      <PointAndFigureChart data={[{ date: 0, close: 100 }, { date: 1, close: 130 }]} boxSize={10} reversal={3} label="P" />,
    );
    expect(container.querySelectorAll(".st-pointAndFigureChart__mark--x").length).toBeGreaterThan(0);
  });

  it("switches to a column of O marks after a reversal", () => {
    const { container } = render(<PointAndFigureChart data={series} boxSize={10} reversal={3} label="P" />);
    expect(container.querySelectorAll(".st-pointAndFigureChart__mark--o").length).toBeGreaterThan(0);
  });

  it("renders a graduated price (Y) axis with nice ticks", () => {
    const { container } = render(<PointAndFigureChart data={series} boxSize={10} reversal={3} label="P" />);
    expect(container.querySelectorAll(".st-pointAndFigureChart__axis").length).toBe(2);
    expect(container.querySelectorAll(".st-pointAndFigureChart__tick").length).toBeGreaterThan(0);
  });

  it("lists every column in the accessible data list", () => {
    const { container } = render(
      <PointAndFigureChart data={[{ date: 0, close: 100 }, { date: 1, close: 130 }]} boxSize={10} reversal={3} label="P" />,
    );
    expect(listItems(container).length).toBeGreaterThan(0);
    expect(listItems(container)[0]?.startsWith("X")).toBe(true);
  });

  it("drops non-finite points before building columns", () => {
    const { container } = render(
      <PointAndFigureChart
        data={[
          { date: Number.NaN, close: 100 },
          { date: 0, close: Number.NaN },
          { date: 1, close: 100 },
          { date: 2, close: 130 },
        ]}
        boxSize={10}
        reversal={3}
        label="P"
      />,
    );
    expect(marks(container).length).toBeGreaterThan(0);
  });

  it("merges a custom class onto the root", () => {
    const { container } = render(<PointAndFigureChart data={series} className="mine" />);
    const root = container.querySelector(".st-pointAndFigureChart") as HTMLElement;
    expect(root.classList.contains("mine")).toBe(true);
  });
});
