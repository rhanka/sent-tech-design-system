import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { StepLineChart } from "./index.js";

describe("StepLineChart", () => {
  const data = [
    { x: "Jan", y: 12 },
    { x: "Feb", y: 18 },
    { x: "Mar", y: 10 },
  ];

  it("renders a stepped path, tone class, dots, and data values", () => {
    const wrapper = mount(StepLineChart, {
      props: {
        data,
        label: "Monthly retention",
        tone: "category4",
      },
    });

    expect(wrapper.find('[role="img"][aria-label="Monthly retention"]').exists()).toBe(true);
    expect(wrapper.find(".st-stepLineChart--category4").exists()).toBe(true);

    const path = wrapper.find(".st-stepLineChart__line").attributes("d") ?? "";
    expect(path.startsWith("M")).toBe(true);
    expect(path).toContain("H");
    expect(path).toContain("V");
    expect(path).not.toContain("C");
    expect(wrapper.findAll(".st-stepLineChart__dot")).toHaveLength(3);

    expect(wrapper.findAll(".st-chartDataList li").map((node) => node.text())).toEqual([
      "Jan: 12",
      "Feb: 18",
      "Mar: 10",
    ]);
  });

  it("supports numeric x values and exposes hover tooltip", async () => {
    const wrapper = mount(StepLineChart, {
      props: {
        data: [
          { x: 1, y: 4 },
          { x: 2, y: 8 },
        ],
        label: "Numeric steps",
      },
    });

    await wrapper.findAll(".st-stepLineChart__dot")[1].trigger("pointermove");

    expect(wrapper.find(".st-stepLineChart__tooltip").exists()).toBe(true);
    expect(wrapper.find(".st-stepLineChart__tooltipLabel").text()).toBe("2");
    expect(wrapper.find(".st-stepLineChart__tooltipValue").text()).toBe("8");

    await wrapper.find(".st-stepLineChart__visual").trigger("pointerleave");
    expect(wrapper.find(".st-stepLineChart__tooltip").exists()).toBe(false);
  });

  it("has name StepLineChart", () => {
    expect(StepLineChart.name).toBe("StepLineChart");
  });
});
