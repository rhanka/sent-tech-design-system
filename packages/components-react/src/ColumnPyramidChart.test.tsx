import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ColumnPyramidChart } from "./ColumnPyramidChart.js";
import type { ColumnPyramidChartDatum } from "./ColumnPyramidChart.js";

// ColumnPyramidChart : colonnes triangulaires (base sur l'axe X, sommet à la valeur).
const data: ColumnPyramidChartDatum[] = [
  { category: "Q1", value: 40, tone: "category1" },
  { category: "Q2", value: 25, tone: "category2" },
  { category: "Q3", value: 60, tone: "category3" },
  { category: "Q4", value: 15, tone: "category4" },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("ColumnPyramidChart", () => {
  it("renders one triangular polygon per datum with role=img", () => {
    const { container } = render(<ColumnPyramidChart label="Ventes" data={data} />);
    expect(screen.getByRole("img", { name: "Ventes" })).toBeTruthy();
    expect(container.querySelectorAll(".st-columnPyramidChart__column").length).toBe(4);
  });

  it("draws each column as a triangle: 3 points, base on the X axis, apex centred at the value", () => {
    const { container } = render(<ColumnPyramidChart label="Ventes" data={data} />);
    const cols = container.querySelectorAll<SVGPolygonElement>(".st-columnPyramidChart__column");
    const pts = cols[0].getAttribute("points")?.trim().split(/\s+/) ?? [];
    expect(pts.length).toBe(3);
    const coords = pts.map((p) => p.split(",").map(Number));
    const [baseLeft, baseRight, apex] = coords;
    expect(baseLeft[1]).toBeCloseTo(baseRight[1]);
    expect(apex[1]).toBeLessThan(baseLeft[1]);
    expect(apex[0]).toBeCloseTo((baseLeft[0] + baseRight[0]) / 2);
  });

  it("makes a larger value reach a higher apex (smaller apex Y)", () => {
    const { container } = render(<ColumnPyramidChart label="Ventes" data={data} />);
    const cols = container.querySelectorAll<SVGPolygonElement>(".st-columnPyramidChart__column");
    const apexY = (el: SVGPolygonElement) =>
      Number(el.getAttribute("points")?.trim().split(/\s+/)[2].split(",")[1]);
    expect(apexY(cols[2])).toBeLessThan(apexY(cols[3]));
  });

  it("applies the category tone class per column", () => {
    const { container } = render(<ColumnPyramidChart label="Tone" data={data} />);
    const cols = container.querySelectorAll(".st-columnPyramidChart__column");
    expect(cols[0].classList.contains("st-columnPyramidChart__column--category1")).toBe(true);
    expect(cols[2].classList.contains("st-columnPyramidChart__column--category3")).toBe(true);
  });

  it("falls back to the component-level tone when a datum has none", () => {
    const { container } = render(
      <ColumnPyramidChart label="Tone" tone="category5" data={[{ category: "X", value: 10 }]} />,
    );
    expect(
      container
        .querySelector(".st-columnPyramidChart__column")
        ?.classList.contains("st-columnPyramidChart__column--category5"),
    ).toBe(true);
  });

  it("summarizes category and value in the accessible list", () => {
    const { container } = render(<ColumnPyramidChart label="Ventes" data={data} />);
    expect(listItems(container)).toEqual(["Q1: 40", "Q2: 25", "Q3: 60", "Q4: 15"]);
  });

  it("drops data with non-finite or non-positive value", () => {
    const { container } = render(
      <ColumnPyramidChart
        label="Filtré"
        data={[
          { category: "A", value: NaN },
          { category: "B", value: -3 },
          { category: "C", value: 0 },
          { category: "D", value: 12 },
        ]}
      />,
    );
    expect(listItems(container)).toEqual(["D: 12"]);
    expect(container.querySelectorAll(".st-columnPyramidChart__column").length).toBe(1);
  });

  it("renders empty without crashing for an empty dataset", () => {
    const { container } = render(<ColumnPyramidChart label="Empty" data={[]} />);
    expect(container.querySelectorAll(".st-columnPyramidChart__column").length).toBe(0);
    expect(listItems(container)).toEqual([]);
  });

  it("shows, updates, and hides tooltip on interactions", () => {
    const { container } = render(<ColumnPyramidChart label="Interactive" data={data} />);

    expect(screen.queryByRole("presentation")).toBeNull();

    const cols = container.querySelectorAll(".st-columnPyramidChart__column");
    fireEvent.pointerMove(cols[2]);

    expect(screen.getByRole("presentation")).toBeTruthy();
    expect(screen.getAllByText("Q3").length).toBeGreaterThan(0);

    fireEvent.pointerLeave(container.querySelector(".st-columnPyramidChart__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });
});
