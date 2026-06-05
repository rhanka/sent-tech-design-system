import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import {
  ComboChart,
  FunnelChart,
  GaugeChart,
  KpiCard,
  TreemapChart,
  WaterfallChart,
} from "./index.js";

// Invariants mirrored from the Svelte sources (source of truth, commit c9f8db3).

describe("KpiCard", () => {
  it("formats currency and exposes label/value", () => {
    const wrapper = mount(KpiCard, {
      props: { value: 1234, label: "Revenu", format: "currency", currency: "EUR", locale: "fr-FR" },
    });
    const article = wrapper.find("article.st-kpiCard");
    expect(article.exists()).toBe(true);
    expect(article.attributes("role")).toBe("group");
    expect(wrapper.find(".st-kpiCard__label").text()).toBe("Revenu");
    // Currency formatting yields a non-bare-number string.
    expect(wrapper.find(".st-kpiCard__number").text()).toMatch(/1[\s  ]?234/);
  });

  it("derives trend up/down from delta and renders the matching delta class", () => {
    const up = mount(KpiCard, { props: { value: 10, label: "x", delta: 0.12 } });
    expect(up.find(".st-kpiCard__delta--up").exists()).toBe(true);
    const down = mount(KpiCard, { props: { value: 10, label: "x", delta: -0.12 } });
    expect(down.find(".st-kpiCard__delta--down").exists()).toBe(true);
  });

  it("applies a categorical accent and renders a sparkline when provided", () => {
    const wrapper = mount(KpiCard, {
      props: { value: 5, label: "x", tone: "category3", sparkline: [1, 2, 3, 2, 4] },
    });
    expect(wrapper.find(".st-kpiCard--category3").exists()).toBe(true);
    expect(wrapper.find(".st-kpiCard--toned").exists()).toBe(true);
    expect(wrapper.find(".st-kpiCard__sparkline").exists()).toBe(true);
  });
});

describe("ComboChart", () => {
  it("renders grouped bars, line dots, axes and a legend", () => {
    const wrapper = mount(ComboChart, {
      props: {
        label: "Combo",
        categories: ["Jan", "Fév", "Mar"],
        bars: [{ label: "Ventes", data: [10, 20, 30] }],
        lines: [{ label: "Marge", data: [1, 2, 3] }],
      },
    });
    expect(wrapper.findAll(".st-comboChart__bar")).toHaveLength(3);
    expect(wrapper.findAll(".st-comboChart__dot")).toHaveLength(3);
    expect(wrapper.find('.st-comboChart__line').exists()).toBe(true);
    // Right axis present only when lines exist (third axis line).
    expect(wrapper.findAll(".st-comboChart__axis").length).toBe(3);
    expect(wrapper.findAll(".st-comboChart__legendItem")).toHaveLength(2);
    expect(wrapper.find('[aria-label="Combo"]').exists()).toBe(true);
  });

  it("hides the legend when legend=false", () => {
    const wrapper = mount(ComboChart, {
      props: {
        label: "C",
        legend: false,
        categories: ["a"],
        bars: [{ label: "b", data: [1] }],
      },
    });
    expect(wrapper.find(".st-comboChart__legend").exists()).toBe(false);
  });
});

describe("GaugeChart", () => {
  it("renders a meter with aria value bounds and percent format", () => {
    const wrapper = mount(GaugeChart, {
      props: { value: 50, min: 0, max: 100, format: "percent", label: "CPU" },
    });
    const meter = wrapper.find('[role="meter"]');
    expect(meter.exists()).toBe(true);
    expect(meter.attributes("aria-valuenow")).toBe("50");
    expect(meter.attributes("aria-valuemin")).toBe("0");
    expect(meter.attributes("aria-valuemax")).toBe("100");
    expect(wrapper.find(".st-gaugeChart__value").text()).toBe("50%");
    // No thresholds -> progress arc present, no bands.
    expect(wrapper.find(".st-gaugeChart__progress").exists()).toBe(true);
    expect(wrapper.find(".st-gaugeChart__band").exists()).toBe(false);
  });

  it("renders threshold bands (and no progress arc) when thresholds are set", () => {
    const wrapper = mount(GaugeChart, {
      props: {
        value: 30,
        min: 0,
        max: 100,
        thresholds: [
          { value: 40, tone: "warning" },
          { value: 100, tone: "success" },
        ],
      },
    });
    expect(wrapper.findAll(".st-gaugeChart__band").length).toBeGreaterThan(0);
    expect(wrapper.find(".st-gaugeChart__progress").exists()).toBe(false);
  });
});

