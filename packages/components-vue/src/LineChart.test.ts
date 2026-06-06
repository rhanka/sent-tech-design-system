import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { LineChart } from "./index.js";
import type { LineChartDatum } from "./LineChart.js";

const data: LineChartDatum[] = [
  { x: 0, y: 2 },
  { x: 1, y: 4 },
  { x: 2, y: 6 },
  { x: 3, y: 8 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("LineChart analytical overlays (parity with Svelte)", () => {
  it("renders no overlays by default (additive — zero regression)", () => {
    const wrapper = mount(LineChart, { props: { label: "Plain", data } });
    expect(wrapper.find(".st-lineChart__band").exists()).toBe(false);
    expect(wrapper.find(".st-lineChart__refLine").exists()).toBe(false);
    expect(wrapper.find(".st-lineChart__goalLine").exists()).toBe(false);
    expect(wrapper.find(".st-lineChart__trend").exists()).toBe(false);
    expect(listItems(wrapper.element as HTMLElement)).toEqual(["0: 2", "1: 4", "2: 6", "3: 8"]);
  });

  it("renders a toned reference line + a11y item", () => {
    const wrapper = mount(LineChart, {
      props: { label: "Ref", data, referenceLines: [{ value: 5, label: "Cible", tone: "warning" }] },
    });
    expect(wrapper.find(".st-lineChart__refLine--warning").exists()).toBe(true);
    expect(listItems(wrapper.element as HTMLElement)).toContain("Référence: Cible = 5");
  });

  it("renders a band and describes it", () => {
    const wrapper = mount(LineChart, {
      props: { label: "Band", data, bands: [{ from: 3, to: 5, label: "Plage", tone: "info" }] },
    });
    const band = wrapper.find(".st-lineChart__band--info");
    expect(band.exists()).toBe(true);
    expect(Number(band.attributes("height"))).toBeGreaterThan(0);
    expect(listItems(wrapper.element as HTMLElement)).toContain("Bande: Plage (3–5)");
  });

  it("draws the goal line ABOVE and bands/refs BELOW the data", () => {
    const wrapper = mount(LineChart, {
      props: { label: "Order", data, bands: [{ from: 3, to: 5 }], referenceLines: [{ value: 6 }], goalLine: { value: 5 } },
    });
    const nodes = Array.from((wrapper.element as HTMLElement).querySelectorAll("svg *"));
    const lineIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__line"));
    const bandIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__band"));
    const refIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__refLine"));
    const goalIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__goalLine"));
    expect(bandIdx).toBeLessThan(lineIdx);
    expect(refIdx).toBeLessThan(lineIdx);
    expect(goalIdx).toBeGreaterThan(lineIdx);
  });

  it("computes a correct least-squares trend slope (y = 2x + 2 → slope 2)", () => {
    const wrapper = mount(LineChart, { props: { label: "Trend", data, trend: true } });
    expect(wrapper.find(".st-lineChart__trend").exists()).toBe(true);
    expect(listItems(wrapper.element as HTMLElement)).toContain("Tendance: pente 2.00");
  });

  it("extends the value domain for an out-of-range reference", () => {
    const wrapper = mount(LineChart, { props: { label: "Domain", data, referenceLines: [{ value: 100 }] } });
    const ticks = wrapper.findAll(".st-lineChart__tickLabel").map((n) => n.text().trim());
    expect(ticks).toContain("100");
  });

  it("ignores non-finite overlay values", () => {
    const wrapper = mount(LineChart, {
      props: {
        label: "NaN",
        data,
        referenceLines: [{ value: Number.NaN }],
        goalLine: { value: Number.POSITIVE_INFINITY },
      },
    });
    expect(wrapper.find(".st-lineChart__refLine").exists()).toBe(false);
    expect(wrapper.find(".st-lineChart__goalLine").exists()).toBe(false);
    expect(listItems(wrapper.element as HTMLElement)).toEqual(["0: 2", "1: 4", "2: 6", "3: 8"]);
  });
});
