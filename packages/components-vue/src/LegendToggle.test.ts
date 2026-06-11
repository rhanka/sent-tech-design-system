import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { StackedBarChart, ComboChart } from "./index.js";
import type { StackedBarDatum } from "./StackedBarChart.js";
import type { ComboChartBarSeries, ComboChartLineSeries } from "./ComboChart.js";

// FR-4 — interactive legend (toggle series visibility), strict tri-framework parity.

const stackData: StackedBarDatum[] = [
  { label: "Q1", segments: [
    { label: "Alpha", value: 10 },
    { label: "Beta", value: 20 },
    { label: "Gamma", value: 30 },
  ] },
  { label: "Q2", segments: [
    { label: "Alpha", value: 15 },
    { label: "Beta", value: 25 },
    { label: "Gamma", value: 5 },
  ] },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("StackedBarChart — interactive legend (FR-4)", () => {
  it("is non-interactive by default (no props): legend items are plain, no buttons", () => {
    const wrapper = mount(StackedBarChart, { props: { data: stackData, label: "Stack" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-stackedBar__legendButton").length).toBe(0);
    expect(el.querySelectorAll(".st-stackedBar__seg").length).toBe(6);
  });

  it("renders legend buttons with aria-pressed when onToggleSeries is provided", () => {
    const onToggleSeries = vi.fn();
    const wrapper = mount(StackedBarChart, { props: { data: stackData, label: "Stack", onToggleSeries } });
    const el = wrapper.element as HTMLElement;
    const buttons = el.querySelectorAll<HTMLButtonElement>(".st-stackedBar__legendButton");
    expect(buttons.length).toBe(3);
    buttons.forEach((b) => expect(b.getAttribute("aria-pressed")).toBe("false"));
  });

  it("emits the series id on click", async () => {
    const onToggleSeries = vi.fn();
    const wrapper = mount(StackedBarChart, { props: { data: stackData, label: "Stack", onToggleSeries } });
    const el = wrapper.element as HTMLElement;
    const buttons = el.querySelectorAll<HTMLButtonElement>(".st-stackedBar__legendButton");
    await buttons[1].click();
    expect(onToggleSeries).toHaveBeenCalledWith("Beta");
  });

  it("hides series in hiddenSeries: segments dropped, item shown off, removed from data list", () => {
    const wrapper = mount(StackedBarChart, {
      props: { data: stackData, label: "Stack", hiddenSeries: ["Beta"], onToggleSeries: () => {} },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-stackedBar__seg").length).toBe(4);
    const offItem = el.querySelector(".st-stackedBar__legendItem--off");
    expect(offItem?.textContent).toContain("Beta");
    const betaButton = Array.from(el.querySelectorAll<HTMLButtonElement>(".st-stackedBar__legendButton")).find(
      (b) => b.textContent?.includes("Beta"),
    );
    expect(betaButton?.getAttribute("aria-pressed")).toBe("true");
    expect(listItems(el).some((t) => t?.includes("Beta"))).toBe(false);
    expect(listItems(el).some((t) => t?.includes("Alpha"))).toBe(true);
  });

  it("keeps tone stable for visible series when a series is hidden", () => {
    const wrapper = mount(StackedBarChart, {
      props: { data: stackData, label: "Stack", hiddenSeries: ["Alpha"], onToggleSeries: () => {} },
    });
    const el = wrapper.element as HTMLElement;
    const segs = Array.from(el.querySelectorAll(".st-stackedBar__seg")).map((s) => s.getAttribute("class"));
    expect(segs.some((c) => c?.includes("st-stackedBar__seg--category1"))).toBe(false);
    expect(segs.some((c) => c?.includes("st-stackedBar__seg--category2"))).toBe(true);
    expect(segs.some((c) => c?.includes("st-stackedBar__seg--category3"))).toBe(true);
  });
});

const categories = ["Jan", "Feb", "Mar"];
const bars: ComboChartBarSeries[] = [
  { label: "Revenue", data: [100, 200, 150], tone: "category1" },
  { label: "Cost", data: [60, 90, 80], tone: "category2" },
];
const lines: ComboChartLineSeries[] = [{ label: "Margin", data: [10, 25, 18], tone: "category3" }];

describe("ComboChart — interactive legend (FR-4)", () => {
  it("legend has aria-hidden by default and no buttons", () => {
    const wrapper = mount(ComboChart, { props: { categories, bars, lines, label: "Perf" } });
    const el = wrapper.element as HTMLElement;
    const ul = el.querySelector(".st-comboChart__legend");
    expect(ul?.getAttribute("aria-hidden")).toBe("true");
    expect(el.querySelectorAll(".st-comboChart__legendButton").length).toBe(0);
  });

  it("drops aria-hidden and renders buttons in interactive mode", () => {
    const onToggleSeries = vi.fn();
    const wrapper = mount(ComboChart, { props: { categories, bars, lines, label: "Perf", onToggleSeries } });
    const el = wrapper.element as HTMLElement;
    const ul = el.querySelector(".st-comboChart__legend");
    expect(ul?.getAttribute("aria-hidden")).toBeNull();
    expect(el.querySelectorAll(".st-comboChart__legendButton").length).toBe(3);
  });

  it("emits id on click", async () => {
    const onToggleSeries = vi.fn();
    const wrapper = mount(ComboChart, { props: { categories, bars, lines, label: "Perf", onToggleSeries } });
    const el = wrapper.element as HTMLElement;
    const costBtn = Array.from(el.querySelectorAll<HTMLButtonElement>(".st-comboChart__legendButton")).find(
      (b) => b.textContent?.includes("Cost"),
    )!;
    await costBtn.click();
    expect(onToggleSeries).toHaveBeenCalledWith("Cost");
  });

  it("hides a line series when in hiddenSeries", () => {
    const wrapper = mount(ComboChart, {
      props: { categories, bars, lines, label: "Perf", hiddenSeries: ["Margin"], onToggleSeries: () => {} },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-comboChart__line").length).toBe(0);
    expect(el.querySelectorAll(".st-comboChart__dot").length).toBe(0);
    expect(el.querySelectorAll(".st-comboChart__bar").length).toBeGreaterThan(0);
    const off = el.querySelector(".st-comboChart__legendItem--off");
    expect(off?.textContent).toContain("Margin");
    expect(listItems(el).some((t) => t?.includes("Margin"))).toBe(false);
  });

  it("hides a bar series when in hiddenSeries (its rects gone)", () => {
    const wrapper = mount(ComboChart, {
      props: { categories, bars, lines, label: "Perf", hiddenSeries: ["Cost"], onToggleSeries: () => {} },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-comboChart__bar").length).toBe(categories.length);
    expect(listItems(el).some((t) => t?.includes("Cost"))).toBe(false);
  });
});
