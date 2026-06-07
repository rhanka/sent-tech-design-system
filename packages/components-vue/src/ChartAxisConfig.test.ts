import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { BarChart, LineChart } from "./index.js";
import type { BarChartDatum } from "./BarChart.js";
import type { LineChartDatum } from "./LineChart.js";

// FR1 — value-axis config (scale / invertAxis / domain / showLegend) parity.

const barData: BarChartDatum[] = [
  { label: "A", value: 1 },
  { label: "B", value: 10 },
  { label: "C", value: 100 },
];

const lineData: LineChartDatum[] = [
  { x: 0, y: 1 },
  { x: 1, y: 10 },
  { x: 2, y: 100 },
];

const tickLabels = (el: HTMLElement, kind: "barChart" | "lineChart") =>
  Array.from(el.querySelectorAll(`.st-${kind}__tickLabel`)).map((n) => n.textContent?.trim());

const bars = (el: HTMLElement) => Array.from(el.querySelectorAll<SVGRectElement>(".st-barChart__bar"));

describe("BarChart axis config (FR1)", () => {
  it("is unchanged without the new props (linear, 0 baseline)", () => {
    const el = mount(BarChart, { props: { label: "Plain", data: barData } }).element as HTMLElement;
    expect(tickLabels(el, "barChart")).toContain("0");
  });

  it("scale='log' emits power-of-ten ticks (1,10,100) and no 0 baseline", () => {
    const el = mount(BarChart, { props: { label: "Log", data: barData, scale: "log" } }).element as HTMLElement;
    const labels = tickLabels(el, "barChart");
    expect(labels).toContain("1");
    expect(labels).toContain("10");
    expect(labels).toContain("100");
    expect(labels).not.toContain("0");
  });

  it("scale='log' positions bars by log — decade steps equal pixel steps", () => {
    const el = mount(BarChart, { props: { label: "Log", data: barData, scale: "log", height: 240 } }).element as HTMLElement;
    const [a, b, c] = bars(el).map((r) => Number(r.getAttribute("y")));
    const gap1 = a - b;
    const gap2 = b - c;
    expect(gap1).toBeGreaterThan(0);
    expect(Math.abs(gap1 - gap2)).toBeLessThan(1.5);
  });

  it("scale='log' ignores non-positive values (no crash)", () => {
    const withZero: BarChartDatum[] = [
      { label: "A", value: 0 },
      { label: "B", value: 10 },
    ];
    const el = mount(BarChart, { props: { label: "LogZero", data: withZero, scale: "log" } }).element as HTMLElement;
    expect(el.querySelector(".st-barChart__bar")).not.toBeNull();
    expect(tickLabels(el, "barChart")).toContain("10");
  });

  it("scale='log' rejects a non-positive fixed domain and falls back to positive data", () => {
    const el = mount(BarChart, { props: { label: "BadLogDomain", data: barData, scale: "log", domain: [0, 1000] } })
      .element as HTMLElement;
    const labels = tickLabels(el, "barChart");
    expect(labels).toContain("100");
    expect(labels).not.toContain("1k");
  });

  it("keeps bars inside the plot when a fixed linear domain excludes zero", () => {
    const el = mount(BarChart, {
      props: { label: "FixedNoZero", data: [{ label: "A", value: 10 }], domain: [3, 103], height: 240 },
    }).element as HTMLElement;
    const [bar] = bars(el);
    const y = Number(bar.getAttribute("y"));
    const h = Number(bar.getAttribute("height"));
    expect(y).toBeGreaterThanOrEqual(12);
    expect(y + h).toBeLessThanOrEqual(208);
  });

  it("extends the horizontal value axis from referenceLines axis='x'", () => {
    const el = mount(BarChart, {
      props: {
        label: "HorizontalRef",
        data: barData,
        orientation: "horizontal",
        referenceLines: [{ axis: "x", value: 200 }],
      },
    }).element as HTMLElement;
    expect(tickLabels(el, "barChart")).toContain("200");
    expect(el.querySelector(".st-barChart__refLine")).not.toBeNull();
  });

  it("invertAxis flips the value axis (top tick value differs)", () => {
    const topTick = (el: HTMLElement) => {
      const ticks = Array.from(el.querySelectorAll<SVGTextElement>(".st-barChart__tickLabel"));
      return ticks
        .map((t) => ({ y: Number(t.getAttribute("y")), v: t.textContent }))
        .sort((p, q) => p.y - q.y)[0]?.v;
    };
    const normal = mount(BarChart, { props: { label: "N", data: barData } }).element as HTMLElement;
    const inverted = mount(BarChart, { props: { label: "I", data: barData, invertAxis: true } }).element as HTMLElement;
    expect(topTick(normal)).not.toBe(topTick(inverted));
  });

  it("accepts showLegend without regression (no-op)", () => {
    const el = mount(BarChart, { props: { label: "Legend", data: barData, showLegend: true } }).element as HTMLElement;
    expect(el.classList.contains("st-barChart")).toBe(true);
  });
});

