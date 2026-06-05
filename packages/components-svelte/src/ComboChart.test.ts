import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import ComboChart from "./lib/ComboChart.svelte";
import type { ComboChartBarSeries, ComboChartLineSeries } from "./lib/ComboChart.svelte";

describe("ComboChart", () => {
  const categories = ["Jan", "Feb", "Mar", "Apr"];
  const bars: ComboChartBarSeries[] = [
    { label: "Revenue", data: [100, 200, 150, 300], tone: "category1" }
  ];
  const lines: ComboChartLineSeries[] = [
    { label: "Margin", data: [10, 25, 18, 30], tone: "category3", smooth: true }
  ];

  it("renders bars on the left axis and lines on the right axis", () => {
    const { container } = render(ComboChart, {
      props: { categories, bars, lines, label: "Performance" }
    });

    expect(screen.getByRole("img", { name: "Performance" })).toBeTruthy();
    const wrapper = container.querySelector(".st-comboChart");
    expect(wrapper?.className).toContain("st-comboChart");

    // One bar per category for the single bar series.
    const rects = container.querySelectorAll(".st-comboChart__bar");
    expect(rects.length).toBe(categories.length);
    expect(rects[0]?.getAttribute("class")).toContain(
      "st-comboChart__bar--category1"
    );

    // One line path + one dot per category for the single line series.
    const linePath = container.querySelector(".st-comboChart__line");
    expect(linePath).toBeTruthy();
    expect(linePath?.getAttribute("d")).toBeTruthy();
    const dots = container.querySelectorAll(".st-comboChart__dot");
    expect(dots.length).toBe(categories.length);

    // Category labels are rendered.
    for (const c of categories) {
      expect(screen.getByText(c)).toBeTruthy();
    }
  });

  it("renders axis labels and a legend with both series", () => {
    const { container } = render(ComboChart, {
      props: {
        categories,
        bars,
        lines,
        leftAxisLabel: "Dollars",
        rightAxisLabel: "Percent",
        label: "Labelled"
      }
    });

    expect(screen.getByText("Dollars")).toBeTruthy();
    expect(screen.getByText("Percent")).toBeTruthy();

    const legend = container.querySelector(".st-comboChart__legend");
    expect(legend).toBeTruthy();
    expect(within(legend as HTMLElement).getByText("Revenue")).toBeTruthy();
    expect(within(legend as HTMLElement).getByText("Margin")).toBeTruthy();
  });

  it("can hide the legend", () => {
    const { container } = render(ComboChart, {
      props: { categories, bars, lines, legend: false, label: "No legend" }
    });
    expect(container.querySelector(".st-comboChart__legend")).toBeNull();
  });

  it("keeps the SVG decorative and exposes every value via a hidden data list", () => {
    const { container } = render(ComboChart, {
      props: { categories, bars, lines, label: "A11y" }
    });

    expect(
      container.querySelectorAll('svg[aria-hidden="true"] [tabindex], svg[aria-hidden="true"] [role]')
    ).toHaveLength(0);

    const dataList = screen.getByRole("list", { name: "Data values for A11y" });
    expect(within(dataList).getByText("Revenue, Jan: 100")).toBeTruthy();
    expect(within(dataList).getByText("Revenue, Apr: 300")).toBeTruthy();
    expect(within(dataList).getByText("Margin, Feb: 25")).toBeTruthy();
  });

  it("shows, updates, and hides the tooltip on bar and line interactions", async () => {
    const { container } = render(ComboChart, {
      props: { categories, bars, lines, label: "Interactive" }
    });

    expect(screen.queryByRole("presentation")).toBeNull();

    // Hover the second bar (Revenue · Feb: 200).
    const rects = container.querySelectorAll(".st-comboChart__bar");
    await fireEvent.pointerMove(rects[1]);
    let tooltip = screen.getByRole("presentation");
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent).toContain("Revenue");
    expect(tooltip.textContent).toContain("200");

    // Move to a line dot (Margin · Mar: 18).
    const dots = container.querySelectorAll(".st-comboChart__dot");
    await fireEvent.pointerMove(dots[2]);
    tooltip = screen.getByRole("presentation");
    expect(tooltip.textContent).toContain("Margin");
    expect(tooltip.textContent).toContain("18");

    // Leaving the visual clears the tooltip.
    await fireEvent.pointerLeave(container.querySelector(".st-comboChart__visual") as Element);
    expect(screen.queryByRole("presentation")).toBeNull();
  });

  it("renders multiple bar and line series with distinct default tones", () => {
    const multiBars: ComboChartBarSeries[] = [
      { label: "A", data: [1, 2] },
      { label: "B", data: [3, 4] }
    ];
    const multiLines: ComboChartLineSeries[] = [{ label: "C", data: [5, 6] }];
    const { container } = render(ComboChart, {
      props: { categories: ["x", "y"], bars: multiBars, lines: multiLines, label: "Multi" }
    });

    // 2 series x 2 categories = 4 bars.
    expect(container.querySelectorAll(".st-comboChart__bar").length).toBe(4);
    expect(container.querySelectorAll(".st-comboChart__line").length).toBe(1);
    expect(container.querySelectorAll(".st-comboChart__dot").length).toBe(2);
  });
});
