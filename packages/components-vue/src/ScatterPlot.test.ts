import { mount } from "@vue/test-utils";
import type { VueWrapper } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ScatterPlot } from "./index.js";
import type { ScatterPlotDatum } from "./ScatterPlot.js";
import type { ChartAnnotation } from "./chartAnnotations.js";

// ScatterPlot "Highcharts-class" props (vue), strict tri-framework parity:
// annotations (FR), dataLabels (FR-2), crosshair (FR-3), keyboard nav (FR-5).
// Both axes are continuous (numeric) — linear xScale/yScale.

const data: ScatterPlotDatum[] = [
  { x: 1, y: 2, label: "A" },
  { x: 2, y: 4, label: "B" },
  { x: 3, y: 6, label: "C" },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());
const navDatums = (el: HTMLElement) =>
  Array.from(el.querySelectorAll<SVGRectElement>(".st-scatterPlot__navDatum"));
const dataLabelTexts = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-scatterPlot__dataLabel")).map((n) => n.textContent?.trim());
// Fire a keydown on the i-th nav datum so the `key` lands on the event and Vue
// flushes the re-render before assertions.
const press = (wrapper: VueWrapper, i: number, key: string) =>
  wrapper.findAll(".st-scatterPlot__navDatum")[i].trigger("keydown", { key });

describe("ScatterPlot annotations", () => {
  it("renders nothing extra by default (additive)", () => {
    const el = mount(ScatterPlot, { props: { label: "Plain", data } }).element as HTMLElement;
    expect(el.querySelector(".st-scatterPlot__annotations")).toBeNull();
  });

  it("renders the 5 kinds (x AND y continuous) and appends a11y items", () => {
    const annotations: ChartAnnotation[] = [
      { kind: "region", axis: "y", from: 2, to: 4, label: "Zone" },
      { kind: "line", axis: "x", value: 2, label: "Repère" },
      { kind: "point", x: 3, y: 6, label: "Pic" },
      { kind: "label", x: 1, y: 4, text: "Ici" },
      { kind: "shape", points: [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 2 }], label: "Aire" },
    ];
    const el = mount(ScatterPlot, { props: { label: "Ann", data, annotations } }).element as HTMLElement;
    expect(el.querySelector(".st-scatterPlot__annotationRegion")).not.toBeNull();
    expect(el.querySelector(".st-scatterPlot__annotationLine")).not.toBeNull();
    expect(el.querySelector(".st-scatterPlot__annotationPoint")).not.toBeNull();
    expect(el.querySelector(".st-scatterPlot__annotationText")).not.toBeNull();
    expect(el.querySelector(".st-scatterPlot__annotationShape")).not.toBeNull();
    const items = listItems(el);
    expect(items).toContain("Annotation: Zone");
    expect(items).toContain("Annotation: Repère");
    expect(items).toContain("Annotation: Ici");
  });

  it("draws regions BEHIND and other annotations ABOVE the points", () => {
    const annotations: ChartAnnotation[] = [
      { kind: "region", axis: "y", from: 2, to: 4 },
      { kind: "point", x: 3, y: 6 },
    ];
    const el = mount(ScatterPlot, { props: { label: "Order", data, annotations } }).element as HTMLElement;
    const nodes = Array.from(el.querySelectorAll("svg *"));
    const pointIdx = nodes.findIndex((n) => n.classList.contains("st-scatterPlot__point"));
    const regionIdx = nodes.findIndex((n) => n.classList.contains("st-scatterPlot__annotationRegion"));
    const annPointIdx = nodes.findIndex((n) => n.classList.contains("st-scatterPlot__annotationPoint"));
    expect(regionIdx).toBeLessThan(pointIdx);
    expect(annPointIdx).toBeGreaterThan(pointIdx);
  });

  it("ignores an out-of-domain annotation (never escapes the plot)", () => {
    const el = mount(ScatterPlot, {
      props: { label: "Out", data, annotations: [{ kind: "point", x: 99, y: 99 }] },
    }).element as HTMLElement;
    expect(el.querySelector(".st-scatterPlot__annotationPoint")).toBeNull();
  });
});

