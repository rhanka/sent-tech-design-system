import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { DivergentBarChart } from "./index.js";

describe("DivergentBarChart parity with Svelte", () => {
  const data = [
    { label: "Quality", value: 42 },
    { label: "Risk", value: -18 },
    { label: "Neutral", value: 0 },
    { label: "Invalid", value: Number.NaN },
  ];

  it("renders divergent bars around a zero axis and exposes data values", () => {
    const wrapper = mount(DivergentBarChart, { props: { label: "Sentiment", data } });

    expect(wrapper.find(".st-divergentBarChart").exists()).toBe(true);
    expect(wrapper.find(".st-divergentBarChart__visual").attributes("aria-label")).toBe("Sentiment");
    expect(wrapper.find(".st-divergentBarChart__zeroAxis").exists()).toBe(true);
    expect(wrapper.findAll(".st-divergentBarChart__bar")).toHaveLength(3);
    expect(wrapper.find(".st-divergentBarChart__bar--positive").exists()).toBe(true);
    expect(wrapper.find(".st-divergentBarChart__bar--negative").exists()).toBe(true);
    expect(wrapper.find(".st-divergentBarChart__bar--zero").exists()).toBe(true);
    expect(wrapper.findAll(".st-chartDataList li").map((n) => n.text())).toEqual([
      "Quality: 42",
      "Risk: -18",
      "Neutral: 0",
    ]);
  });

  it("places negative bars left of positive bars", () => {
    const wrapper = mount(DivergentBarChart, { props: { label: "Balance", data } });
    const positive = wrapper.find('[data-chart-key="Quality"]');
    const negative = wrapper.find('[data-chart-key="Risk"]');

    expect(Number(negative.attributes("x"))).toBeLessThan(Number(positive.attributes("x")));
    expect(Number(negative.attributes("width"))).toBeGreaterThan(0);
    expect(Number(positive.attributes("width"))).toBeGreaterThan(0);
  });

  it("shows a tooltip on pointer move over a bar", async () => {
    const wrapper = mount(DivergentBarChart, { props: { label: "Tooltip", data } });
    await wrapper.find(".st-divergentBarChart__bar").trigger("pointermove");
    expect(wrapper.find(".st-divergentBarChart__tooltip").exists()).toBe(true);
  });
});
