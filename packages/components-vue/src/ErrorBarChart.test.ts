import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { ErrorBarChart } from "./index.js";
import type { ErrorBarChartDatum } from "./ErrorBarChart.js";

const data: ErrorBarChartDatum[] = [
  { category: "Ingénierie", value: 70, low: 62, high: 78 },
  { category: "Design", value: 61, low: 54, high: 69 },
  { category: "Ventes", value: 60, low: 50, high: 72 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("ErrorBarChart", () => {
  it("renders a whisker line per category", () => {
    const wrapper = mount(ErrorBarChart, { props: { label: "Mesures", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-errorBarChart__whisker").length).toBe(3);
  });

  it("renders two caps (low + high) per category", () => {
    const wrapper = mount(ErrorBarChart, { props: { label: "Mesures", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-errorBarChart__cap").length).toBe(6);
    expect(el.querySelectorAll(".st-errorBarChart__cap--low").length).toBe(3);
    expect(el.querySelectorAll(".st-errorBarChart__cap--high").length).toBe(3);
  });

  it("renders a center marker per category", () => {
    const wrapper = mount(ErrorBarChart, { props: { label: "Mesures", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-errorBarChart__marker").length).toBe(3);
  });

  it("summarizes each value (low – high) in the accessible list", () => {
    const wrapper = mount(ErrorBarChart, { props: { label: "Mesures", data } });
    expect(listItems(wrapper.element as HTMLElement)).toEqual([
      "Ingénierie: 70 (62 – 78)",
      "Design: 61 (54 – 69)",
      "Ventes: 60 (50 – 72)",
    ]);
  });

  it("normalizes inverted low/high and clamps value into bounds", () => {
    const wrapper = mount(ErrorBarChart, { props: { label: "Inv", data: [{ category: "X", value: 15, low: 10, high: 2 }] } });
    expect(listItems(wrapper.element as HTMLElement)).toEqual(["X: 10 (2 – 10)"]);
  });

  it("drops data with non-finite bounds", () => {
    const wrapper = mount(ErrorBarChart, {
      props: {
        label: "NaN",
        data: [
          { category: "A", value: 3, low: NaN, high: 5 },
          { category: "B", value: 2, low: 1, high: 4 },
        ],
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(listItems(el)).toEqual(["B: 2 (1 – 4)"]);
    expect(el.querySelectorAll(".st-errorBarChart__marker").length).toBe(1);
  });

  it("applies the tone class to whisker, caps and marker", () => {
    const wrapper = mount(ErrorBarChart, { props: { label: "Tone", data, tone: "category3" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-errorBarChart__whisker")?.classList.contains("st-errorBarChart__whisker--category3")).toBe(true);
    expect(el.querySelector(".st-errorBarChart__cap")?.classList.contains("st-errorBarChart__cap--category3")).toBe(true);
    expect(el.querySelector(".st-errorBarChart__marker")?.classList.contains("st-errorBarChart__marker--category3")).toBe(true);
  });

  it("renders a legend with the chart label", () => {
    const wrapper = mount(ErrorBarChart, { props: { label: "Croissance", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.textContent).toContain("Croissance");
  });
});
