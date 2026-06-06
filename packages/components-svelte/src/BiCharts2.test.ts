import { fireEvent, render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import BoxPlotChart from "./lib/BoxPlotChart.svelte";
import HeatmapChart from "./lib/HeatmapChart.svelte";
import HistogramChart from "./lib/HistogramChart.svelte";
import RadarChart from "./lib/RadarChart.svelte";
import SankeyChart from "./lib/SankeyChart.svelte";
import SunburstChart from "./lib/SunburstChart.svelte";
import { contrastTextForTone } from "./lib/chartContrast";

describe("chart contrast helpers", () => {
  it("uses OKLCH label colors instead of raw white or black hex values", () => {
    expect(contrastTextForTone("category1")).toBe("oklch(98% 0.005 255)");
    expect(contrastTextForTone("category6")).toBe("oklch(18% 0.025 255)");
    expect(contrastTextForTone("category8")).toBe("oklch(18% 0.025 255)");
  });
});

describe("HeatmapChart", () => {
  it("renders a categorical matrix with cells, axis labels, legend and SR values", () => {
    const { container } = render(HeatmapChart, {
      props: {
        label: "Channel heatmap",
        legend: true,
        data: [
          { x: "Web", y: "Q1", value: 12 },
          { x: "Web", y: "Q2", value: 30, tone: "category5" },
          { x: "Sales", y: "Q1", value: 18 },
          { x: "Sales", y: "Q2", value: 24 }
        ]
      }
    });

    expect(screen.getByRole("img", { name: "Channel heatmap" })).toBeTruthy();
    expect(container.querySelectorAll(".st-heatmapChart__cell")).toHaveLength(4);
    expect(container.querySelector(".st-heatmapChart__cell--category5")).toBeTruthy();
    expect(screen.getByText("Web")).toBeTruthy();
    expect(screen.getByText("Q2")).toBeTruthy();
    expect(container.querySelector(".st-heatmapChart__legend")).toBeTruthy();
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "Q1, Web: 12",
      "Q2, Web: 30",
      "Q1, Sales: 18",
      "Q2, Sales: 24"
    ]);
  });
});

describe("SankeyChart", () => {
  it("lays out nodes and weighted links with an SR data list", async () => {
    const { container } = render(SankeyChart, {
      props: {
        label: "Acquisition flow",
        nodes: [
          { id: "visit", label: "Visits" },
          { id: "trial", label: "Trial", tone: "category4" },
          { id: "paid", label: "Paid" }
        ],
        links: [
          { source: "visit", target: "trial", value: 120 },
          { source: "trial", target: "paid", value: 48 }
        ]
      }
    });

    expect(screen.getByRole("img", { name: "Acquisition flow" })).toBeTruthy();
    expect(container.querySelectorAll(".st-sankeyChart__node")).toHaveLength(3);
    expect(container.querySelector(".st-sankeyChart__node--category4")).toBeTruthy();
    expect(container.querySelectorAll(".st-sankeyChart__link")).toHaveLength(2);
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "Visits -> Trial: 120",
      "Trial -> Paid: 48"
    ]);

    await fireEvent.pointerMove(container.querySelector(".st-sankeyChart__link") as Element);
    expect(container.querySelector(".st-sankeyChart__tooltip")).toBeTruthy();
  });

  it("sizes aggregator nodes from summed incoming and outgoing flow", () => {
    const { container } = render(SankeyChart, {
      props: {
        label: "Aggregated flow",
        nodes: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
          { id: "c", label: "C" },
          { id: "d", label: "D" }
        ],
        links: [
          { source: "a", target: "c", value: 10 },
          { source: "b", target: "c", value: 10 },
          { source: "c", target: "d", value: 20 }
        ]
      }
    });

    const heights = Array.from(container.querySelectorAll(".st-sankeyChart__node")).map((node) =>
      Number(node.getAttribute("height"))
    );

    expect(heights[2]).toBeGreaterThan(heights[0]);
    expect(heights[2]).toBeGreaterThan(heights[1]);
  });
});

