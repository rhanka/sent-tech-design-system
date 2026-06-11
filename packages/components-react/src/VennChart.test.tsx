import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VennChart } from "./VennChart.js";
import type { VennChartArea } from "./VennChart.js";

const data: VennChartArea[] = [
  { sets: ["A"], value: 10 },
  { sets: ["B"], value: 8 },
  { sets: ["A", "B"], value: 3 },
];

const data3: VennChartArea[] = [
  { sets: ["A"], value: 12 },
  { sets: ["B"], value: 9 },
  { sets: ["C"], value: 7 },
  { sets: ["A", "B"], value: 4 },
  { sets: ["A", "C"], value: 3 },
  { sets: ["B", "C"], value: 2 },
  { sets: ["A", "B", "C"], value: 1 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("VennChart", () => {
  it("renders one circle per set with role=img (2 sets)", () => {
    const { container } = render(<VennChart label="Overlap" data={data} />);
    expect(screen.getByRole("img", { name: "Overlap" })).toBeTruthy();
    expect(container.querySelectorAll(".st-vennChart__circle").length).toBe(2);
  });

  it("renders three circles for a 3-set diagram", () => {
    const { container } = render(<VennChart label="Triple" data={data3} />);
    expect(container.querySelectorAll(".st-vennChart__circle").length).toBe(3);
  });

  it("summarizes each area (sets → value) in the accessible list", () => {
    const { container } = render(<VennChart label="Overlap" data={data} />);
    expect(listItems(container)).toEqual(["A: 10", "B: 8", "A ∩ B: 3"]);
  });

  it("labels intersection regions with their value", () => {
    const { container } = render(<VennChart label="Overlap" data={data} />);
    const values = Array.from(container.querySelectorAll(".st-vennChart__value")).map((n) => n.textContent?.trim());
    expect(values).toEqual(["3"]);
  });

  it("renders the set name labels", () => {
    const { container } = render(<VennChart label="Overlap" data={data} />);
    const labels = Array.from(container.querySelectorAll(".st-vennChart__label")).map((n) => n.textContent?.trim());
    expect(labels).toEqual(["A", "B"]);
  });

  it("maps radius by total set size (sqrt scaling): larger total yields a larger circle", () => {
    const { container } = render(
      <VennChart
        label="Radius"
        data={[
          { sets: ["Small"], value: 1 },
          { sets: ["Big"], value: 100 },
          { sets: ["Small", "Big"], value: 1 },
        ]}
      />,
    );
    const circles = Array.from(container.querySelectorAll<SVGCircleElement>(".st-vennChart__circle"));
    const r0 = Number(circles[0].getAttribute("r"));
    const r1 = Number(circles[1].getAttribute("r"));
    expect(r1).toBeGreaterThan(r0);
  });

  it("applies a category tone class per circle", () => {
    const { container } = render(<VennChart label="Tone" data={data} />);
    const circles = container.querySelectorAll(".st-vennChart__circle");
    expect(circles[0].classList.contains("st-vennChart__circle--category1")).toBe(true);
    expect(circles[1].classList.contains("st-vennChart__circle--category2")).toBe(true);
  });

  it("renders empty without crashing for an empty dataset", () => {
    const { container } = render(<VennChart label="Empty" data={[]} />);
    expect(container.querySelectorAll(".st-vennChart__circle").length).toBe(0);
    expect(listItems(container)).toEqual([]);
  });

  it("shows, updates, and hides tooltip on interactions", () => {
    const { container } = render(<VennChart label="Interactive" data={data} />);

    expect(screen.queryByRole("presentation")).toBeNull();

    const circles = container.querySelectorAll(".st-vennChart__circle");
    fireEvent.pointerMove(circles[1]);

    expect(screen.getByRole("presentation")).toBeTruthy();
    expect(container.querySelector(".st-vennChart__tooltipLabel")?.textContent).toBe("B");

    fireEvent.pointerLeave(container.querySelector(".st-vennChart__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });
});
