import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VariablePieChart } from "./VariablePieChart.js";
import type { VariablePieChartDatum } from "./VariablePieChart.js";

const data: VariablePieChartDatum[] = [
  { label: "Alpha", value: 40, z: 10 },
  { label: "Bravo", value: 25, z: 30 },
  { label: "Charlie", value: 20, z: 20 },
  { label: "Delta", value: 15, z: 50 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("VariablePieChart", () => {
  it("renders one sector per positive datum with role=img", () => {
    const { container } = render(<VariablePieChart label="Ventes" data={data} />);
    expect(screen.getByRole("img", { name: "Ventes" })).toBeTruthy();
    expect(container.querySelectorAll(".st-variablePieChart__sector").length).toBe(4);
  });

  it("summarizes label and value in the accessible list", () => {
    const { container } = render(<VariablePieChart label="Ventes" data={data} />);
    expect(listItems(container)).toEqual(["Alpha: 40", "Bravo: 25", "Charlie: 20", "Delta: 15"]);
  });

  it("drops data with non-finite or non-positive value", () => {
    const { container } = render(
      <VariablePieChart
        label="NaN"
        data={[
          { label: "A", value: NaN, z: 5 },
          { label: "B", value: -3, z: 5 },
          { label: "C", value: 10, z: 5 },
        ]}
      />,
    );
    expect(listItems(container)).toEqual(["C: 10"]);
    expect(container.querySelectorAll(".st-variablePieChart__sector").length).toBe(1);
  });

  it("maps radius by z: larger z yields a larger sector radius", () => {
    const { container } = render(
      <VariablePieChart
        label="Radius"
        data={[
          { label: "Small", value: 50, z: 1 },
          { label: "Big", value: 50, z: 100 },
        ]}
      />,
    );
    const paths = Array.from(container.querySelectorAll<SVGPathElement>(".st-variablePieChart__sector"));
    const radiusOf = (p: SVGPathElement) => {
      const m = p.getAttribute("d")?.match(/A ([\d.]+) /);
      return m ? Number(m[1]) : 0;
    };
    expect(radiusOf(paths[1])).toBeGreaterThan(radiusOf(paths[0]));
  });

  it("applies the category tone class per sector", () => {
    const { container } = render(
      <VariablePieChart label="Tone" data={[{ label: "X", value: 1, z: 1, tone: "category5" }]} />,
    );
    expect(
      container
        .querySelector(".st-variablePieChart__sector")
        ?.classList.contains("st-variablePieChart__sector--category5"),
    ).toBe(true);
  });

  it("renders empty without crashing for an empty dataset", () => {
    const { container } = render(<VariablePieChart label="Empty" data={[]} />);
    expect(container.querySelectorAll(".st-variablePieChart__sector").length).toBe(0);
    expect(listItems(container)).toEqual([]);
  });

  it("shows, updates, and hides tooltip on interactions", () => {
    const { container } = render(<VariablePieChart label="Interactive" data={data} />);

    expect(screen.queryByRole("presentation")).toBeNull();

    const sectors = container.querySelectorAll(".st-variablePieChart__sector");
    fireEvent.pointerMove(sectors[1]);

    expect(screen.getByRole("presentation")).toBeTruthy();
    expect(screen.getAllByText("Bravo").length).toBeGreaterThan(0);

    fireEvent.pointerLeave(container.querySelector(".st-variablePieChart__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });
});
