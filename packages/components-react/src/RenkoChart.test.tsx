import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RenkoChart } from "./RenkoChart.js";

const series = [
  { date: 0, close: 100 },
  { date: 1, close: 110 },
  { date: 2, close: 120 },
  { date: 3, close: 130 },
  { date: 4, close: 120 },
  { date: 5, close: 110 },
];

const bricks = (container: HTMLElement) => Array.from(container.querySelectorAll(".st-renkoChart__brick"));

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("RenkoChart", () => {
  it("renders an img role and bricks from the price series", () => {
    const { container } = render(<RenkoChart data={series} boxSize={10} label="Renko" />);
    expect(container.querySelector('[role="img"]')).toBeTruthy();
    expect(bricks(container).length).toBeGreaterThan(0);
  });

  it("forms one up-brick per box crossing on a rising series", () => {
    const { container } = render(
      <RenkoChart data={[{ date: 0, close: 100 }, { date: 1, close: 130 }]} boxSize={10} label="R" />,
    );
    expect(container.querySelectorAll(".st-renkoChart__brick--up").length).toBe(3);
  });

  it("colours descending bricks with the down tone", () => {
    const { container } = render(<RenkoChart data={series} boxSize={10} label="R" />);
    expect(container.querySelectorAll(".st-renkoChart__brick--down").length).toBeGreaterThan(0);
  });

  it("renders a graduated price (Y) axis with nice ticks", () => {
    const { container } = render(<RenkoChart data={series} boxSize={10} label="R" />);
    expect(container.querySelectorAll(".st-renkoChart__axis").length).toBe(2);
    expect(container.querySelectorAll(".st-renkoChart__tick").length).toBeGreaterThan(0);
  });

  it("lists every brick in the accessible data list", () => {
    const { container } = render(
      <RenkoChart data={[{ date: 0, close: 100 }, { date: 1, close: 110 }]} boxSize={10} label="R" />,
    );
    expect(listItems(container)[0]).toBe("▲ 100 → 110");
  });

  it("drops non-finite points before building bricks", () => {
    const { container } = render(
      <RenkoChart
        data={[
          { date: Number.NaN, close: 100 },
          { date: 0, close: Number.NaN },
          { date: 1, close: 100 },
          { date: 2, close: 120 },
        ]}
        boxSize={10}
        label="R"
      />,
    );
    expect(bricks(container).length).toBe(2);
  });

  it("merges a custom class onto the root", () => {
    const { container } = render(<RenkoChart data={series} className="mine" />);
    const root = container.querySelector(".st-renkoChart") as HTMLElement;
    expect(root.classList.contains("mine")).toBe(true);
  });
});
