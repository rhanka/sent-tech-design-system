import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { BarChart } from "./index.js";
import type { BarChartDatum } from "./BarChart.js";

const data: BarChartDatum[] = [
  { label: "A", value: 4 },
  { label: "B", value: 8 },
  { label: "C", value: 2 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());
const tickLabels = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-barChart__tickLabel")).map((n) => n.textContent?.trim());

describe("BarChart analytical overlays + error bars (parity with Svelte)", () => {
  it("renders no overlays/error bars by default (additive — zero regression)", () => {
    const wrapper = mount(BarChart, { props: { label: "Plain", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-barChart__band")).toBeNull();
    expect(el.querySelector(".st-barChart__refLine")).toBeNull();
    expect(el.querySelector(".st-barChart__goalLine")).toBeNull();
    expect(el.querySelector(".st-barChart__errorBar")).toBeNull();
    expect(listItems(el)).toEqual(["A: 4", "B: 8", "C: 2"]);
  });

  it("renders a toned reference line + a11y item", () => {
    const wrapper = mount(BarChart, {
      props: { label: "Ref", data, referenceLines: [{ value: 6, label: "Seuil", tone: "error" }] },
    });
    expect(wrapper.find(".st-barChart__refLine--error").exists()).toBe(true);
    expect(listItems(wrapper.element as HTMLElement)).toContain("Référence: Seuil = 6");
  });

  it("renders a band + goal line and describes both", () => {
    const wrapper = mount(BarChart, {
      props: { label: "BG", data, bands: [{ from: 2, to: 5, label: "Zone" }], goalLine: { value: 7 } },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-barChart__band")).not.toBeNull();
    expect(el.querySelector(".st-barChart__goalLine")).not.toBeNull();
    expect(listItems(el)).toContain("Bande: Zone (2–5)");
    expect(listItems(el)).toContain("Objectif: 7");
  });

  it("draws bands BELOW the bars and the goal line ABOVE (document order)", () => {
    const wrapper = mount(BarChart, {
      props: { label: "Order", data, bands: [{ from: 2, to: 5 }], goalLine: { value: 7 } },
    });
    const nodes = Array.from((wrapper.element as HTMLElement).querySelectorAll("svg *"));
    const firstBar = nodes.findIndex((n) => n.classList.contains("st-barChart__bar"));
    const band = nodes.findIndex((n) => n.classList.contains("st-barChart__band"));
    const goal = nodes.findIndex((n) => n.classList.contains("st-barChart__goalLine"));
    expect(band).toBeLessThan(firstBar);
    expect(goal).toBeGreaterThan(firstBar);
  });

  it("renders an error-bar whisker only for data with finite extents", () => {
    const withErrors: BarChartDatum[] = [
      { label: "A", value: 4, errorLow: 3, errorHigh: 5 },
      { label: "B", value: 8 },
      { label: "C", value: 2, errorLow: Number.NaN, errorHigh: Number.NaN },
    ];
    const wrapper = mount(BarChart, { props: { label: "Err", data: withErrors } });
    const groups = (wrapper.element as HTMLElement).querySelectorAll(".st-barChart__errorBar");
    expect(groups.length).toBe(1);
    expect(groups[0].querySelectorAll(".st-barChart__errorCap").length).toBe(2);
  });

  it("extends the auto domain for an out-of-range reference", () => {
    const wrapper = mount(BarChart, { props: { label: "Domain", data, referenceLines: [{ value: 100 }] } });
    expect(tickLabels(wrapper.element as HTMLElement)).toContain("100");
  });

  it("does NOT widen a pinned domain for overlays", () => {
    const wrapper = mount(BarChart, {
      props: { label: "Pinned", data, domain: [0, 10], referenceLines: [{ value: 100 }] },
    });
    expect(tickLabels(wrapper.element as HTMLElement)).not.toContain("100");
    expect(tickLabels(wrapper.element as HTMLElement)).toContain("10");
  });

  it("ignores a non-finite goal value", () => {
    const wrapper = mount(BarChart, { props: { label: "NaN", data, goalLine: { value: Number.NaN } } });
    expect(wrapper.find(".st-barChart__goalLine").exists()).toBe(false);
    expect(listItems(wrapper.element as HTMLElement)).toEqual(["A: 4", "B: 8", "C: 2"]);
  });
});
