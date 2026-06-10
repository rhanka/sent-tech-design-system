import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { ColumnRangeChart } from "./index.js";
import type { ColumnRangeChartDatum } from "./ColumnRangeChart.js";

const data: ColumnRangeChartDatum[] = [
  { category: "Jan", low: -4, high: 3 },
  { category: "Avr", low: 5, high: 16 },
  { category: "Juil", low: 15, high: 28 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("ColumnRangeChart", () => {
  it("renders one range bar per datum", () => {
    const wrapper = mount(ColumnRangeChart, { props: { label: "Temps", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-columnRangeChart__bar").length).toBe(3);
  });

  it("summarizes each range (low – high) in the accessible list", () => {
    const wrapper = mount(ColumnRangeChart, { props: { label: "Temps", data } });
    expect(listItems(wrapper.element as HTMLElement)).toEqual(["Jan: -4 – 3", "Avr: 5 – 16", "Juil: 15 – 28"]);
  });

  it("normalizes inverted low/high (lo <= hi)", () => {
    const wrapper = mount(ColumnRangeChart, {
      props: { label: "Inv", data: [{ category: "X", low: 10, high: 2 }] },
    });
    const el = wrapper.element as HTMLElement;
    expect(listItems(el)).toEqual(["X: 2 – 10"]);
    expect(el.querySelectorAll(".st-columnRangeChart__bar").length).toBe(1);
  });

  it("drops data with non-finite bounds", () => {
    const wrapper = mount(ColumnRangeChart, {
      props: { label: "NaN", data: [{ category: "A", low: NaN, high: 5 }, { category: "B", low: 1, high: 4 }] },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-columnRangeChart__bar").length).toBe(1);
    expect(listItems(el)).toEqual(["B: 1 – 4"]);
  });
});