describe("FunnelChart", () => {
  it("renders one polygon per stage with percentages", () => {
    const wrapper = mount(FunnelChart, {
      props: {
        label: "Funnel",
        data: [
          { label: "Visites", value: 1000 },
          { label: "Paniers", value: 400 },
          { label: "Achats", value: 100 },
        ],
      },
    });
    expect(wrapper.findAll(".st-funnelChart__segment")).toHaveLength(3);
    // ofFirst: second stage is 40% of first.
    const values = wrapper.findAll(".st-funnelChart__value").map((n) => n.text());
    expect(values[1]).toContain("40%");
  });

  it("renders a legend only when legend=true", () => {
    const data = [{ label: "a", value: 2 }];
    const off = mount(FunnelChart, { props: { label: "f", data } });
    expect(off.find(".st-funnelChart__legend").exists()).toBe(false);
    const on = mount(FunnelChart, { props: { label: "f", data, legend: true } });
    expect(on.find(".st-funnelChart__legendItem").exists()).toBe(true);
  });
});

describe("WaterfallChart", () => {
  it("classifies bars by type and always renders the 3-item legend", () => {
    const wrapper = mount(WaterfallChart, {
      props: {
        label: "WF",
        data: [
          { label: "Start", value: 100, type: "total" },
          { label: "Gain", value: 50 },
          { label: "Loss", value: -30 },
          { label: "End", value: 120, type: "total" },
        ],
      },
    });
    expect(wrapper.findAll(".st-waterfallChart__bar")).toHaveLength(4);
    expect(wrapper.findAll(".st-waterfallChart__bar--total")).toHaveLength(2);
    expect(wrapper.find(".st-waterfallChart__bar--increase").exists()).toBe(true);
    expect(wrapper.find(".st-waterfallChart__bar--decrease").exists()).toBe(true);
    expect(wrapper.findAll(".st-waterfallChart__legendItem")).toHaveLength(3);
  });

  it("uses a custom format function for data values", () => {
    const wrapper = mount(WaterfallChart, {
      props: {
        label: "WF",
        connectors: false,
        format: (v: number) => `$${v}`,
        data: [{ label: "a", value: 10, type: "total" }],
      },
    });
    const items = wrapper.findAll(".st-chartDataList li").map((n) => n.text());
    expect(items[0]).toBe("a: $10");
  });
});

describe("TreemapChart", () => {
  it("renders a leaf rect per flat datum", () => {
    const wrapper = mount(TreemapChart, {
      props: {
        label: "TM",
        data: [
          { label: "A", value: 50 },
          { label: "B", value: 30 },
          { label: "C", value: 20 },
        ],
      },
    });
    expect(wrapper.findAll(".st-treemapChart__rect")).toHaveLength(3);
    expect(wrapper.find('[role="img"][aria-label="TM"]').exists()).toBe(true);
  });

  it("subdivides nodes with children into leaf cells", () => {
    const wrapper = mount(TreemapChart, {
      props: {
        label: "TM",
        data: [
          {
            label: "Parent",
            value: 0,
            children: [
              { label: "x", value: 30 },
              { label: "y", value: 20 },
            ],
          },
        ],
      },
    });
    // Two children -> two leaf rects (parent itself is not drawn as a leaf).
    expect(wrapper.findAll(".st-treemapChart__rect")).toHaveLength(2);
    const items = wrapper.findAll(".st-chartDataList li").map((n) => n.text());
    expect(items).toContain("Parent, x: 30");
  });
});
