import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { OHLCChart } from "./index.js";

// Lun/Ven haussiers (close ≥ open), Mer baissier (close < open).
const week = [
  { label: "Lun", open: 142, high: 148, low: 139, close: 146 },
  { label: "Mar", open: 146, high: 151, low: 144, close: 149 },
  { label: "Mer", open: 149, high: 152, low: 140, close: 143 },
  { label: "Jeu", open: 143, high: 147, low: 138, close: 145 },
  { label: "Ven", open: 145, high: 155, low: 144, close: 153 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("OHLCChart", () => {
  it("renders one bar per period", () => {
    const wrapper = mount(OHLCChart, { props: { label: "Cours", data: week } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-ohlcChart__bar").length).toBe(week.length);
    expect(el.querySelectorAll(".st-ohlcChart__range").length).toBe(week.length);
  });

  it("renders an open tick (left) and a close tick (right) per period", () => {
    const wrapper = mount(OHLCChart, { props: { label: "Cours", data: week } });
    const el = wrapper.element as HTMLElement;
    const opens = el.querySelectorAll<SVGLineElement>(".st-ohlcChart__open");
    const closes = el.querySelectorAll<SVGLineElement>(".st-ohlcChart__close");
    expect(opens.length).toBe(week.length);
    expect(closes.length).toBe(week.length);
    const open0 = opens[0];
    const close0 = closes[0];
    expect(Number(open0.getAttribute("x1"))).toBeLessThan(Number(open0.getAttribute("x2")));
    expect(Number(close0.getAttribute("x1"))).toBeLessThan(Number(close0.getAttribute("x2")));
  });

  it("applies the up class when close ≥ open and the down class otherwise", () => {
    const wrapper = mount(OHLCChart, { props: { label: "Cours", data: week } });
    const el = wrapper.element as HTMLElement;
    const bars = el.querySelectorAll(".st-ohlcChart__bar");
    expect(bars[0].classList.contains("st-ohlcChart__bar--up")).toBe(true);
    expect(bars[0].classList.contains("st-ohlcChart__bar--down")).toBe(false);
    expect(bars[2].classList.contains("st-ohlcChart__bar--down")).toBe(true);
    expect(bars[2].classList.contains("st-ohlcChart__bar--up")).toBe(false);
  });

  it("summarizes O/H/L/C per period in the accessible list", () => {
    const wrapper = mount(OHLCChart, { props: { label: "Cours", data: week } });
    const items = listItems(wrapper.element as HTMLElement);
    expect(items.length).toBe(week.length);
    expect(items[0]).toBe("Lun: O 142 H 148 L 139 C 146");
  });

  it("drops non-finite periods before rendering", () => {
    const wrapper = mount(OHLCChart, {
      props: {
        label: "Filtré",
        data: [
          { label: "Bad", open: Number.NaN, high: 10, low: 1, close: 5 },
          { label: "Ok", open: 4, high: 8, low: 2, close: 6 },
        ],
      },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-ohlcChart__bar").length).toBe(1);
  });

  it("treats close === open as bullish (up)", () => {
    const wrapper = mount(OHLCChart, {
      props: { label: "Flat", data: [{ label: "Flat", open: 10, high: 12, low: 8, close: 10 }] },
    });
    const el = wrapper.element as HTMLElement;
    const bar = el.querySelector(".st-ohlcChart__bar");
    expect(bar?.classList.contains("st-ohlcChart__bar--up")).toBe(true);
  });
});
