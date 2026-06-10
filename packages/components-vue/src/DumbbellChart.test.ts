import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { DumbbellChart } from "./index.js";
import type { DumbbellChartDatum } from "./DumbbellChart.js";

const data: DumbbellChartDatum[] = [
  { category: "Ingénierie", low: 62, high: 78 },
  { category: "Design", low: 54, high: 69 },
  { category: "Ventes", low: 50, high: 72 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("DumbbellChart", () => {
  it("renders a connector line per category", () => {
    const wrapper = mount(DumbbellChart, { props: { label: "Salaires", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-dumbbellChart__connector").length).toBe(3);
  });

  it("renders two dots (low + high) per category", () => {
    const wrapper = mount(DumbbellChart, { props: { label: "Salaires", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-dumbbellChart__dot").length).toBe(6);
    expect(el.querySelectorAll(".st-dumbbellChart__dot--low").length).toBe(3);
    expect(el.querySelectorAll(".st-dumbbellChart__dot--high").length).toBe(3);
  });

  it("summarizes each range (low – high) in the accessible list", () => {
    const wrapper = mount(DumbbellChart, { props: { label: "Salaires", data } });
    expect(listItems(wrapper.element as HTMLElement)).toEqual([
      "Ingénierie: 62 – 78",
      "Design: 54 – 69",
      "Ventes: 50 – 72",
    ]);
  });

  it("normalizes inverted low/high (lo <= hi)", () => {
    const wrapper = mount(DumbbellChart, { props: { label: "Inv", data: [{ category: "X", low: 10, high: 2 }] } });
    expect(listItems(wrapper.element as HTMLElement)).toEqual(["X: 2 – 10"]);
  });

  it("drops data with non-finite bounds", () => {
    const wrapper = mount(DumbbellChart, {
      props: { label: "NaN", data: [{ category: "A", low: NaN, high: 5 }, { category: "B", low: 1, high: 4 }] },
    });
    const el = wrapper.element as HTMLElement;
    expect(listItems(el)).toEqual(["B: 1 – 4"]);
    expect(el.querySelectorAll(".st-dumbbellChart__dot").length).toBe(2);
  });

  it("applies the low/high tone classes to the dots", () => {
    const wrapper = mount(DumbbellChart, { props: { label: "Tone", data, lowTone: "category3", highTone: "category5" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-dumbbellChart__dot--low")?.classList.contains("st-dumbbellChart__dot--category3")).toBe(true);
    expect(el.querySelector(".st-dumbbellChart__dot--high")?.classList.contains("st-dumbbellChart__dot--category5")).toBe(true);
  });

  it("renders a legend with the low/high labels", () => {
    const wrapper = mount(DumbbellChart, { props: { label: "Legend", data, lowLabel: "2019", highLabel: "2024" } });
    const el = wrapper.element as HTMLElement;
    expect(el.textContent).toContain("2019");
    expect(el.textContent).toContain("2024");
  });
});
