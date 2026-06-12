import { mount } from "@vue/test-utils";
import type { VueWrapper } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { LineChart, BarChart, AreaChart } from "./index.js";
import type { LineChartDatum } from "./LineChart.js";
import type { BarChartDatum } from "./BarChart.js";

// FR-5 — roving-tabindex keyboard navigation of the data points (a11y), strict
// tri-framework parity. Charts: BarChart, LineChart, AreaChart.

const lineData: LineChartDatum[] = [
  { x: "Jan", y: 2 },
  { x: "Feb", y: 4 },
  { x: "Mar", y: 6 },
];
const barData: BarChartDatum[] = [
  { label: "A", value: 5 },
  { label: "B", value: 9 },
  { label: "C", value: 3 },
];

const navDatums = (el: HTMLElement, base: string) =>
  Array.from(el.querySelectorAll<SVGRectElement>(`.${base}__navDatum`));
// Fire a keydown on the i-th nav datum via test-utils so the `key` lands on the
// event and Vue flushes the re-render before assertions.
const press = (wrapper: VueWrapper, base: string, i: number, key: string) =>
  wrapper.findAll(`.${base}__navDatum`)[i].trigger("keydown", { key });

describe("BarChart — keyboard datapoint navigation (FR-5)", () => {
  it("renders no nav overlay by default (backward compatible)", () => {
    const el = mount(BarChart, { props: { label: "Bars", data: barData } }).element as HTMLElement;
    expect(el.querySelector(".st-barChart__navLayer")).toBeNull();
    expect(navDatums(el, "st-barChart").length).toBe(0);
  });

  it("enables the overlay when keyboardNav is set, one focusable datum per bar", () => {
    const el = mount(BarChart, { props: { label: "Bars", data: barData, keyboardNav: true } }).element as HTMLElement;
    const datums = navDatums(el, "st-barChart");
    expect(datums.length).toBe(3);
    // Single tab stop (roving): the first datum is tabbable, the rest are -1.
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
    // Each datum announces category + value.
    expect(datums[1].getAttribute("aria-label")).toBe("B, 9");
    expect(datums[1].getAttribute("role")).toBe("img");
    expect(el.querySelector(".st-barChart__navLayer")?.getAttribute("role")).toBe("group");
  });

  it("is enabled implicitly by wiring onSelectKey", () => {
    const el = mount(BarChart, { props: { label: "Bars", data: barData, onSelectKey: () => {} } }).element as HTMLElement;
    expect(navDatums(el, "st-barChart").length).toBe(3);
  });

  it("ArrowRight / ArrowLeft move the roving tab stop", async () => {
    const wrapper = mount(BarChart, { props: { label: "Bars", data: barData, keyboardNav: true } });
    const el = wrapper.element as HTMLElement;
    await press(wrapper, "st-barChart", 0, "ArrowRight");
    expect(navDatums(el, "st-barChart").map((d) => d.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
    await press(wrapper, "st-barChart", 1, "ArrowLeft");
    expect(navDatums(el, "st-barChart").map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("Home / End jump to first / last", async () => {
    const wrapper = mount(BarChart, { props: { label: "Bars", data: barData, keyboardNav: true } });
    const el = wrapper.element as HTMLElement;
    await press(wrapper, "st-barChart", 0, "End");
    expect(navDatums(el, "st-barChart").map((d) => d.getAttribute("tabindex"))).toEqual(["-1", "-1", "0"]);
    await press(wrapper, "st-barChart", 2, "Home");
    expect(navDatums(el, "st-barChart").map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("Arrow movement clamps at the edges", async () => {
    const wrapper = mount(BarChart, { props: { label: "Bars", data: barData, keyboardNav: true } });
    const el = wrapper.element as HTMLElement;
    await press(wrapper, "st-barChart", 0, "ArrowLeft"); // already first → stays
    expect(navDatums(el, "st-barChart").map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("Enter / Space select the focused bar (onSelectKey with its label)", async () => {
    const onSelectKey = vi.fn();
    const wrapper = mount(BarChart, { props: { label: "Bars", data: barData, onSelectKey } });
    await press(wrapper, "st-barChart", 1, "ArrowRight"); // focus C (index 2)
    await press(wrapper, "st-barChart", 2, "Enter");
    expect(onSelectKey).toHaveBeenLastCalledWith("C");
    await press(wrapper, "st-barChart", 2, " ");
    expect(onSelectKey).toHaveBeenLastCalledWith("C");
  });

  it("Escape leaves the navigation (onSelectKey null) and resets the tab stop", async () => {
    const onSelectKey = vi.fn();
    const wrapper = mount(BarChart, { props: { label: "Bars", data: barData, onSelectKey } });
    const el = wrapper.element as HTMLElement;
    await press(wrapper, "st-barChart", 0, "End");
    await press(wrapper, "st-barChart", 2, "Escape");
    expect(onSelectKey).toHaveBeenLastCalledWith(null);
    // Tab stop falls back to the first datum.
    expect(navDatums(el, "st-barChart").map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("focusing a datum drives the shared crosshair (onHoverKeyChange) — FR-3 synergy", async () => {
    const onHoverKeyChange = vi.fn();
    const wrapper = mount(BarChart, {
      props: { label: "Bars", data: barData, keyboardNav: true, onHoverKeyChange },
    });
    await press(wrapper, "st-barChart", 0, "ArrowRight");
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("B");
  });
});

describe("LineChart — keyboard datapoint navigation (FR-5)", () => {
  it("no overlay by default", () => {
    const el = mount(LineChart, { props: { label: "Line", data: lineData } }).element as HTMLElement;
    expect(navDatums(el, "st-lineChart").length).toBe(0);
  });

  it("overlay datums carry x + value labels in data order", () => {
    const el = mount(LineChart, { props: { label: "Line", data: lineData, keyboardNav: true } }).element as HTMLElement;
    const datums = navDatums(el, "st-lineChart");
    expect(datums.length).toBe(3);
    expect(datums.map((d) => d.getAttribute("aria-label"))).toEqual(["Jan, 2", "Feb, 4", "Mar, 6"]);
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("arrow keys move focus; Enter selects with the datum key (String(x))", async () => {
    const onSelectKey = vi.fn();
    const wrapper = mount(LineChart, { props: { label: "Line", data: lineData, onSelectKey } });
    await press(wrapper, "st-lineChart", 0, "ArrowDown");
    await press(wrapper, "st-lineChart", 1, "Enter");
    expect(onSelectKey).toHaveBeenLastCalledWith("Feb");
  });
});

describe("AreaChart — keyboard datapoint navigation (FR-5)", () => {
  const areaData = [
    { x: "Q1", y: 10 },
    { x: "Q2", y: 20 },
    { x: "Q3", y: 15 },
  ];

  it("no overlay by default", () => {
    const el = mount(AreaChart, { props: { label: "Area", data: areaData } }).element as HTMLElement;
    expect(navDatums(el, "st-areaChart").length).toBe(0);
  });

  it("overlay datums announce x + value", () => {
    const el = mount(AreaChart, { props: { label: "Area", data: areaData, keyboardNav: true } }).element as HTMLElement;
    const datums = navDatums(el, "st-areaChart");
    expect(datums.map((d) => d.getAttribute("aria-label"))).toEqual(["Q1, 10", "Q2, 20", "Q3, 15"]);
  });

  it("bare-number data announces the index as category and selects with index key", async () => {
    const onSelectKey = vi.fn();
    const wrapper = mount(AreaChart, { props: { label: "Area", data: [5, 7, 9], onSelectKey } });
    const el = wrapper.element as HTMLElement;
    const datums = navDatums(el, "st-areaChart");
    expect(datums[2].getAttribute("aria-label")).toBe("2, 9");
    await press(wrapper, "st-areaChart", 0, "End");
    await press(wrapper, "st-areaChart", 2, "Enter");
    expect(onSelectKey).toHaveBeenLastCalledWith("2");
  });
});
