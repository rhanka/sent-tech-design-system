import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import AreaSplineRangeChart from "./lib/AreaSplineRangeChart.svelte";
import type { AreaSplineRangeChartDatum } from "./lib/AreaSplineRangeChart.svelte";

const data: AreaSplineRangeChartDatum[] = [
  { x: "Jan", low: -4, high: 3 },
  { x: "Avr", low: 5, high: 16 },
  { x: "Juil", low: 15, high: 28 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("AreaSplineRangeChart", () => {
  it("renders a filled band (closed area path) and low/high lines", () => {
    const { container } = render(AreaSplineRangeChart, { props: { label: "Temps", data } });

    expect(screen.getByRole("img", { name: "Temps" })).toBeTruthy();

    const area = container.querySelector(".st-areaSplineRangeChart__area");
    expect(area).toBeTruthy();
    expect(area?.getAttribute("d")).toBeTruthy();
    expect(area?.getAttribute("d")?.trim().endsWith("Z")).toBe(true);
    expect(area?.getAttribute("fill")).toContain("url(#st-areasplinerangechart-gradient-");

    expect(container.querySelector(".st-areaSplineRangeChart__line--high")).toBeTruthy();
    expect(container.querySelector(".st-areaSplineRangeChart__line--low")).toBeTruthy();
  });

  it("always smooths contours (cubic Bézier in high/low/area paths)", () => {
    const { container } = render(AreaSplineRangeChart, { props: { label: "Spline", data } });
    const high = container.querySelector(".st-areaSplineRangeChart__line--high");
    const low = container.querySelector(".st-areaSplineRangeChart__line--low");
    const area = container.querySelector(".st-areaSplineRangeChart__area");
    expect(high?.getAttribute("d")).toContain("C");
    expect(low?.getAttribute("d")).toContain("C");
    expect(area?.getAttribute("d")).toContain("C");
  });

  it("renders two dots (low + high) per datum", () => {
    const { container } = render(AreaSplineRangeChart, { props: { label: "Temps", data } });
    expect(container.querySelectorAll(".st-areaSplineRangeChart__dot").length).toBe(6);
  });

  it("summarizes each range (low – high) in the accessible list", () => {
    const { container } = render(AreaSplineRangeChart, { props: { label: "Temps", data } });
    expect(listItems(container)).toEqual(["Jan: -4 – 3", "Avr: 5 – 16", "Juil: 15 – 28"]);
  });

  it("normalizes inverted low/high (lo <= hi)", () => {
    const { container } = render(AreaSplineRangeChart, {
      props: { label: "Inv", data: [{ x: "X", low: 10, high: 2 }] },
    });
    expect(listItems(container)).toEqual(["X: 2 – 10"]);
  });

  it("drops data with non-finite bounds", () => {
    const { container } = render(AreaSplineRangeChart, {
      props: { label: "NaN", data: [{ x: "A", low: NaN, high: 5 }, { x: "B", low: 1, high: 4 }] },
    });
    expect(listItems(container)).toEqual(["B: 1 – 4"]);
    expect(container.querySelectorAll(".st-areaSplineRangeChart__dot").length).toBe(2);
  });

  it("applies the tone modifier class", () => {
    const { container } = render(AreaSplineRangeChart, { props: { label: "Tone", data, tone: "category3" } });
    expect(container.querySelector(".st-areaSplineRangeChart")?.classList.contains("st-areaSplineRangeChart--category3")).toBe(true);
  });

  it("shows, updates, and hides tooltip on interactions", async () => {
    const { container } = render(AreaSplineRangeChart, { props: { label: "Interactive", data } });

    expect(screen.queryByRole("presentation")).toBeNull();

    const dots = container.querySelectorAll(".st-areaSplineRangeChart__dot");
    await fireEvent.pointerMove(dots[2]); // second datum (Avr) high dot

    const tooltip = screen.getByRole("presentation");
    expect(tooltip).toBeTruthy();
    expect(screen.getAllByText("Avr").length).toBeGreaterThan(0);
    expect(screen.getAllByText("5 – 16").length).toBeGreaterThan(0);

    await fireEvent.pointerLeave(container.querySelector(".st-areaSplineRangeChart__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });
});
