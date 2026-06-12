import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OHLCChart } from "./index.js";
import type { ChartAnnotation } from "./chartAnnotations.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

// Lun/Ven haussiers (close ≥ open), Mer baissier (close < open).
const week = [
  { label: "Lun", open: 142, high: 148, low: 139, close: 146 },
  { label: "Mar", open: 146, high: 151, low: 144, close: 149 },
  { label: "Mer", open: 149, high: 152, low: 140, close: 143 },
  { label: "Jeu", open: 143, high: 147, low: 138, close: 145 },
  { label: "Ven", open: 145, high: 155, low: 144, close: 153 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("OHLCChart", () => {
  it("renders one bar per period", () => {
    const { container } = render(<OHLCChart label="Cours" data={week} />);
    expect(container.querySelectorAll(".st-ohlcChart__bar").length).toBe(week.length);
    expect(container.querySelectorAll(".st-ohlcChart__range").length).toBe(week.length);
  });

  it("renders an open tick (left) and a close tick (right) per period", () => {
    const { container } = render(<OHLCChart label="Cours" data={week} />);
    const opens = container.querySelectorAll<SVGLineElement>(".st-ohlcChart__open");
    const closes = container.querySelectorAll<SVGLineElement>(".st-ohlcChart__close");
    expect(opens.length).toBe(week.length);
    expect(closes.length).toBe(week.length);
    const open0 = opens[0];
    const close0 = closes[0];
    expect(Number(open0.getAttribute("x1"))).toBeLessThan(Number(open0.getAttribute("x2")));
    expect(Number(close0.getAttribute("x1"))).toBeLessThan(Number(close0.getAttribute("x2")));
  });

  it("applies the up class when close ≥ open and the down class otherwise", () => {
    const { container } = render(<OHLCChart label="Cours" data={week} />);
    const bars = container.querySelectorAll(".st-ohlcChart__bar");
    expect(bars[0].classList.contains("st-ohlcChart__bar--up")).toBe(true);
    expect(bars[0].classList.contains("st-ohlcChart__bar--down")).toBe(false);
    expect(bars[2].classList.contains("st-ohlcChart__bar--down")).toBe(true);
    expect(bars[2].classList.contains("st-ohlcChart__bar--up")).toBe(false);
  });

  it("summarizes O/H/L/C per period in the accessible list", () => {
    const { container } = render(<OHLCChart label="Cours" data={week} />);
    const items = listItems(container);
    expect(items.length).toBe(week.length);
    expect(items[0]).toBe("Lun: O 142 H 148 L 139 C 146");
  });

  it("drops non-finite periods before rendering", () => {
    const { container } = render(
      <OHLCChart
        label="Filtré"
        data={[
          { label: "Bad", open: Number.NaN, high: 10, low: 1, close: 5 },
          { label: "Ok", open: 4, high: 8, low: 2, close: 6 },
        ]}
      />
    );
    expect(container.querySelectorAll(".st-ohlcChart__bar").length).toBe(1);
  });

  it("treats close === open as bullish (up)", () => {
    const { container } = render(
      <OHLCChart label="Flat" data={[{ label: "Flat", open: 10, high: 12, low: 8, close: 10 }]} />
    );
    const bar = container.querySelector(".st-ohlcChart__bar");
    expect(bar?.classList.contains("st-ohlcChart__bar--up")).toBe(true);
  });
});

// "Highcharts-class" extensions: annotations / dataLabels / crosshair / nav.
describe("OHLCChart — annotations / dataLabels / crosshair / keyboard nav", () => {
  it("renders no overlay primitives by default", () => {
    const { container } = render(<OHLCChart label="Cours" data={week} />);
    expect(container.querySelector(".st-ohlcChart__annotations")).toBeNull();
    expect(container.querySelector(".st-ohlcChart__dataLabel")).toBeNull();
    expect(container.querySelector(".st-ohlcChart__crosshairLine")).toBeNull();
    expect(container.querySelector(".st-ohlcChart__navLayer")).toBeNull();
  });

  it("renders a support line, a price region and a point annotation", () => {
    const annotations: ChartAnnotation[] = [
      { kind: "line", axis: "y", value: 150, label: "Résistance" },
      { kind: "region", axis: "y", from: 140, to: 145, label: "Zone" },
      { kind: "point", x: "Mer", y: 143, label: "Creux" },
    ];
    const { container } = render(<OHLCChart label="Cours" data={week} annotations={annotations} />);
    expect(container.querySelectorAll(".st-ohlcChart__annotationLine").length).toBe(1);
    expect(container.querySelectorAll(".st-ohlcChart__annotationRegion").length).toBe(1);
    expect(container.querySelectorAll(".st-ohlcChart__annotationPoint").length).toBe(1);
    const items = listItems(container);
    expect(items).toContain("Annotation: Résistance");
    expect(items).toContain("Annotation: Zone");
    expect(items).toContain("Annotation: Creux");
  });

  it("renders one close data label per bar (aria-hidden)", () => {
    const { container } = render(<OHLCChart label="Cours" data={week} dataLabels />);
    const group = container.querySelector(".st-ohlcChart__dataLabels");
    expect(group?.getAttribute("aria-hidden")).toBe("true");
    const labels = container.querySelectorAll(".st-ohlcChart__dataLabel");
    expect(labels.length).toBe(week.length);
    // First bar's close is 146.
    expect(labels[0].textContent).toBe("146");
  });

  it("draws a controlled crosshair at the bar matching hoverKey", () => {
    const { container, rerender } = render(<OHLCChart label="Cours" data={week} hoverKey={null} />);
    expect(container.querySelector(".st-ohlcChart__crosshairLine")).toBeNull();
    rerender(<OHLCChart label="Cours" data={week} hoverKey="Mer" />);
    expect(container.querySelector(".st-ohlcChart__crosshairLine")).not.toBeNull();
  });

  it("enables a roving keyboard overlay announcing date + O/H/L/C", () => {
    const onSelectKey = vi.fn();
    const { container } = render(<OHLCChart label="Cours" data={week} onSelectKey={onSelectKey} />);
    const datums = Array.from(container.querySelectorAll<SVGRectElement>(".st-ohlcChart__navDatum"));
    expect(datums.length).toBe(week.length);
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1", "-1", "-1"]);
    expect(datums[0].getAttribute("aria-label")).toBe("Lun, O 142 H 148 L 139 C 146");
    fireEvent.keyDown(datums[0], { key: "ArrowRight" });
    fireEvent.keyDown(
      Array.from(container.querySelectorAll<SVGRectElement>(".st-ohlcChart__navDatum"))[1],
      { key: "Enter" },
    );
    expect(onSelectKey).toHaveBeenLastCalledWith("Mar");
  });
});