describe("ScatterPlot data labels (FR-2)", () => {
  it("renders no data labels by default (off — zero regression)", () => {
    const el = mount(ScatterPlot, { props: { label: "Plain", data } }).element as HTMLElement;
    expect(el.querySelector(".st-scatterPlot__dataLabel")).toBeNull();
  });

  it("`dataLabels={true}` shows the datum label (else the value) on every point", () => {
    const el = mount(ScatterPlot, { props: { label: "DL", data, dataLabels: true } }).element as HTMLElement;
    expect(dataLabelTexts(el)).toEqual(["A", "B", "C"]);
  });

  it("falls back to the y value when a point has no label", () => {
    const el = mount(ScatterPlot, {
      props: { label: "DL", data: [{ x: 1, y: 2 }, { x: 2, y: 4 }], dataLabels: true },
    }).element as HTMLElement;
    expect(dataLabelTexts(el)).toEqual(["2", "4"]);
  });

  it("applies a custom `format`", () => {
    const el = mount(ScatterPlot, {
      props: { label: "DL", data: [{ x: 1, y: 2 }], dataLabels: { format: (v: number) => `${v} pts` } },
    }).element as HTMLElement;
    expect(dataLabelTexts(el)).toEqual(["2 pts"]);
  });

  it("labels are aria-hidden (values stay in the accessible ChartDataList)", () => {
    const el = mount(ScatterPlot, { props: { label: "DL", data, dataLabels: true } }).element as HTMLElement;
    expect(el.querySelector(".st-scatterPlot__dataLabels")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("ScatterPlot crosshair / synchronised hover (FR-3)", () => {
  it("uncontrolled: no crosshair by default, internal hover drives it (crossed pair)", async () => {
    const wrapper = mount(ScatterPlot, { props: { label: "Uncontrolled", data } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-scatterPlot__crosshair")).toBeNull();
    await wrapper.findAll(".st-scatterPlot__point")[1].trigger("pointermove");
    expect(el.querySelector(".st-scatterPlot__crosshair")).not.toBeNull();
    expect(el.querySelectorAll(".st-scatterPlot__crosshairLine").length).toBe(2);
    expect(el.querySelector(".st-scatterPlot__tooltipLabel")?.textContent).toBe("B");
    await wrapper.find(".st-scatterPlot__visual").trigger("pointerleave");
    expect(el.querySelector(".st-scatterPlot__crosshair")).toBeNull();
  });

  it("controlled: crosshair + tooltip track hoverKey (the label), ignoring pointer", async () => {
    const wrapper = mount(ScatterPlot, { props: { label: "Controlled", data, hoverKey: "C" } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-scatterPlot__crosshair")).not.toBeNull();
    expect(el.querySelector(".st-scatterPlot__tooltipLabel")?.textContent).toBe("C");
    await wrapper.findAll(".st-scatterPlot__point")[0].trigger("pointermove");
    expect(el.querySelector(".st-scatterPlot__tooltipLabel")?.textContent).toBe("C");
  });

  it("controlled with hoverKey=null shows nothing", () => {
    const el = mount(ScatterPlot, { props: { label: "Null", data, hoverKey: null } }).element as HTMLElement;
    expect(el.querySelector(".st-scatterPlot__crosshair")).toBeNull();
  });

  it("emits onHoverKeyChange on move (the point key) and on leave (null)", async () => {
    const onHoverKeyChange = vi.fn();
    const wrapper = mount(ScatterPlot, { props: { label: "Emit", data, onHoverKeyChange } });
    await wrapper.findAll(".st-scatterPlot__point")[2].trigger("pointermove");
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("C");
    await wrapper.find(".st-scatterPlot__visual").trigger("pointerleave");
    expect(onHoverKeyChange).toHaveBeenLastCalledWith(null);
  });

  it("a label-less point uses its serialised coordinates as key", async () => {
    const onHoverKeyChange = vi.fn();
    const wrapper = mount(ScatterPlot, {
      props: { label: "NoLabel", data: [{ x: 1, y: 2 }, { x: 7, y: 9 }], onHoverKeyChange },
    });
    await wrapper.findAll(".st-scatterPlot__point")[1].trigger("pointermove");
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("7,9");
  });
});

describe("ScatterPlot — keyboard datapoint navigation (FR-5)", () => {
  it("no overlay by default", () => {
    const el = mount(ScatterPlot, { props: { label: "Plain", data } }).element as HTMLElement;
    expect(navDatums(el).length).toBe(0);
  });

  it("overlay datums carry key + value labels in data order", () => {
    const el = mount(ScatterPlot, { props: { label: "Nav", data, keyboardNav: true } }).element as HTMLElement;
    const datums = navDatums(el);
    expect(datums.length).toBe(3);
    expect(datums.map((d) => d.getAttribute("aria-label"))).toEqual(["A, 2", "B, 4", "C, 6"]);
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
    expect(el.querySelector(".st-scatterPlot__navLayer")?.getAttribute("role")).toBe("group");
  });

  it("is enabled implicitly by wiring onSelectKey", () => {
    const el = mount(ScatterPlot, { props: { label: "Nav", data, onSelectKey: () => {} } }).element as HTMLElement;
    expect(navDatums(el).length).toBe(3);
  });

  it("arrow keys move focus; Enter selects with the point key (label)", async () => {
    const onSelectKey = vi.fn();
    const wrapper = mount(ScatterPlot, { props: { label: "Nav", data, onSelectKey } });
    const el = wrapper.element as HTMLElement;
    await press(wrapper, 0, "ArrowRight");
    expect(navDatums(el).map((d) => d.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
    await press(wrapper, 1, "Enter");
    expect(onSelectKey).toHaveBeenLastCalledWith("B");
  });

  it("Escape leaves the navigation (onSelectKey null) and resets the tab stop", async () => {
    const onSelectKey = vi.fn();
    const wrapper = mount(ScatterPlot, { props: { label: "Nav", data, onSelectKey } });
    const el = wrapper.element as HTMLElement;
    await press(wrapper, 0, "End");
    await press(wrapper, 2, "Escape");
    expect(onSelectKey).toHaveBeenLastCalledWith(null);
    expect(navDatums(el).map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("label-less data selects with the serialised coordinates", async () => {
    const onSelectKey = vi.fn();
    const wrapper = mount(ScatterPlot, {
      props: { label: "Nav", data: [{ x: 1, y: 2 }, { x: 7, y: 9 }], onSelectKey },
    });
    const el = wrapper.element as HTMLElement;
    expect(navDatums(el)[1].getAttribute("aria-label")).toBe("7, 9, 9");
    await press(wrapper, 0, "End");
    await press(wrapper, 1, "Enter");
    expect(onSelectKey).toHaveBeenLastCalledWith("7,9");
  });
});
