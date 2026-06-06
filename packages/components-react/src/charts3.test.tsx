import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import {
  BoxPlotChart,
  HeatmapChart,
  HistogramChart,
  RadarChart,
  SankeyChart,
  SunburstChart,
} from "./index.js";
import { contrastTextForTone } from "./chartContrast.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("chart contrast helpers", () => {
  it("uses OKLCH label colors instead of raw white or black hex values", () => {
    expect(contrastTextForTone("category1")).toBe("oklch(98% 0.005 255)");
    expect(contrastTextForTone("category6")).toBe("oklch(18% 0.025 255)");
    expect(contrastTextForTone("category8")).toBe("oklch(18% 0.025 255)");
  });
});

describe("HeatmapChart parity with Svelte", () => {
  it("renders a categorical matrix with cells, labels, legend and an SR data list", () => {
    const { container } = render(
      <HeatmapChart
        label="Heat"
        legend
        data={[
          { x: "Web", y: "Q1", value: 12 },
          { x: "Web", y: "Q2", value: 30, tone: "category5" },
          { x: "Sales", y: "Q1", value: 18 },
          { x: "Sales", y: "Q2", value: 24 },
        ]}
      />,
    );

    expect(container.querySelector(".st-heatmapChart__visual")?.getAttribute("aria-label")).toBe("Heat");
    expect(container.querySelectorAll(".st-heatmapChart__cell")).toHaveLength(4);
    expect(container.querySelector(".st-heatmapChart__cell--category5")).toBeTruthy();
    expect(container.querySelector(".st-heatmapChart__legend")).toBeTruthy();
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "Q1, Web: 12",
      "Q2, Web: 30",
      "Q1, Sales: 18",
      "Q2, Sales: 24",
    ]);
  });
});

describe("SankeyChart parity with Svelte", () => {
  it("renders nodes, weighted links and a hover tooltip", () => {
    const { container } = render(
      <SankeyChart
        label="Flow"
        nodes={[
          { id: "visit", label: "Visits" },
          { id: "trial", label: "Trial", tone: "category4" },
          { id: "paid", label: "Paid" },
        ]}
        links={[
          { source: "visit", target: "trial", value: 120 },
          { source: "trial", target: "paid", value: 48 },
        ]}
      />,
    );

    expect(container.querySelector(".st-sankeyChart__visual")?.getAttribute("aria-label")).toBe("Flow");
    expect(container.querySelectorAll(".st-sankeyChart__node")).toHaveLength(3);
    expect(container.querySelector(".st-sankeyChart__node--category4")).toBeTruthy();
    expect(container.querySelectorAll(".st-sankeyChart__link")).toHaveLength(2);
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "Visits -> Trial: 120",
      "Trial -> Paid: 48",
    ]);
    fireEvent.pointerMove(container.querySelector(".st-sankeyChart__link")!);
    expect(container.querySelector(".st-sankeyChart__tooltip")).toBeTruthy();
  });

  it("sizes aggregator nodes from summed incoming and outgoing flow", () => {
    const { container } = render(
      <SankeyChart
        label="Aggregated"
        nodes={[
          { id: "a", label: "A" },
          { id: "b", label: "B" },
          { id: "c", label: "C" },
          { id: "d", label: "D" },
        ]}
        links={[
          { source: "a", target: "c", value: 10 },
          { source: "b", target: "c", value: 10 },
          { source: "c", target: "d", value: 20 },
        ]}
      />,
    );

    const heights = Array.from(container.querySelectorAll(".st-sankeyChart__node")).map((node) =>
      Number(node.getAttribute("height")),
    );

    expect(heights[2]).toBeGreaterThan(heights[0]);
    expect(heights[2]).toBeGreaterThan(heights[1]);
  });
});

