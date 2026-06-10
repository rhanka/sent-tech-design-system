import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import AreaRangeChart from "./lib/AreaRangeChart.svelte";
import type { AreaRangeChartDatum } from "./lib/AreaRangeChart.svelte";

const data: AreaRangeChartDatum[] = [
  { x: "Jan", low: -4, high: 3 },
  { x: "Avr", low: 5, high: 16 },
  { x: "Juil", low: 15, high: 28 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("AreaRangeChart", () => {
  it("renders a filled band (closed area path) and low/high lines", () => {
    const { container } = render(AreaRangeChart, { props: { label: "Temps", data } });

    expect(screen.getByRole("img", { name: "Temps" })).toBeTruthy();

    const area = container.querySelector(".st-areaRangeChart__area");
    expect(area).toBeTruthy();
    expect(area?.getAttribute("d")).toBeTruthy();
    expect(area?.getAttribute("d")?.trim().endsWith("Z")).toBe(true);
    expect(area?.getAttribute("fill")).toContain("url(#st-arearangechart-gradient-");

    expect(container.querySelector(".st-areaRangeChart__line--high")).toBeTruthy();
    expect(container.querySelector(".st-areaRangeChart__line--low")).toBeTruthy();
  });

  it("renders two dots (low + high) per datum", () => {
    const { container } = render(AreaRangeChart, { props: { label: "Temps", data } });
    expect(container.querySelectorAll(".st-areaRangeChart__dot").length).toBe(6);
  });

  it("summarizes each range (low – high) in the accessible list", () => {
    const { container } = render(AreaRangeChart, { props: { label: "Temps", data } });
    expect(listItems(container)).toEqual(["Jan: -4 – 3", "Avr: 5 – 16", "Juil: 15 – 28"]);
  });

  it("normalizes inverted low/high (lo <= hi)", () => {
    const { container } = render(AreaRangeChart, {
      props: { label: "Inv", data: [{ x: "X", low: 10, high: 2 }] },
    });
    expect(listItems(container)).toEqual(["X: 2 – 10"]);
  });

  it("drops data with non-finite bounds", () => {
    const { container } = render(AreaRangeChart, {
      props: { label: "NaN", data: [{ x: "A", low: NaN, high: 5 }, { x: "B", low: 1, high: 4 }] },
    });
    expect(listItems(container)).toEqual(["B: 1 – 4"]);
    expect(container.querySelectorAll(".st-areaRangeChart__dot").length).toBe(2);
  });

  it("applies the tone modifier class", () => {
    const { container } = render(AreaRangeChart, { props: { label: "Tone", data, tone: "category3" } });
    expect(container.querySelector(".st-areaRangeChart")?.className).toContain("st-areaRangeChart--category3");
  });

  it("shows, updates, and hides tooltip on interactions", async () => {
    const { container } = render(AreaRangeChart, { props: { label: "Interactive", data } });

    expect(screen.queryByRole("presentation")).toBeNull();

    const dots = container.querySelectorAll(".st-areaRangeChart__dot");
    await fireEvent.pointerMove(dots[2]); // second datum (Avr) high dot

    const tooltip = screen.getByRole("presentation");
    expect(tooltip).toBeTruthy();
    expect(screen.getAllByText("Avr").length).toBeGreaterThan(0);
    expect(screen.getAllByText("5 – 16").length).toBeGreaterThan(0);

    await fireEvent.pointerLeave(container.querySelector(".st-areaRangeChart__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });
});
