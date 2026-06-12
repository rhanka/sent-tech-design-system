import { mount } from "@vue/test-utils";
import type { VueWrapper } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { OHLCChart } from "./index.js";
import type { ChartAnnotation } from "./chartAnnotations.js";

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

const press = (wrapper: VueWrapper, base: string, i: number, key: string) =>
  wrapper.findAll(`.${base}__navDatum`)[i].trigger("keydown", { key });

// "Highcharts-class" extensions: annotations / dataLabels / crosshair / nav.
describe("OHLCChart — annotations / dataLabels / crosshair / keyboard nav", () => {
  it("renders no overlay primitives by default", () => {
    const el = mount(OHLCChart, { props: { label: "Cours", data: week } }).element as HTMLElement;
    expect(el.querySelector(".st-ohlcChart__annotations")).toBeNull();
    expect(el.querySelector(".st-ohlcChart__dataLabel")).toBeNull();
    expect(el.querySelector(".st-ohlcChart__crosshairLine")).toBeNull();
    expect(el.querySelector(".st-ohlcChart__navLayer")).toBeNull();
  });

  it("renders a support line, a price region and a point annotation", () => {
    const annotations: ChartAnnotation[] = [
      { kind: "line", axis: "y", value: 150, label: "Résistance" },
      { kind: "region", axis: "y", from: 140, to: 145, label: "Zone" },
      { kind: "point", x: "Mer", y: 143, label: "Creux" },
    ];
    const el = mount(OHLCChart, { props: { label: "Cours", data: week, annotations } }).element as HTMLElement;
    expect(el.querySelectorAll(".st-ohlcChart__annotationLine").length).toBe(1);
    expect(el.querySelectorAll(".st-ohlcChart__annotationRegion").length).toBe(1);
    expect(el.querySelectorAll(".st-ohlcChart__annotationPoint").length).toBe(1);
    const items = listItems(el);
    expect(items).toContain("Annotation: Résistance");
    expect(items).toContain("Annotation: Zone");
    expect(items).toContain("Annotation: Creux");
  });

  it("renders one close data label per bar (aria-hidden)", () => {
    const el = mount(OHLCChart, { props: { label: "Cours", data: week, dataLabels: true } }).element as HTMLElement;
    const group = el.querySelector(".st-ohlcChart__dataLabels");
    expect(group?.getAttribute("aria-hidden")).toBe("true");
    const labels = el.querySelectorAll(".st-ohlcChart__dataLabel");
    expect(labels.length).toBe(week.length);
    expect(labels[0].textContent).toBe("146");
  });

  it("draws a controlled crosshair at the bar matching hoverKey", async () => {
    const wrapper = mount(OHLCChart, { props: { label: "Cours", data: week, hoverKey: null } });
    expect((wrapper.element as HTMLElement).querySelector(".st-ohlcChart__crosshairLine")).toBeNull();
    await wrapper.setProps({ hoverKey: "Mer" });
    expect((wrapper.element as HTMLElement).querySelector(".st-ohlcChart__crosshairLine")).not.toBeNull();
  });

  it("enables a roving keyboard overlay announcing date + O/H/L/C", async () => {
    const onSelectKey = vi.fn();
    const wrapper = mount(OHLCChart, { props: { label: "Cours", data: week, onSelectKey } });
    const el = wrapper.element as HTMLElement;
    const datums = Array.from(el.querySelectorAll<SVGRectElement>(".st-ohlcChart__navDatum"));
    expect(datums.length).toBe(week.length);
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1", "-1", "-1"]);
    expect(datums[0].getAttribute("aria-label")).toBe("Lun, O 142 H 148 L 139 C 146");
    await press(wrapper, "st-ohlcChart", 0, "ArrowRight");
    await press(wrapper, "st-ohlcChart", 1, "Enter");
    expect(onSelectKey).toHaveBeenLastCalledWith("Mar");
  });
});
