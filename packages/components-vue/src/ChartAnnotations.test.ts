import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { AreaChart, BarChart, LineChart } from "./index.js";
import type { ChartAnnotation } from "./chartAnnotations.js";
import { annotationDataListItems, resolveAnnotations } from "./chartAnnotations.js";

const lineData = [
  { x: 0, y: 2 },
  { x: 1, y: 4 },
  { x: 2, y: 6 },
  { x: 3, y: 8 },
];

const listItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("resolveAnnotations (pure, framework-agnostic)", () => {
  const ctx = {
    xScale: (v: number | string) => (typeof v === "number" && v >= 0 && v <= 10 ? v * 10 : null),
    yScale: (v: number) => (v >= 0 && v <= 10 ? (10 - v) * 10 : null),
    plotLeft: 40,
    plotTop: 10,
    plotWidth: 100,
    plotHeight: 100,
  };

  it("returns nothing for an absent or empty list", () => {
    expect(resolveAnnotations(undefined, ctx)).toEqual([]);
    expect(resolveAnnotations([], ctx)).toEqual([]);
  });

  it("resolves a y-axis line to a full-width horizontal segment", () => {
    const [r] = resolveAnnotations([{ kind: "line", axis: "y", value: 5, label: "Seuil" }], ctx);
    expect(r.kind).toBe("line");
    if (r.kind === "line") {
      expect(r.x1).toBe(40);
      expect(r.x2).toBe(140);
      expect(r.y1).toBe(r.y2);
    }
  });

  it("resolves an x-axis region to a full-height band", () => {
    const [r] = resolveAnnotations([{ kind: "region", axis: "x", from: 2, to: 4 }], ctx);
    expect(r.kind).toBe("region");
    if (r.kind === "region") {
      expect(r.height).toBe(100);
      expect(r.width).toBeGreaterThan(0);
    }
  });

  it("folds the plot origin into point / label pixels", () => {
    const res = resolveAnnotations(
      [
        { kind: "point", x: 1, y: 1 },
        { kind: "label", x: 2, y: 2, text: "Hi" },
      ],
      ctx,
    );
    expect(res.map((r) => r.kind)).toEqual(["point", "label"]);
    if (res[0].kind === "point") expect(res[0].x).toBe(40 + 10);
  });

  it("drops annotations whose coordinates fall outside the domain", () => {
    expect(resolveAnnotations([{ kind: "point", x: 99, y: 1 }], ctx)).toEqual([]);
    expect(resolveAnnotations([{ kind: "line", axis: "y", value: 99 }], ctx)).toEqual([]);
    expect(resolveAnnotations([{ kind: "region", axis: "y", from: 1, to: 99 }], ctx)).toEqual([]);
  });

  it("drops a polygon when any vertex is out of domain", () => {
    expect(
      resolveAnnotations([{ kind: "shape", points: [{ x: 1, y: 1 }, { x: 99, y: 1 }] }], ctx),
    ).toEqual([]);
  });

  it("describes only labelled annotations for the a11y list", () => {
    const items = annotationDataListItems([
      { kind: "point", x: 1, y: 1, label: "Pic" },
      { kind: "label", x: 2, y: 2, text: "Note" },
      { kind: "line", axis: "y", value: 5 }, // no label → skipped
    ]);
    expect(items).toEqual(["Annotation: Pic", "Annotation: Note"]);
  });
});

describe("LineChart annotations", () => {
  it("renders nothing extra by default (additive)", () => {
    const wrapper = mount(LineChart, { props: { label: "Plain", data: lineData } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-lineChart__annotations")).toBeNull();
    expect(listItems(el)).toEqual(["0: 2", "1: 4", "2: 6", "3: 8"]);
  });

  it("renders the 5 kinds and appends a11y items", () => {
    const annotations: ChartAnnotation[] = [
      { kind: "region", axis: "y", from: 2, to: 4, label: "Zone" },
      { kind: "line", axis: "x", value: 1, label: "Repère" },
      { kind: "point", x: 2, y: 6, label: "Pic" },
      { kind: "label", x: 1, y: 4, text: "Ici" },
      { kind: "shape", points: [{ x: 0, y: 2 }, { x: 1, y: 4 }, { x: 2, y: 2 }], label: "Aire" },
    ];
    const wrapper = mount(LineChart, { props: { label: "Ann", data: lineData, annotations } });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-lineChart__annotationRegion")).not.toBeNull();
    expect(el.querySelector(".st-lineChart__annotationLine")).not.toBeNull();
    expect(el.querySelector(".st-lineChart__annotationPoint")).not.toBeNull();
    expect(el.querySelector(".st-lineChart__annotationText")).not.toBeNull();
    expect(el.querySelector(".st-lineChart__annotationShape")).not.toBeNull();
    const items = listItems(el);
    expect(items).toContain("Annotation: Zone");
    expect(items).toContain("Annotation: Repère");
    expect(items).toContain("Annotation: Ici");
  });

  it("draws regions BEHIND and other annotations ABOVE the series", () => {
    const annotations: ChartAnnotation[] = [
      { kind: "region", axis: "y", from: 2, to: 4 },
      { kind: "point", x: 2, y: 6 },
    ];
    const wrapper = mount(LineChart, { props: { label: "Order", data: lineData, annotations } });
    const el = wrapper.element as HTMLElement;
    const nodes = Array.from(el.querySelectorAll("svg *"));
    const lineIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__line"));
    const regionIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__annotationRegion"));
    const pointIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__annotationPoint"));
    expect(regionIdx).toBeLessThan(lineIdx);
    expect(pointIdx).toBeGreaterThan(lineIdx);
  });

  it("ignores an out-of-domain annotation (never escapes the plot)", () => {
    const wrapper = mount(LineChart, {
      props: { label: "Out", data: lineData, annotations: [{ kind: "point", x: 99, y: 99 }] },
    });
    expect((wrapper.element as HTMLElement).querySelector(".st-lineChart__annotationPoint")).toBeNull();
  });
});

describe("AreaChart annotations", () => {
  it("renders an annotation point + a11y item", () => {
    const wrapper = mount(AreaChart, {
      props: { label: "Area", data: [1, 4, 2, 6], annotations: [{ kind: "point", x: 2, y: 2, label: "Pic" }] },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-areaChart__annotationPoint")).not.toBeNull();
    expect(listItems(el)).toContain("Annotation: Pic");
  });
});

describe("BarChart annotations", () => {
  const barData = [
    { label: "A", value: 10 },
    { label: "B", value: 30 },
    { label: "C", value: 20 },
  ];

  it("anchors a categorical point on the matching bar", () => {
    const wrapper = mount(BarChart, {
      props: { label: "Bars", data: barData, annotations: [{ kind: "point", x: "B", y: 30, label: "Top" }] },
    });
    const el = wrapper.element as HTMLElement;
    expect(el.querySelector(".st-barChart__annotationPoint")).not.toBeNull();
    expect(listItems(el)).toContain("Annotation: Top");
  });

  it("ignores a point whose category does not match any bar", () => {
    const wrapper = mount(BarChart, {
      props: { label: "Bars", data: barData, annotations: [{ kind: "point", x: "Z", y: 10 }] },
    });
    expect((wrapper.element as HTMLElement).querySelector(".st-barChart__annotationPoint")).toBeNull();
  });

  it("draws a value-axis line across the plot", () => {
    const wrapper = mount(BarChart, {
      props: { label: "Bars", data: barData, annotations: [{ kind: "line", axis: "y", value: 25, label: "Cible" }] },
    });
    expect((wrapper.element as HTMLElement).querySelector(".st-barChart__annotationLine")).not.toBeNull();
  });
});
