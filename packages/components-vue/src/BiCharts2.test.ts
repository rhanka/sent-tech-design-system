import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import {
  BoxPlotChart,
  HeatmapChart,
  HistogramChart,
  RadarChart,
  SankeyChart,
  SunburstChart,
} from "./index.js";
import { contrastTextForTone } from "./chartContrast.js";

describe("chart contrast helpers", () => {
  it("uses OKLCH label colors instead of raw white or black hex values", () => {
    expect(contrastTextForTone("category1")).toBe("oklch(98% 0.005 255)");
    expect(contrastTextForTone("category6")).toBe("oklch(18% 0.025 255)");
    expect(contrastTextForTone("category8")).toBe("oklch(18% 0.025 255)");
  });
});

describe("HeatmapChart", () => {
  it("renders a categorical matrix with a legend and SR values", () => {
    const wrapper = mount(HeatmapChart, {
      props: {
        label: "Heat",
        legend: true,
        data: [
          { x: "Web", y: "Q1", value: 12 },
          { x: "Web", y: "Q2", value: 30, tone: "category5" },
          { x: "Sales", y: "Q1", value: 18 },
          { x: "Sales", y: "Q2", value: 24 },
        ],
      },
    });

    expect(wrapper.find('[role="img"][aria-label="Heat"]').exists()).toBe(true);
    expect(wrapper.findAll(".st-heatmapChart__cell")).toHaveLength(4);
    expect(wrapper.find(".st-heatmapChart__cell--category5").exists()).toBe(true);
    expect(wrapper.find(".st-heatmapChart__legend").exists()).toBe(true);
    expect(wrapper.findAll(".st-chartDataList li").map((n) => n.text())).toEqual([
      "Q1, Web: 12",
      "Q2, Web: 30",
      "Q1, Sales: 18",
      "Q2, Sales: 24",
    ]);
  });
});

describe("SankeyChart", () => {
  it("renders nodes and links with SR flow values", () => {
    const wrapper = mount(SankeyChart, {
      props: {
        label: "Flow",
        nodes: [
          { id: "visit", label: "Visits" },
          { id: "trial", label: "Trial", tone: "category4" },
          { id: "paid", label: "Paid" },
        ],
        links: [
          { source: "visit", target: "trial", value: 120 },
          { source: "trial", target: "paid", value: 48 },
        ],
      },
    });

    expect(wrapper.findAll(".st-sankeyChart__node")).toHaveLength(3);
    expect(wrapper.find(".st-sankeyChart__node--category4").exists()).toBe(true);
    expect(wrapper.findAll(".st-sankeyChart__link")).toHaveLength(2);
    expect(wrapper.findAll(".st-chartDataList li").map((n) => n.text())).toEqual([
      "Visits -> Trial: 120",
      "Trial -> Paid: 48",
    ]);
  });

  it("sizes aggregator nodes from summed incoming and outgoing flow", () => {
    const wrapper = mount(SankeyChart, {
      props: {
        label: "Aggregated",
        nodes: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
          { id: "c", label: "C" },
          { id: "d", label: "D" },
        ],
        links: [
          { source: "a", target: "c", value: 10 },
          { source: "b", target: "c", value: 10 },
          { source: "c", target: "d", value: 20 },
        ],
      },
    });

    const heights = wrapper.findAll(".st-sankeyChart__node").map((node) => Number(node.attributes("height")));

    expect(heights[2]).toBeGreaterThan(heights[0]);
    expect(heights[2]).toBeGreaterThan(heights[1]);
  });
});