describe("BoxPlotChart parity with Svelte", () => {
  it("renders boxes, medians, outliers and SR summaries", () => {
    const { container } = render(
      <BoxPlotChart
        label="Latency"
        data={[
          { label: "API", min: 10, q1: 20, median: 28, q3: 40, max: 60, outliers: [90], tone: "category3" },
          { label: "Jobs", min: 15, q1: 24, median: 34, q3: 50, max: 80 },
        ]}
      />,
    );

    expect(container.querySelectorAll(".st-boxPlotChart__box")).toHaveLength(2);
    expect(container.querySelector(".st-boxPlotChart__box--category3")).toBeTruthy();
    expect(container.querySelectorAll(".st-boxPlotChart__median")).toHaveLength(2);
    expect(container.querySelectorAll(".st-boxPlotChart__outlier")).toHaveLength(1);
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "API: min 10, q1 20, median 28, q3 40, max 60, outliers 90",
      "Jobs: min 15, q1 24, median 34, q3 50, max 80",
    ]);
  });
});

describe("HistogramChart parity with Svelte", () => {
  it("renders explicit bins and numeric binning", () => {
    const explicit = render(
      <HistogramChart
        label="Sizes"
        data={[
          { label: "0-10", value: 4 },
          { label: "10-20", value: 9, tone: "category6" },
          { label: "20-30", value: 3 },
        ]}
      />,
    );
    expect(explicit.container.querySelectorAll(".st-histogramChart__bar")).toHaveLength(3);
    expect(explicit.container.querySelector(".st-histogramChart__bar--category6")).toBeTruthy();
    cleanup();

    const numeric = render(<HistogramChart label="Numeric" data={[1, 2, 3, 8, 9, 10]} bins={3} />);
    expect(numeric.container.querySelectorAll(".st-histogramChart__bar")).toHaveLength(3);
    expect(Array.from(numeric.container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "1-4: 3",
      "4-7: 0",
      "7-10: 3",
    ]);
  });

  it("uses ten numeric bins by default", () => {
    const { container } = render(<HistogramChart label="Default numeric" data={[1, 2, 3, 4, 5, 6]} />);
    expect(container.querySelectorAll(".st-histogramChart__bar")).toHaveLength(10);
  });
});

describe("RadarChart parity with Svelte", () => {
  it("renders axes, polygons, legend and SR values", () => {
    const { container } = render(
      <RadarChart
        label="Radar"
        axes={["Speed", "Quality", "Cost"]}
        series={[
          { label: "Current", values: [80, 65, 45] },
          { label: "Target", values: [90, 85, 70], tone: "category7" },
        ]}
        legend
      />,
    );

    expect(container.querySelectorAll(".st-radarChart__axis")).toHaveLength(3);
    expect(container.querySelectorAll(".st-radarChart__polygon")).toHaveLength(2);
    expect(container.querySelector(".st-radarChart__polygon--category7")).toBeTruthy();
    expect(container.querySelectorAll(".st-radarChart__legendItem")).toHaveLength(2);
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "Current, Speed: 80",
      "Current, Quality: 65",
      "Current, Cost: 45",
      "Target, Speed: 90",
      "Target, Quality: 85",
      "Target, Cost: 70",
    ]);
  });
});

describe("SunburstChart parity with Svelte", () => {
  it("renders nested arcs, legend, SR leaf values and a hover tooltip", () => {
    const { container } = render(
      <SunburstChart
        label="Hierarchy"
        legend
        data={{
          label: "Revenue",
          children: [
            { label: "Product", children: [{ label: "Core", value: 40 }, { label: "Addons", value: 20 }] },
            { label: "Services", value: 30, tone: "category8" },
          ],
        }}
      />,
    );

    expect(container.querySelectorAll(".st-sunburstChart__arc").length).toBeGreaterThanOrEqual(4);
    expect(container.querySelector(".st-sunburstChart__arc--category8")).toBeTruthy();
    expect(container.querySelector(".st-sunburstChart__legend")).toBeTruthy();
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "Revenue, Product, Core: 40",
      "Revenue, Product, Addons: 20",
      "Revenue, Services: 30",
    ]);
    fireEvent.pointerMove(container.querySelector(".st-sunburstChart__arc")!);
    expect(container.querySelector(".st-sunburstChart__tooltip")).toBeTruthy();
  });
});
