import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import LineChart from "./lib/LineChart.svelte";
import ScatterPlot from "./lib/ScatterPlot.svelte";
import type { LineChartDatum } from "./lib/LineChart.svelte";
import type { ScatterPlotCentroid, ScatterPlotDatum } from "./lib/ScatterPlot.svelte";

// WP15 — DS surfaces for the dataviz fallbacks: LineChart forecast datum mode
// (ForecastLineChart) + ScatterPlot per-datum size/tone & centroid markers
// (AnalyticsClusterPlot). Additive: absent props ⇒ unchanged behaviour.

const lineData: LineChartDatum[] = [
  { x: 0, y: 10 },
  { x: 1, y: 12 },
  { x: 2, y: 14 },
  { x: 3, y: 16 },
  { x: 4, y: 18 },
];

const linePaths = (el: HTMLElement) => Array.from(el.querySelectorAll<SVGPathElement>(".st-lineChart__line"));
const forecastLines = (el: HTMLElement) =>
  Array.from(el.querySelectorAll<SVGPathElement>(".st-lineChart__line--forecast"));
const forecastDots = (el: HTMLElement) =>
  Array.from(el.querySelectorAll<SVGCircleElement>(".st-lineChart__dot--forecast"));
const dataListItems = (el: HTMLElement) =>
  Array.from(el.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("LineChart forecast datum mode (WP15)", () => {
  it("is unchanged without forecast data (single solid line, no forecast classes)", () => {
    const { container } = render(LineChart, { props: { label: "Plain", data: lineData } });
    expect(linePaths(container).length).toBe(1);
    expect(forecastLines(container).length).toBe(0);
    expect(forecastDots(container).length).toBe(0);
    expect(dataListItems(container).some((t) => t?.includes("(prévision)"))).toBe(false);
  });

  it("forecast: false everywhere behaves exactly like no forecast (additive)", () => {
    const data = lineData.map((d) => ({ ...d, forecast: false }));
    const { container } = render(LineChart, { props: { label: "Plain", data } });
    expect(linePaths(container).length).toBe(1);
    expect(forecastLines(container).length).toBe(0);
    expect(forecastDots(container).length).toBe(0);
  });

  it("renders forecast tail as a dashed segment anchored on the last actual point", () => {
    const data = lineData.map((d, i) => (i >= 3 ? { ...d, forecast: true } : d));
    const { container } = render(LineChart, { props: { label: "Fcst", data } });
    const fcs = forecastLines(container);
    expect(fcs.length).toBe(1);
    // Solid (actual) path still present alongside the forecast path.
    expect(linePaths(container).length).toBe(2);
    // Points marked forecast are forecast-toned.
    expect(forecastDots(container).length).toBe(2);
    // Continuity: the forecast path covers points 2..4 (M + 2 L commands) and
    // starts exactly where the solid path (points 0..2) ends.
    const solidD = linePaths(container).find((p) => !p.classList.contains("st-lineChart__line--forecast"))?.getAttribute("d") ?? "";
    const fcD = fcs[0].getAttribute("d") ?? "";
    expect(fcD.split("L").length).toBe(3);
    const solidEnd = solidD.split("L").pop()?.trim();
    expect(fcD.startsWith(`M${solidEnd}`)).toBe(true);
  });

  it("marks forecast values in the accessible data list ((prévision))", () => {
    const data = lineData.map((d, i) => (i >= 3 ? { ...d, forecast: true } : d));
    const { container } = render(LineChart, { props: { label: "Fcst", data } });
    const items = dataListItems(container);
    expect(items).toContain("3: 16 (prévision)");
    expect(items).toContain("4: 18 (prévision)");
    expect(items).toContain("0: 10");
  });

  it("renders the whole series as forecast when every datum is forecast", () => {
    const data = lineData.map((d) => ({ ...d, forecast: true }));
    const { container } = render(LineChart, { props: { label: "AllFcst", data } });
    expect(forecastLines(container).length).toBe(1);
    // No solid segment remains.
    expect(linePaths(container).length).toBe(1);
    expect(forecastDots(container).length).toBe(lineData.length);
  });

  it("supports multiple forecast islands (several dashed segments)", () => {
    const data: LineChartDatum[] = [
      { x: 0, y: 10 },
      { x: 1, y: 12, forecast: true },
      { x: 2, y: 14 },
      { x: 3, y: 16 },
      { x: 4, y: 18, forecast: true },
      { x: 5, y: 20 },
    ];
    const { container } = render(LineChart, { props: { label: "Islands", data } });
    // Segments touching a forecast point are dashed: (0-2) and (3-5).
    expect(forecastLines(container).length).toBe(2);
    // One solid run remains in between (2-3); 3 paths total.
    expect(linePaths(container).length).toBe(3);
    expect(forecastDots(container).length).toBe(2);
  });

  it("uses a dashed, tokenized forecast stroke (no raw hex)", () => {
    const css = readFileSync(join(process.cwd(), "src/lib/LineChart.svelte"), "utf8");
    const rule = /\.st-lineChart__line--forecast\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(rule).toContain("stroke-dasharray");
    expect(rule).toMatch(/var\(--st-/);
    expect(rule).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});

const scatterData: ScatterPlotDatum[] = [
  { x: 1, y: 2 },
  { x: 2, y: 3 },
  { x: 3, y: 4 },
];

const pointEls = (el: HTMLElement) => Array.from(el.querySelectorAll<SVGCircleElement>(".st-scatterPlot__point"));
const centroidEls = (el: HTMLElement) => Array.from(el.querySelectorAll<SVGGElement>(".st-scatterPlot__centroid"));

describe("ScatterPlot per-datum size/tone + centroids (WP15)", () => {
  it("is unchanged without the new props (global radius, no centroids)", () => {
    const { container } = render(ScatterPlot, { props: { label: "Plain", data: scatterData } });
    expect(pointEls(container).map((c) => c.getAttribute("r"))).toEqual(["5", "5", "5"]);
    expect(centroidEls(container).length).toBe(0);
  });

  it("uses the per-datum radius when finite (clamped), global radius otherwise", () => {
    const data: ScatterPlotDatum[] = [
      { x: 1, y: 2, r: 10 },
      { x: 2, y: 3, r: Number.NaN },
      { x: 3, y: 4, r: -2 },
      { x: 4, y: 5, r: 999 },
      { x: 5, y: 6 },
    ];
    const { container } = render(ScatterPlot, { props: { label: "Sized", data, radius: 6 } });
    expect(pointEls(container).map((c) => c.getAttribute("r"))).toEqual(["10", "6", "6", "32", "6"]);
  });

  it("uses the per-datum tone (cluster tone), palette cycle otherwise", () => {
    const data: ScatterPlotDatum[] = [
      { x: 1, y: 2, tone: "category5" },
      { x: 2, y: 3 },
    ];
    const { container } = render(ScatterPlot, { props: { label: "Toned", data } });
    const pts = pointEls(container);
    expect(pts[0].classList.contains("st-scatterPlot__point--category5")).toBe(true);
    expect(pts[1].classList.contains("st-scatterPlot__point--category2")).toBe(true);
  });

  it("renders centroid markers (ring + cross, larger than points) with tone classes", () => {
    const centroids: ScatterPlotCentroid[] = [
      { x: 1.5, y: 2.5, tone: "category3", label: "C1" },
      { x: 2.5, y: 3.5 },
    ];
    const { container } = render(ScatterPlot, { props: { label: "Clusters", data: scatterData, centroids } });
    const marks = centroidEls(container);
    expect(marks.length).toBe(2);
    expect(marks[0].classList.contains("st-scatterPlot__centroid--category3")).toBe(true);
    // Default tone cycles the categorical palette by index.
    expect(marks[1].classList.contains("st-scatterPlot__centroid--category2")).toBe(true);
    const ring = marks[0].querySelector(".st-scatterPlot__centroidRing");
    expect(ring).not.toBeNull();
    // Ring radius (7) exceeds the default point radius (5).
    expect(Number(ring?.getAttribute("r"))).toBeGreaterThan(5);
    expect(marks[0].querySelectorAll(".st-scatterPlot__centroidCross").length).toBe(2);
  });

  it("exposes centroids in the accessible data list (Centroïde {label}: (x, y))", () => {
    const centroids: ScatterPlotCentroid[] = [
      { x: 1.5, y: 2.5, label: "Groupe A" },
      { x: 2.5, y: 3.5 },
    ];
    const { container } = render(ScatterPlot, { props: { label: "Clusters", data: scatterData, centroids } });
    const items = dataListItems(container);
    expect(items).toContain("Centroïde Groupe A: (1.5, 2.5)");
    expect(items).toContain("Centroïde: (2.5, 3.5)");
  });

  it("skips centroids with non-finite coordinates (guard)", () => {
    const centroids: ScatterPlotCentroid[] = [
      { x: Number.NaN, y: 2 },
      { x: 2, y: Number.POSITIVE_INFINITY },
      { x: 2, y: 3 },
    ];
    const { container } = render(ScatterPlot, { props: { label: "Guarded", data: scatterData, centroids } });
    expect(centroidEls(container).length).toBe(1);
  });

  it("folds centroid coordinates into the axis domain", () => {
    const centroids: ScatterPlotCentroid[] = [{ x: 10, y: 20 }];
    const { container } = render(ScatterPlot, { props: { label: "Domain", data: scatterData, centroids } });
    const ticks = Array.from(container.querySelectorAll(".st-scatterPlot__tick")).map((n) => n.textContent?.trim());
    expect(ticks).toContain("10");
    expect(ticks).toContain("20");
  });
});