describe("BoxPlotChart", () => {
  it("renders boxes, medians, outliers and SR summaries", () => {
    const wrapper = mount(BoxPlotChart, {
      props: {
        label: "Latency",
        data: [
          { label: "API", min: 10, q1: 20, median: 28, q3: 40, max: 60, outliers: [90], tone: "category3" },
          { label: "Jobs", min: 15, q1: 24, median: 34, q3: 50, max: 80 },
        ],
      },
    });

    expect(wrapper.findAll(".st-boxPlotChart__box")).toHaveLength(2);
    expect(wrapper.find(".st-boxPlotChart__box--category3").exists()).toBe(true);
    expect(wrapper.findAll(".st-boxPlotChart__median")).toHaveLength(2);
    expect(wrapper.findAll(".st-boxPlotChart__outlier")).toHaveLength(1);
    expect(wrapper.findAll(".st-chartDataList li").map((n) => n.text())).toEqual([
      "API: min 10, q1 20, median 28, q3 40, max 60, outliers 90",
      "Jobs: min 15, q1 24, median 34, q3 50, max 80",
    ]);
  });
});

describe("HistogramChart", () => {
  it("renders explicit bins and numeric binning", () => {
    const explicit = mount(HistogramChart, {
      props: {
        label: "Sizes",
        data: [
          { label: "0-10", value: 4 },
          { label: "10-20", value: 9, tone: "category6" },
          { label: "20-30", value: 3 },
        ],
      },
    });
    expect(explicit.findAll(".st-histogramChart__bar")).toHaveLength(3);
    expect(explicit.find(".st-histogramChart__bar--category6").exists()).toBe(true);

    const numeric = mount(HistogramChart, {
      props: { label: "Numeric", data: [1, 2, 3, 8, 9, 10], bins: 3 },
    });
    expect(numeric.findAll(".st-histogramChart__bar")).toHaveLength(3);
    expect(numeric.findAll(".st-chartDataList li").map((n) => n.text())).toEqual([
      "1-4: 3",
      "4-7: 0",
      "7-10: 3",
    ]);
  });

  it("uses ten numeric bins by default", () => {
    const wrapper = mount(HistogramChart, {
      props: { label: "Default numeric", data: [1, 2, 3, 4, 5, 6] },
    });

    expect(wrapper.findAll(".st-histogramChart__bar")).toHaveLength(10);
  });
});

describe("RadarChart", () => {
  it("renders axes, polygons, legend and SR values", () => {
    const wrapper = mount(RadarChart, {
      props: {
        label: "Radar",
        axes: ["Speed", "Quality", "Cost"],
        series: [
          { label: "Current", values: [80, 65, 45] },
          { label: "Target", values: [90, 85, 70], tone: "category7" },
        ],
        legend: true,
      },
    });

    expect(wrapper.findAll(".st-radarChart__axis")).toHaveLength(3);
    expect(wrapper.findAll(".st-radarChart__polygon")).toHaveLength(2);
    expect(wrapper.find(".st-radarChart__polygon--category7").exists()).toBe(true);
    expect(wrapper.findAll(".st-radarChart__legendItem")).toHaveLength(2);
    expect(wrapper.findAll(".st-chartDataList li").map((n) => n.text())).toEqual([
      "Current, Speed: 80",
      "Current, Quality: 65",
      "Current, Cost: 45",
      "Target, Speed: 90",
      "Target, Quality: 85",
      "Target, Cost: 70",
    ]);
  });
});

describe("SunburstChart", () => {
  it("renders nested arcs with legend and leaf SR values", () => {
    const wrapper = mount(SunburstChart, {
      props: {
        label: "Hierarchy",
        legend: true,
        data: {
          label: "Revenue",
          children: [
            { label: "Product", children: [{ label: "Core", value: 40 }, { label: "Addons", value: 20 }] },
            { label: "Services", value: 30, tone: "category8" },
          ],
        },
      },
    });

    expect(wrapper.findAll(".st-sunburstChart__arc").length).toBeGreaterThanOrEqual(4);
    expect(wrapper.find(".st-sunburstChart__arc--category8").exists()).toBe(true);
    expect(wrapper.find(".st-sunburstChart__legend").exists()).toBe(true);
    expect(wrapper.findAll(".st-chartDataList li").map((n) => n.text())).toEqual([
      "Revenue, Product, Core: 40",
      "Revenue, Product, Addons: 20",
      "Revenue, Services: 30",
    ]);
  });
});
