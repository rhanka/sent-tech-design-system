import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { LollipopChart, ParetoChart } from "./index.js";

describe("LollipopChart parity with Svelte/React", () => {
  it("renders one stem + dot per datum and SR values", () => {
    const wrapper = mount(LollipopChart, {
      props: {
        label: "Lollipop demo",
        data: [
          { label: "A", value: 30 },
          { label: "B", value: 50, tone: "category2" },
          { label: "C", value: 20 },
        ],
      },
    });

    expect(wrapper.find('[role="img"][aria-label="Lollipop demo"]').exists()).toBe(true);
    expect(wrapper.findAll(".st-lollipopChart__stem")).toHaveLength(3);
    expect(wrapper.findAll(".st-lollipopChart__dot")).toHaveLength(3);
    expect(wrapper.findAll(".st-chartDataList li").map((n) => n.text())).toEqual([
      "A: 30",
      "B: 50",
      "C: 20",
    ]);
  });

  it("applies the tone class to dots (default category1)", () => {
    const wrapper = mount(LollipopChart, {
      props: {
        label: "Tones",
        data: [
          { label: "A", value: 10, tone: "category3" },
          { label: "B", value: 20 },
        ],
      },
    });
    expect(wrapper.find(".st-lollipopChart__dot--category3").exists()).toBe(true);
    expect(wrapper.find(".st-lollipopChart__dot--category1").exists()).toBe(true);
  });

  it("supports horizontal orientation", () => {
    const wrapper = mount(LollipopChart, {
      props: {
        label: "Horizontal",
        orientation: "horizontal",
        data: [
          { label: "A", value: 30 },
          { label: "B", value: 50 },
        ],
      },
    });
    expect(wrapper.findAll(".st-lollipopChart__dot")).toHaveLength(2);
  });

  it("honours a fixed domain (taller value → smaller cy in vertical)", () => {
    const wrapper = mount(LollipopChart, {
      props: {
        label: "Domain",
        domain: [0, 100],
        data: [
          { label: "Low", value: 10 },
          { label: "High", value: 90 },
        ],
      },
    });
    const dots = wrapper.findAll(".st-lollipopChart__dot");
    const lowCy = Number(dots[0].attributes("cy"));
    const highCy = Number(dots[1].attributes("cy"));
    expect(highCy).toBeLessThan(lowCy);
  });

  it("ignores an invalid domain and falls back to auto range (no crash)", () => {
    const wrapper = mount(LollipopChart, {
      props: {
        label: "Bad domain",
        domain: [100, 0],
        data: [{ label: "A", value: 40 }],
      },
    });
    expect(wrapper.findAll(".st-lollipopChart__dot")).toHaveLength(1);
  });

  it("shows tooltip on pointer move", async () => {
    const wrapper = mount(LollipopChart, {
      props: {
        label: "Tooltip",
        data: [{ label: "A", value: 40 }],
      },
    });
    await wrapper.find(".st-lollipopChart__dot").trigger("pointermove");
    expect(wrapper.find(".st-lollipopChart__tooltip").exists()).toBe(true);
  });

  it("skips datum with NaN/Infinity value (no crash, no dot)", () => {
    const wrapper = mount(LollipopChart, {
      props: {
        label: "Invalid",
        data: [
          { label: "Valid", value: 50 },
          { label: "NaN", value: NaN },
          { label: "Inf", value: Infinity },
        ],
      },
    });
    expect(wrapper.findAll(".st-lollipopChart__dot")).toHaveLength(1);
  });

  it("renders nothing breaking on empty data", () => {
    const wrapper = mount(LollipopChart, {
      props: { label: "Empty", data: [] },
    });
    expect(wrapper.findAll(".st-lollipopChart__dot")).toHaveLength(0);
    expect(wrapper.find('[role="img"][aria-label="Empty"]').exists()).toBe(true);
  });
});

describe("ParetoChart parity with Svelte/React", () => {
  it("renders bars sorted descending + a cumulative line, SR values incl. cumulative %", () => {
    const wrapper = mount(ParetoChart, {
      props: {
        label: "Pareto demo",
        data: [
          { label: "A", value: 30 },
          { label: "B", value: 50 },
          { label: "C", value: 20 },
        ],
      },
    });

    expect(wrapper.find('[role="img"][aria-label="Pareto demo"]').exists()).toBe(true);
    expect(wrapper.findAll(".st-paretoChart__bar")).toHaveLength(3);
    expect(wrapper.find(".st-paretoChart__cumLine").exists()).toBe(true);
    expect(wrapper.findAll(".st-paretoChart__cumDot")).toHaveLength(3);
    expect(wrapper.findAll(".st-chartDataList li").map((n) => n.text())).toEqual([
      "B: 50 (50% cumulé)",
      "A: 30 (80% cumulé)",
      "C: 20 (100% cumulé)",
    ]);
  });

  it("renders the category labels in descending value order", () => {
    const wrapper = mount(ParetoChart, {
      props: {
        label: "Order",
        data: [
          { label: "small", value: 5 },
          { label: "big", value: 90 },
          { label: "mid", value: 40 },
        ],
      },
    });
    expect(
      wrapper.findAll(".st-paretoChart__categoryLabel").map((n) => n.text().trim()),
    ).toEqual(["big", "mid", "small"]);
  });

  it("applies the tone class to bars", () => {
    const wrapper = mount(ParetoChart, {
      props: {
        label: "Tones",
        data: [
          { label: "A", value: 30, tone: "category4" },
          { label: "B", value: 10 },
        ],
      },
    });
    expect(wrapper.find(".st-paretoChart__bar--category4").exists()).toBe(true);
  });

  it("shows tooltip on pointer move over a cumulative dot", async () => {
    const wrapper = mount(ParetoChart, {
      props: {
        label: "Tooltip",
        data: [{ label: "A", value: 40 }],
      },
    });
    await wrapper.find(".st-paretoChart__cumDot").trigger("pointermove");
    expect(wrapper.find(".st-paretoChart__tooltip").exists()).toBe(true);
  });

  it("skips datum with NaN/Infinity/negative value (no crash, no bar)", () => {
    const wrapper = mount(ParetoChart, {
      props: {
        label: "Invalid",
        data: [
          { label: "Valid", value: 50 },
          { label: "NaN", value: NaN },
          { label: "Inf", value: Infinity },
          { label: "Neg", value: -10 },
        ],
      },
    });
    expect(wrapper.findAll(".st-paretoChart__bar")).toHaveLength(1);
  });

  it("renders nothing breaking on empty data (no cumulative line)", () => {
    const wrapper = mount(ParetoChart, {
      props: { label: "Empty", data: [] },
    });
    expect(wrapper.findAll(".st-paretoChart__bar")).toHaveLength(0);
    expect(wrapper.find(".st-paretoChart__cumLine").exists()).toBe(false);
    expect(wrapper.find('[role="img"][aria-label="Empty"]').exists()).toBe(true);
  });

  it("reaches 100% cumulative on the last point", () => {
    const wrapper = mount(ParetoChart, {
      props: {
        label: "Full",
        data: [
          { label: "A", value: 10 },
          { label: "B", value: 30 },
        ],
      },
    });
    const items = wrapper.findAll(".st-chartDataList li").map((n) => n.text());
    expect(items[items.length - 1]).toContain("100% cumulé");
  });
});
