import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import AreaChart from "./lib/AreaChart.svelte";
import BarChart, { type BarChartDatum } from "./lib/BarChart.svelte";
import DonutChart, { type DonutChartDatum } from "./lib/DonutChart.svelte";
import LineChart from "./lib/LineChart.svelte";
import StackedBarChart, { type StackedBarDatum } from "./lib/StackedBarChart.svelte";

// FR-2 — uniform data labels across every series chart. Same behaviour, classes
// and assertions in react / svelte / vue (strict tri-framework parity).

const bars: BarChartDatum[] = [
  { label: "A", value: 4 },
  { label: "B", value: 8 },
  { label: "C", value: 2 }
];

const donut: DonutChartDatum[] = [
  { label: "A", value: 40 },
  { label: "B", value: 40 },
  { label: "C", value: 1 } // ~4° slice → too thin for a label
];

const stacked: StackedBarDatum[] = [
  {
    label: "Q1",
    segments: [
      { label: "Web", value: 60 },
      { label: "Thin", value: 1 } // tiny segment → skipped
    ]
  }
];

const dataLabelTexts = (el: HTMLElement, chart: string) =>
  Array.from(el.querySelectorAll(`.st-${chart}__dataLabel`)).map((n) => n.textContent?.trim());

describe("ChartDataLabels (FR-2 — uniform value labels, svelte)", () => {
  it("renders no data labels by default (off — zero regression)", () => {
    const bar = render(BarChart, { props: { label: "Bar", data: bars } }).container;
    const line = render(LineChart, { props: { label: "Line", data: [{ x: 0, y: 4 }, { x: 1, y: 8 }] } }).container;
    const area = render(AreaChart, { props: { label: "Area", data: [4, 8, 2] } }).container;
    const don = render(DonutChart, { props: { label: "Donut", data: donut } }).container;
    const stk = render(StackedBarChart, { props: { label: "Stack", data: stacked } }).container;
    expect(bar.querySelector(".st-barChart__dataLabel")).toBeNull();
    expect(line.querySelector(".st-lineChart__dataLabel")).toBeNull();
    expect(area.querySelector(".st-areaChart__dataLabel")).toBeNull();
    expect(don.querySelector(".st-donutChart__dataLabel")).toBeNull();
    expect(stk.querySelector(".st-stackedBar__dataLabel")).toBeNull();
  });

  it("`dataLabels={true}` shows the value on every datum", () => {
    const { container } = render(BarChart, { props: { label: "Bar", data: bars, dataLabels: true } });
    expect(dataLabelTexts(container, "barChart")).toEqual(["4", "8", "2"]);
  });

  it("applies a custom `format`", () => {
    const { container } = render(BarChart, {
      props: { label: "Bar", data: bars, dataLabels: { format: (v: number) => `${v} pts` } }
    });
    expect(dataLabelTexts(container, "barChart")).toEqual(["4 pts", "8 pts", "2 pts"]);
  });

  it("honours `position` (vertical bar: outside above, inside centred)", () => {
    const outside = render(BarChart, { props: { label: "O", data: bars, dataLabels: true } }).container;
    const inside = render(BarChart, { props: { label: "I", data: bars, dataLabels: { position: "inside" } } }).container;
    const oY = Number(outside.querySelector(".st-barChart__dataLabel")?.getAttribute("y"));
    const iY = Number(inside.querySelector(".st-barChart__dataLabel")?.getAttribute("y"));
    // Inside labels sit lower (larger y) than outside labels (above the bar end).
    expect(iY).toBeGreaterThan(oY);
    expect(inside.querySelector(".st-barChart__dataLabel")?.getAttribute("dominant-baseline")).toBe("middle");
  });

  it("labels are aria-hidden (values stay in the accessible ChartDataList)", () => {
    const { container } = render(BarChart, { props: { label: "Bar", data: bars, dataLabels: true } });
    const group = container.querySelector(".st-barChart__dataLabels");
    expect(group?.getAttribute("aria-hidden")).toBe("true");
    const list = Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());
    expect(list).toEqual(["A: 4", "B: 8", "C: 2"]);
  });

  it("Line + Area expose the same data-label class and value", () => {
    const line = render(LineChart, { props: { label: "L", data: [{ x: 0, y: 4 }, { x: 1, y: 8 }], dataLabels: true } }).container;
    const area = render(AreaChart, { props: { label: "A", data: [4, 8], dataLabels: true } }).container;
    expect(dataLabelTexts(line, "lineChart")).toEqual(["4", "8"]);
    expect(dataLabelTexts(area, "areaChart")).toEqual(["4", "8"]);
  });

  it("Donut labels each legible slice and skips slices too thin", () => {
    const { container } = render(DonutChart, { props: { label: "D", data: donut, dataLabels: true } });
    // A (40) + B (40) are wide; C (1) is ~4° → skipped.
    expect(dataLabelTexts(container, "donutChart")).toEqual(["40", "40"]);
  });

  it("StackedBar labels each legible segment and skips segments too short", () => {
    const { container } = render(StackedBarChart, { props: { label: "S", data: stacked, dataLabels: true } });
    // Web (60) is tall; Thin (1) is < min height → skipped.
    expect(dataLabelTexts(container, "stackedBar")).toEqual(["60"]);
  });
});