describe("BoxPlotChart", () => {
  it("renders boxes, whiskers, median lines, outliers and SR summaries", () => {
    const { container } = render(BoxPlotChart, {
      props: {
        label: "Latency distribution",
        data: [
          { label: "API", min: 10, q1: 20, median: 28, q3: 40, max: 60, outliers: [90], tone: "category3" },
          { label: "Jobs", min: 15, q1: 24, median: 34, q3: 50, max: 80 }
        ]
      }
    });

    expect(screen.getByRole("img", { name: "Latency distribution" })).toBeTruthy();
    expect(container.querySelectorAll(".st-boxPlotChart__box")).toHaveLength(2);
    expect(container.querySelector(".st-boxPlotChart__box--category3")).toBeTruthy();
    expect(container.querySelectorAll(".st-boxPlotChart__median")).toHaveLength(2);
    expect(container.querySelectorAll(".st-boxPlotChart__outlier")).toHaveLength(1);
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "API: min 10, q1 20, median 28, q3 40, max 60, outliers 90",
      "Jobs: min 15, q1 24, median 34, q3 50, max 80"
    ]);
  });
});

describe("HistogramChart", () => {
  it("uses explicit bins when provided", () => {
    const { container } = render(HistogramChart, {
      props: {
        label: "Request sizes",
        data: [
          { label: "0-10", value: 4 },
          { label: "10-20", value: 9, tone: "category6" },
          { label: "20-30", value: 3 }
        ]
      }
    });

    expect(screen.getByRole("img", { name: "Request sizes" })).toBeTruthy();
    expect(container.querySelectorAll(".st-histogramChart__bar")).toHaveLength(3);
    expect(container.querySelector(".st-histogramChart__bar--category6")).toBeTruthy();
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "0-10: 4",
      "10-20: 9",
      "20-30: 3"
    ]);
  });

  it("bins numeric values when bins is provided", () => {
    const { container } = render(HistogramChart, {
      props: {
        label: "Numeric distribution",
        data: [1, 2, 3, 8, 9, 10],
        bins: 3
      }
    });

    expect(container.querySelectorAll(".st-histogramChart__bar")).toHaveLength(3);
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "1-4: 3",
      "4-7: 0",
      "7-10: 3"
    ]);
  });

  it("uses ten numeric bins by default", () => {
    const { container } = render(HistogramChart, {
      props: {
        label: "Default numeric distribution",
        data: [1, 2, 3, 4, 5, 6]
      }
    });

    expect(container.querySelectorAll(".st-histogramChart__bar")).toHaveLength(10);
  });
});

describe("RadarChart", () => {
  it("renders polar axes, polygons, legend and SR values for each series", () => {
    const { container } = render(RadarChart, {
      props: {
        label: "Capability radar",
        axes: ["Speed", "Quality", "Cost"],
        series: [
          { label: "Current", values: [80, 65, 45] },
          { label: "Target", values: [90, 85, 70], tone: "category7" }
        ],
        legend: true
      }
    });

    expect(screen.getByRole("img", { name: "Capability radar" })).toBeTruthy();
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
      "Target, Cost: 70"
    ]);
  });
});

describe("SunburstChart", () => {
  it("renders nested arcs with labels, legend and leaf SR values", async () => {
    const { container } = render(SunburstChart, {
      props: {
        label: "Revenue hierarchy",
        legend: true,
        data: {
          label: "Revenue",
          children: [
            { label: "Product", children: [{ label: "Core", value: 40 }, { label: "Addons", value: 20 }] },
            { label: "Services", value: 30, tone: "category8" }
          ]
        }
      }
    });

    expect(screen.getByRole("img", { name: "Revenue hierarchy" })).toBeTruthy();
    expect(container.querySelectorAll(".st-sunburstChart__arc").length).toBeGreaterThanOrEqual(4);
    expect(container.querySelector(".st-sunburstChart__arc--category8")).toBeTruthy();
    expect(container.querySelector(".st-sunburstChart__legend")).toBeTruthy();
    expect(Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent)).toEqual([
      "Revenue, Product, Core: 40",
      "Revenue, Product, Addons: 20",
      "Revenue, Services: 30"
    ]);

    await fireEvent.pointerMove(container.querySelector(".st-sunburstChart__arc") as Element);
    expect(container.querySelector(".st-sunburstChart__tooltip")).toBeTruthy();
  });
});
