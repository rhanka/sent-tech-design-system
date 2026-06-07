import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarChart, LineChart } from "./index.js";
import type { BarChartDatum } from "./BarChart.js";
import type { LineChartDatum } from "./LineChart.js";

// FR1 — value-axis config (scale / invertAxis / domain / showLegend) on
// BarChart + LineChart. Additive: absent props ⇒ unchanged behaviour.

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
  it("is unchanged without the new props (linear, no invert)", () => {
    const { container } = render(<BarChart label="Plain" data={barData} />);
    // 0 baseline is present on a default linear axis.
    expect(tickLabels(container, "barChart")).toContain("0");
  });

  it("scale='log' emits power-of-ten ticks (1,10,100) and no 0 baseline", () => {
    const { container } = render(<BarChart label="Log" data={barData} scale="log" />);
    const labels = tickLabels(container, "barChart");
    expect(labels).toContain("1");
    expect(labels).toContain("10");
    expect(labels).toContain("100");
    expect(labels).not.toContain("0");
  });

  it("scale='log' positions bars by log — equal decade steps are equal pixel steps", () => {
    const { container } = render(
      <BarChart label="Log" data={barData} scale="log" height={240} />,
    );
    const [a, b, c] = bars(container).map((r) => r.getAttribute("y")!).map(Number);
    // value 1<10<100 ⇒ taller bars for bigger values ⇒ smaller y. Decade gaps equal.
    const gap1 = a - b; // top of A is lower (bigger y) than B
    const gap2 = b - c;
    expect(gap1).toBeGreaterThan(0);
    expect(Math.abs(gap1 - gap2)).toBeLessThan(1.5);
  });

  it("scale='log' ignores non-positive values (clamped, no crash)", () => {
    const withZero: BarChartDatum[] = [
      { label: "A", value: 0 },
      { label: "B", value: 10 },
    ];
    const { container } = render(<BarChart label="LogZero" data={withZero} scale="log" />);
    expect(container.querySelector(".st-barChart__bar")).not.toBeNull();
    expect(tickLabels(container, "barChart")).toContain("10");
  });

  it("scale='log' rejects a non-positive fixed domain and falls back to positive data", () => {
    const { container } = render(<BarChart label="BadLogDomain" data={barData} scale="log" domain={[0, 1000]} />);
    const labels = tickLabels(container, "barChart");
    expect(labels).toContain("100");
    expect(labels).not.toContain("1k");
  });

  it("keeps bars inside the plot when a fixed linear domain excludes zero", () => {
    const { container } = render(<BarChart label="FixedNoZero" data={[{ label: "A", value: 10 }]} domain={[3, 103]} height={240} />);
    const [bar] = bars(container);
    const y = Number(bar.getAttribute("y"));
    const h = Number(bar.getAttribute("height"));
    expect(y).toBeGreaterThanOrEqual(12);
    expect(y + h).toBeLessThanOrEqual(208);
  });

  it("extends the horizontal value axis from referenceLines axis='x'", () => {
    const { container } = render(
      <BarChart label="HorizontalRef" data={barData} orientation="horizontal" referenceLines={[{ axis: "x", value: 200 }]} />,
    );
    expect(tickLabels(container, "barChart")).toContain("200");
    expect(container.querySelector(".st-barChart__refLine")).not.toBeNull();
  });

  it("invertAxis flips the value axis (top tick value differs)", () => {
    const normal = render(<BarChart label="N" data={barData} />);
    const inverted = render(<BarChart label="I" data={barData} invertAxis />);
    // The tick rendered nearest the top (smallest y) should differ in value.
    const topTick = (el: HTMLElement) => {
      const ticks = Array.from(el.querySelectorAll<SVGTextElement>(".st-barChart__tickLabel"));
      return ticks
        .map((t) => ({ y: Number(t.getAttribute("y")), v: t.textContent }))
        .sort((p, q) => p.y - q.y)[0]?.v;
    };
    expect(topTick(normal.container)).not.toBe(topTick(inverted.container));
  });

  it("accepts showLegend without rendering a regression (no-op)", () => {
    const { container } = render(<BarChart label="Legend" data={barData} showLegend />);
    expect(container.querySelector(".st-barChart")).not.toBeNull();
  });
});

describe("LineChart axis config (FR1)", () => {
  it("honours a fixed domain (ticks include the bounds)", () => {
    const { container } = render(<LineChart label="Dom" data={lineData} domain={[0, 200]} />);
    const labels = tickLabels(container, "lineChart");
    expect(labels).toContain("0");
    expect(labels).toContain("200");
  });

  it("keeps a non-nice fixed domain as the actual scale bounds", () => {
    const { container } = render(<LineChart label="DomExact" data={lineData} domain={[3, 103]} />);
    const labels = tickLabels(container, "lineChart");
    expect(labels).toContain("3");
    expect(labels).toContain("103");
  });

  it("an invalid domain falls back to the auto range", () => {
    const { container } = render(<LineChart label="Bad" data={lineData} domain={[5, 5]} />);
    // degenerate domain ⇒ auto range still produces ticks (no throw).
    expect(tickLabels(container, "lineChart").length).toBeGreaterThan(0);
  });

  it("scale='log' emits power-of-ten ticks", () => {
    const { container } = render(<LineChart label="Log" data={lineData} scale="log" />);
    const labels = tickLabels(container, "lineChart");
    expect(labels).toContain("1");
    expect(labels).toContain("10");
    expect(labels).toContain("100");
  });

  it("scale='log' + domain pins the log bounds", () => {
    const { container } = render(<LineChart label="LogDom" data={lineData} scale="log" domain={[1, 1000]} />);
    expect(tickLabels(container, "lineChart")).toContain("1k");
  });

  it("scale='log' rejects a non-positive fixed domain and falls back to positive data", () => {
    const { container } = render(<LineChart label="BadLogDomain" data={lineData} scale="log" domain={[0, 1000]} />);
    const labels = tickLabels(container, "lineChart");
    expect(labels).toContain("100");
    expect(labels).not.toContain("1k");
  });

  it("invertAxis flips the data point order top-to-bottom", () => {
    const normal = render(<LineChart label="N" data={lineData} />);
    const inverted = render(<LineChart label="I" data={lineData} invertAxis />);
    const firstDotY = (el: HTMLElement) =>
      Number(el.querySelector<SVGCircleElement>(".st-lineChart__dot")?.getAttribute("cy"));
    // First point y=1: low on a normal axis (big cy), high when inverted (small cy).
    expect(firstDotY(normal.container)).toBeGreaterThan(firstDotY(inverted.container));
  });

  it("accepts showLegend without regression (no-op)", () => {
    const { container } = render(<LineChart label="Legend" data={lineData} showLegend />);
    expect(container.querySelector(".st-lineChart")).not.toBeNull();
  });
});
