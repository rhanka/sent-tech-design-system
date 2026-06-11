import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { HLCChart } from "./HLCChart.js";

// close vs. close précédent : index 0 = hausse (1re barre), index 2 = baisse (143 < 149).
const week = [
  { label: "Lun", high: 148, low: 139, close: 146 },
  { label: "Mar", high: 151, low: 144, close: 149 },
  { label: "Mer", high: 152, low: 140, close: 143 },
  { label: "Jeu", high: 147, low: 138, close: 145 },
  { label: "Ven", high: 155, low: 144, close: 153 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("HLCChart", () => {
  it("renders one bar per period", () => {
    const wrapper = mount(HLCChart, { props: { label: "Cours", data: week } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-hlcChart__bar").length).toBe(week.length);
    expect(el.querySelectorAll(".st-hlcChart__range").length).toBe(week.length);
  });

  it("renders a close tick (right) per period and no open tick", () => {
    const wrapper = mount(HLCChart, { props: { label: "Cours", data: week } });
    const el = wrapper.element as HTMLElement;
    const closes = el.querySelectorAll<SVGLineElement>(".st-hlcChart__close");
    expect(closes.length).toBe(week.length);
    expect(el.querySelectorAll(".st-hlcChart__open").length).toBe(0);
    const close0 = closes[0];
    expect(Number(close0.getAttribute("x1"))).toBeLessThan(Number(close0.getAttribute("x2")));
  });

  it("applies the up class when close ≥ previous close and the down class otherwise", () => {
    const wrapper = mount(HLCChart, { props: { label: "Cours", data: week } });
    const el = wrapper.element as HTMLElement;
    const bars = el.querySelectorAll(".st-hlcChart__bar");
    expect(bars[0].classList.contains("st-hlcChart__bar--up")).toBe(true);
    expect(bars[0].classList.contains("st-hlcChart__bar--down")).toBe(false);
    expect(bars[2].classList.contains("st-hlcChart__bar--down")).toBe(true);
    expect(bars[2].classList.contains("st-hlcChart__bar--up")).toBe(false);
  });

  it("summarizes H/L/C per period in the accessible list", () => {
    const wrapper = mount(HLCChart, { props: { label: "Cours", data: week } });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items.length).toBe(week.length);
    expect(items[0]).toBe("Lun: H 148 L 139 C 146");
  });

  it("drops non-finite periods before rendering", () => {
    const wrapper = mount(HLCChart, {
      props: {
        label: "Filtré",
        data: [
          { label: "Bad", high: Number.NaN, low: 1, close: 5 },
          { label: "Ok", high: 8, low: 2, close: 6 },
        ],
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-hlcChart__bar").length).toBe(1);
  });

  it("treats the first period as bullish (up)", () => {
    const wrapper = mount(HLCChart, {
      props: { label: "Flat", data: [{ label: "Flat", high: 12, low: 8, close: 10 }] },
    });
    const el = wrapper.element as HTMLElement;
    const bar = el.querySelector(".st-hlcChart__bar");
    expect(bar?.classList.contains("st-hlcChart__bar--up")).toBe(true);
  });
});
