import { mount } from "@vue/test-utils";
import type { VueWrapper } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ComboChart } from "./index.js";
import type { ComboChartBarSeries, ComboChartLineSeries } from "./ComboChart.js";
import type { ChartAnnotation } from "./chartAnnotations.js";

// ComboChart "Highcharts-class" extensions (FR-1/2/3/5) — strict tri-framework
// parity. The shared categorical x axis drives annotations, crosshair and the
// datapoint keyboard navigation; dataLabels sit on the bars AND the line points.

const categories = ["Jan", "Feb", "Mar"];
const bars: ComboChartBarSeries[] = [{ label: "Revenue", data: [100, 200, 150], tone: "category1" }];
const lines: ComboChartLineSeries[] = [{ label: "Margin", data: [10, 25, 18], tone: "category3" }];

const navDatums = (el: HTMLElement) =>
  Array.from(el.querySelectorAll<SVGRectElement>(".st-comboChart__navDatum"));
const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());
const press = (wrapper: VueWrapper, i: number, key: string) =>
  wrapper.findAll(".st-comboChart__navDatum")[i].trigger("keydown", { key });

describe("ComboChart — annotations (FR-1)", () => {
  it("renders no annotation layer by default", () => {
    const el = mount(ComboChart, { props: { label: "C", categories, bars, lines } }).element as HTMLElement;
    expect(el.querySelector(".st-comboChart__annotations")).toBeNull();
  });

  it("renders a y-axis region behind, a category point above, and announces labels", () => {
    const annotations: ChartAnnotation[] = [
      { kind: "region", axis: "y", from: 50, to: 120, label: "Cible" },
      { kind: "point", x: "Feb", y: 180, label: "Pic" },
      { kind: "label", x: "Mar", y: 150, text: "Note" },
    ];
    const el = mount(ComboChart, { props: { label: "C", categories, bars, lines, annotations } }).element as HTMLElement;
    expect(el.querySelector(".st-comboChart__annotations--behind")).not.toBeNull();
    expect(el.querySelector(".st-comboChart__annotationRegion")).not.toBeNull();
    expect(el.querySelector(".st-comboChart__annotationPoint")).not.toBeNull();
    expect(el.querySelector(".st-comboChart__annotationText")?.textContent).toBe("Note");
    expect(listItems(el)).toEqual(expect.arrayContaining(["Annotation: Cible", "Annotation: Pic", "Annotation: Note"]));
  });
});

describe("ComboChart — dataLabels (FR-2)", () => {
  it("off by default; true labels both bars and line points", () => {
    const off = mount(ComboChart, { props: { label: "C", categories, bars, lines } }).element as HTMLElement;
    expect(off.querySelectorAll(".st-comboChart__dataLabel").length).toBe(0);

    const el = mount(ComboChart, { props: { label: "C", categories, bars, lines, dataLabels: true } }).element as HTMLElement;
    const labels = Array.from(el.querySelectorAll(".st-comboChart__dataLabel")).map((n) => n.textContent?.trim());
    expect(labels.length).toBe(6);
    expect(labels).toEqual(expect.arrayContaining(["100", "200", "150", "10", "25", "18"]));
  });

  it("accepts a custom format", () => {
    const el = mount(ComboChart, {
      props: { label: "C", categories, bars, lines, dataLabels: { format: (v: number) => `${v}u` } },
    }).element as HTMLElement;
    const labels = Array.from(el.querySelectorAll(".st-comboChart__dataLabel")).map((n) => n.textContent?.trim());
    expect(labels).toContain("200u");
    expect(labels).toContain("25u");
  });
});