describe("LineChart axis config (FR1)", () => {
  it("honours a fixed domain (ticks include the bounds)", () => {
    const el = mount(LineChart, { props: { label: "Dom", data: lineData, domain: [0, 200] } }).element as HTMLElement;
    const labels = tickLabels(el, "lineChart");
    expect(labels).toContain("0");
    expect(labels).toContain("200");
  });

  it("keeps a non-nice fixed domain as the actual scale bounds", () => {
    const el = mount(LineChart, { props: { label: "DomExact", data: lineData, domain: [3, 103] } }).element as HTMLElement;
    const labels = tickLabels(el, "lineChart");
    expect(labels).toContain("3");
    expect(labels).toContain("103");
  });

  it("an invalid domain falls back to the auto range", () => {
    const el = mount(LineChart, { props: { label: "Bad", data: lineData, domain: [5, 5] } }).element as HTMLElement;
    expect(tickLabels(el, "lineChart").length).toBeGreaterThan(0);
  });

  it("scale='log' emits power-of-ten ticks", () => {
    const el = mount(LineChart, { props: { label: "Log", data: lineData, scale: "log" } }).element as HTMLElement;
    const labels = tickLabels(el, "lineChart");
    expect(labels).toContain("1");
    expect(labels).toContain("10");
    expect(labels).toContain("100");
  });

  it("scale='log' + domain pins the log bounds", () => {
    const el = mount(LineChart, { props: { label: "LogDom", data: lineData, scale: "log", domain: [1, 1000] } })
      .element as HTMLElement;
    expect(tickLabels(el, "lineChart")).toContain("1k");
  });

  it("scale='log' rejects a non-positive fixed domain and falls back to positive data", () => {
    const el = mount(LineChart, {
      props: { label: "BadLogDomain", data: lineData, scale: "log", domain: [0, 1000] },
    }).element as HTMLElement;
    const labels = tickLabels(el, "lineChart");
    expect(labels).toContain("100");
    expect(labels).not.toContain("1k");
  });

  it("invertAxis flips the data point order top-to-bottom", () => {
    const firstDotY = (el: HTMLElement) =>
      Number(el.querySelector<SVGCircleElement>(".st-lineChart__dot")?.getAttribute("cy"));
    const normal = mount(LineChart, { props: { label: "N", data: lineData } }).element as HTMLElement;
    const inverted = mount(LineChart, { props: { label: "I", data: lineData, invertAxis: true } }).element as HTMLElement;
    expect(firstDotY(normal)).toBeGreaterThan(firstDotY(inverted));
  });

  it("accepts showLegend without regression (no-op)", () => {
    const el = mount(LineChart, { props: { label: "Legend", data: lineData, showLegend: true } }).element as HTMLElement;
    expect(el.classList.contains("st-lineChart")).toBe(true);
  });
});
