import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { AreaRangeChart } from "./index.js";
import type { AreaRangeChartDatum } from "./AreaRangeChart.js";

const data: AreaRangeChartDatum[] = [
  { x: "Jan", low: -4, high: 3 },
  { x: "Avr", low: 5, high: 16 },
  { x: "Juil", low: 15, high: 28 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("AreaRangeChart", () => {
  it("renders a filled band (area path) and low/high lines", () => {
    const wrapper = mount(AreaRangeChart, { props: { label: "Temps", data } });
    const el = wrapper.element as HTMLElement;
    const area = el.querySelector(".st-areaRangeChart__area");
    expect(area).toBeTruthy();
    expect(area?.getAttribute("d")).toBeTruthy();
    expect(area?.getAttribute("d")?.trim().endsWith("Z")).toBe(true);
    expect(area?.getAttribute("fill")).toContain("url(#st-arearangechart-gradient-");
    expect(el.querySelector(".st-areaRangeChart__line--high")).toBeTruthy();
    expect(el.querySelector(".st-areaRangeChart__line--low")).toBeTruthy();
  });

  it("renders two dots (low + high) per datum", () => {
    const wrapper = mount(AreaRangeChart, { props: { label: "Temps", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-areaRangeChart__dot").length).toBe(6);
  });

  it("summarizes each range (low – high) in the accessible list", () => {
    const wrapper = mount(AreaRangeChart, { props: { label: "Temps", data } });
    expect(listItems(wrapper.element as HTMLElement)).toEqual(["Jan: -4 – 3", "Avr: 5 – 16", "Juil: 15 – 28"]);
  });

  it("normalizes inverted low/high (lo <= hi)", () => {
    const wrapper = mount(AreaRangeChart, { props: { label: "Inv", data: [{ x: "X", low: 10, high: 2 }] } });
    expect(listItems(wrapper.element as HTMLElement)).toEqual(["X: 2 – 10"]);
  });

  it("drops data with non-finite bounds", () => {
    const wrapper = mount(AreaRangeChart, {
      props: { label: "NaN", data: [{ x: "A", low: NaN, high: 5 }, { x: "B", low: 1, high: 4 }] },
    });
    const el = wrapper.element as HTMLElement;
    expect(listItems(el)).toEqual(["B: 1 – 4"]);
    expect(el.querySelectorAll(".st-areaRangeChart__dot").length).toBe(2);
  });

  it("applies the tone modifier class", () => {
    const wrapper = mount(AreaRangeChart, { props: { label: "Tone", data, tone: "category3" } });
    const el = wrapper.element as HTMLElement;
    expect(el.className).toContain("st-areaRangeChart--category3");
  });
});