describe("ComboChart — crosshair / synchronised hover (FR-3)", () => {
  it("uncontrolled: no crosshair until a bar is hovered", async () => {
    const wrapper = mount(ComboChart, { props: { label: "C", categories, bars, lines } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-comboChart__crosshair")).toBeNull();
    await wrapper.findAll(".st-comboChart__bar")[1].trigger("pointermove");
    expect(el.querySelector(".st-comboChart__crosshair")).not.toBeNull();
  });

  it("controlled: crosshair tracks hoverKey (a category)", () => {
    const el = mount(ComboChart, { props: { label: "C", categories, bars, lines, hoverKey: "Mar" } }).element as HTMLElement;
    expect(el.querySelector(".st-comboChart__crosshairLine")).not.toBeNull();
  });

  it("controlled with hoverKey=null shows nothing", () => {
    const el = mount(ComboChart, { props: { label: "C", categories, bars, lines, hoverKey: null } }).element as HTMLElement;
    expect(el.querySelector(".st-comboChart__crosshair")).toBeNull();
  });

  it("emits onHoverKeyChange with the CATEGORY on bar + line hover and null on leave", async () => {
    const onHoverKeyChange = vi.fn();
    const wrapper = mount(ComboChart, { props: { label: "C", categories, bars, lines, onHoverKeyChange } });
    await wrapper.findAll(".st-comboChart__bar")[2].trigger("pointermove");
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("Mar");
    await wrapper.findAll(".st-comboChart__dot")[0].trigger("pointermove");
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("Jan");
    await wrapper.find(".st-comboChart__visual").trigger("pointerleave");
    expect(onHoverKeyChange).toHaveBeenLastCalledWith(null);
  });
});

describe("ComboChart — keyboard datapoint navigation (FR-5)", () => {
  it("no overlay by default", () => {
    const el = mount(ComboChart, { props: { label: "C", categories, bars, lines } }).element as HTMLElement;
    expect(el.querySelector(".st-comboChart__navLayer")).toBeNull();
    expect(navDatums(el).length).toBe(0);
  });

  it("one focusable column per category, single roving tab stop, announces category + summary", () => {
    const el = mount(ComboChart, { props: { label: "C", categories, bars, lines, keyboardNav: true } }).element as HTMLElement;
    const datums = navDatums(el);
    expect(datums.length).toBe(3);
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
    expect(datums[1].getAttribute("aria-label")).toBe("Feb, Revenue: 200, Margin: 25");
    expect(el.querySelector(".st-comboChart__navLayer")?.getAttribute("role")).toBe("group");
  });

  it("arrows move focus; Enter selects with the category key; Escape leaves", async () => {
    const onSelectKey = vi.fn();
    const wrapper = mount(ComboChart, { props: { label: "C", categories, bars, lines, onSelectKey } });
    const el = wrapper.element as HTMLElement;
    await press(wrapper, 0, "ArrowRight");
    expect(navDatums(el).map((d) => d.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
    await press(wrapper, 1, "Enter");
    expect(onSelectKey).toHaveBeenLastCalledWith("Feb");
    await press(wrapper, 1, "Escape");
    expect(onSelectKey).toHaveBeenLastCalledWith(null);
  });

  it("focusing a column drives the shared crosshair channel (FR-3 synergy)", async () => {
    const onHoverKeyChange = vi.fn();
    const wrapper = mount(ComboChart, { props: { label: "C", categories, bars, lines, keyboardNav: true, onHoverKeyChange } });
    await press(wrapper, 0, "End");
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("Mar");
  });
});

describe("ComboChart — existing FR-4 legend untouched", () => {
  it("still toggles series via onToggleSeries / hiddenSeries", async () => {
    const onToggleSeries = vi.fn();
    const wrapper = mount(ComboChart, {
      props: { label: "C", categories, bars, lines, hiddenSeries: ["Margin"], onToggleSeries },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelectorAll(".st-comboChart__dot").length).toBe(0);
    const buttons = wrapper.findAll(".st-comboChart__legendButton");
    expect(buttons.length).toBe(2);
    await buttons[0].trigger("click");
    expect(onToggleSeries).toHaveBeenCalledWith("Revenue");
  });
});
