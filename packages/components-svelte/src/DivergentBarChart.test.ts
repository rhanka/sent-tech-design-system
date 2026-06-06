import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import DivergentBarChart from "./lib/DivergentBarChart.svelte";
import type { DivergentBarChartDatum } from "./lib/DivergentBarChart.svelte";

const data: DivergentBarChartDatum[] = [
  { label: "Quality", value: 42 },
  { label: "Risk", value: -18 },
  { label: "Neutral", value: 0 },
  { label: "Invalid", value: Number.NaN }
];

describe("DivergentBarChart", () => {
  it("renders divergent bars around a zero axis with screen-reader values", () => {
    const { container } = render(DivergentBarChart, { props: { label: "Sentiment", data } });

    expect(container.querySelector(".st-divergentBarChart")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Sentiment" })).toBeTruthy();
    expect(container.querySelector(".st-divergentBarChart__zeroAxis")).toBeTruthy();
    expect(container.querySelectorAll(".st-divergentBarChart__bar")).toHaveLength(3);
    expect(container.querySelector(".st-divergentBarChart__bar--positive")).toBeTruthy();
    expect(container.querySelector(".st-divergentBarChart__bar--negative")).toBeTruthy();
    expect(container.querySelector(".st-divergentBarChart__bar--zero")).toBeTruthy();

    const dataList = screen.getByRole("list", { name: "Data values for Sentiment" });
    expect(within(dataList).getByText("Quality: 42")).toBeTruthy();
    expect(within(dataList).getByText("Risk: -18")).toBeTruthy();
    expect(within(dataList).queryByText("Invalid: NaN")).toBeNull();
  });

  it("places negative bars left of positive bars", () => {
    const { container } = render(DivergentBarChart, { props: { label: "Balance", data } });
    const positive = container.querySelector('[data-chart-key="Quality"]') as SVGRectElement;
    const negative = container.querySelector('[data-chart-key="Risk"]') as SVGRectElement;

    expect(Number(negative.getAttribute("x"))).toBeLessThan(Number(positive.getAttribute("x")));
    expect(Number(negative.getAttribute("width"))).toBeGreaterThan(0);
    expect(Number(positive.getAttribute("width"))).toBeGreaterThan(0);
  });

  it("shows a tooltip on pointer move over a bar", async () => {
    const { container } = render(DivergentBarChart, { props: { label: "Tooltip", data } });
    const bar = container.querySelector(".st-divergentBarChart__bar")!;
    await fireEvent.pointerMove(bar);
    expect(container.querySelector(".st-divergentBarChart__tooltip")).toBeTruthy();
  });
});
