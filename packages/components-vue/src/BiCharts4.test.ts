import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { RoseChart, ViolinChart } from "./index.js";

describe("RoseChart", () => {
  it("renders one equal-angle sector per datum with category tones and SR values", () => {
    const wrapper = mount(RoseChart, {
      props: {
        label: "Activity rose",
        data: [
          { label: "Jan", value: 40 },
          { label: "Feb", value: 20, tone: "category5" },
          { label: "Mar", value: 80 },
        ],
      },
    });

    expect(wrapper.find('[role="img"]').attributes("aria-label")).toBe("Activity rose");
    expect(wrapper.findAll(".st-roseChart__sector")).toHaveLength(3);
    expect(wrapper.find(".st-roseChart__sector--category5").exists()).toBe(true);
    expect(wrapper.findAll(".st-chartDataList li").map((n) => n.text())).toEqual([
      "Jan: 40",
      "Feb: 20",
      "Mar: 80",
    ]);
  });

  it("scales radius by sqrt(value/max) so area is proportional to value", () => {
    const wrapper = mount(RoseChart, {
      props: { label: "Rose scale", width: 200, height: 200, data: [{ label: "Full", value: 100 }] },
    });
    // outerLimit = 200/2 - 6 = 94 ; sqrt(100/100)*94 = 94
    const path = wrapper.find(".st-roseChart__sector").attributes("d") ?? "";
    expect(path.includes("94")).toBe(true);
  });

  it("ignores non-finite and negative values (no sector, excluded from max)", () => {
    const wrapper = mount(RoseChart, {
      props: {
        label: "Rose with bad values",
        data: [
          { label: "Good", value: 50 },
          { label: "NaN", value: Number.NaN },
          { label: "Neg", value: -10 },
        ],
      },
    });

    expect(wrapper.findAll(".st-roseChart__sector")).toHaveLength(1);
    expect(wrapper.findAll(".st-chartDataList li").map((n) => n.text())).toEqual([
      "Good: 50",
      "NaN: 0",
      "Neg: 0",
    ]);
  });

  it("renders empty data without crashing", () => {
    const wrapper = mount(RoseChart, { props: { label: "Empty rose", data: [] } });
    expect(wrapper.find('[role="img"]').attributes("aria-label")).toBe("Empty rose");
    expect(wrapper.findAll(".st-roseChart__sector")).toHaveLength(0);
  });

  it("shows a tooltip on pointer move over a sector", async () => {
    const wrapper = mount(RoseChart, {
      props: {
        label: "Rose hover",
        data: [
          { label: "A", value: 60 },
          { label: "B", value: 90 },
        ],
      },
    });
    await wrapper.find('.st-roseChart__sector[data-chart-index="1"]').trigger("pointermove");
    expect(wrapper.find(".st-roseChart__tooltip").exists()).toBe(true);
    expect(wrapper.find(".st-roseChart__tooltipLabel").text()).toBe("B");
  });
});

describe("ViolinChart", () => {
  it("renders one mirrored shape per category with quartile overlays and SR summaries", () => {
    const wrapper = mount(ViolinChart, {
      props: {
        label: "Latency violins",
        data: [
          { label: "API", values: [10, 12, 14, 20, 22, 28, 30] },
          { label: "Jobs", values: [5, 8, 9, 11, 40], tone: "category4" },
        ],
      },
    });

    expect(wrapper.find('[role="img"]').attributes("aria-label")).toBe("Latency violins");
    expect(wrapper.findAll(".st-violinChart__shape")).toHaveLength(2);
    expect(wrapper.find(".st-violinChart__shape--category4").exists()).toBe(true);
    expect(wrapper.findAll(".st-violinChart__median")).toHaveLength(2);
    expect(wrapper.findAll(".st-violinChart__box")).toHaveLength(2);
    const items = wrapper.findAll(".st-chartDataList li").map((n) => n.text());
    expect(items[0]).toBe("API: 7 points, min 10, median 20, max 30");
    expect(items[1]).toBe("Jobs: 5 points, min 5, median 9, max 40");
  });

  it("draws a closed mirror path", () => {
    const wrapper = mount(ViolinChart, {
      props: { label: "Violin symmetry", width: 200, height: 200, data: [{ label: "One", values: [1, 2, 2, 3] }] },
    });
    const d = wrapper.find(".st-violinChart__shape").attributes("d") ?? "";
    expect(d.startsWith("M ")).toBe(true);
    expect(d.trim().endsWith("Z")).toBe(true);
  });

  it("excludes non-finite values and skips empty categories", () => {
    const wrapper = mount(ViolinChart, {
      props: {
        label: "Violin cleaning",
        data: [
          { label: "Good", values: [1, 2, Number.NaN, 3, Number.POSITIVE_INFINITY] },
          { label: "Empty", values: [] },
          { label: "AllNaN", values: [Number.NaN, Number.NaN] },
        ],
      },
    });

    expect(wrapper.findAll(".st-violinChart__shape")).toHaveLength(1);
    expect(wrapper.findAll(".st-chartDataList li").map((n) => n.text())).toEqual([
      "Good: 3 points, min 1, median 2, max 3",
    ]);
  });

  it("hides quartile overlays when quartiles is false", () => {
    const wrapper = mount(ViolinChart, {
      props: { label: "Violin no quartiles", quartiles: false, data: [{ label: "A", values: [1, 2, 3, 4] }] },
    });
    expect(wrapper.findAll(".st-violinChart__shape")).toHaveLength(1);
    expect(wrapper.findAll(".st-violinChart__median")).toHaveLength(0);
    expect(wrapper.findAll(".st-violinChart__box")).toHaveLength(0);
  });

  it("renders empty data without crashing", () => {
    const wrapper = mount(ViolinChart, { props: { label: "Empty violin", data: [] } });
    expect(wrapper.find('[role="img"]').attributes("aria-label")).toBe("Empty violin");
    expect(wrapper.findAll(".st-violinChart__shape")).toHaveLength(0);
  });
});
