import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LineChart, BarChart, AreaChart } from "./index.js";
import type { LineChartDatum } from "./LineChart.js";
import type { BarChartDatum } from "./BarChart.js";

// FR-5 — roving-tabindex keyboard navigation of the data points (a11y), strict
// tri-framework parity. Charts: BarChart, LineChart, AreaChart.

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const lineData: LineChartDatum[] = [
  { x: "Jan", y: 2 },
  { x: "Feb", y: 4 },
  { x: "Mar", y: 6 },
];
const barData: BarChartDatum[] = [
  { label: "A", value: 5 },
  { label: "B", value: 9 },
  { label: "C", value: 3 },
];

const navDatums = (container: HTMLElement, base: string) =>
  Array.from(container.querySelectorAll<SVGRectElement>(`.${base}__navDatum`));

describe("BarChart — keyboard datapoint navigation (FR-5)", () => {
  it("renders no nav overlay by default (backward compatible)", () => {
    const { container } = render(<BarChart label="Bars" data={barData} />);
    expect(container.querySelector(".st-barChart__navLayer")).toBeNull();
    expect(navDatums(container, "st-barChart").length).toBe(0);
  });

  it("enables the overlay when keyboardNav is set, one focusable datum per bar", () => {
    const { container } = render(<BarChart label="Bars" data={barData} keyboardNav />);
    const datums = navDatums(container, "st-barChart");
    expect(datums.length).toBe(3);
    // Single tab stop (roving): the first datum is tabbable, the rest are -1.
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
    // Each datum announces category + value.
    expect(datums[1].getAttribute("aria-label")).toBe("B, 9");
    expect(datums[1].getAttribute("role")).toBe("img");
    expect(container.querySelector(".st-barChart__navLayer")?.getAttribute("role")).toBe("group");
  });

  it("is enabled implicitly by wiring onSelectKey", () => {
    const { container } = render(<BarChart label="Bars" data={barData} onSelectKey={() => {}} />);
    expect(navDatums(container, "st-barChart").length).toBe(3);
  });

  it("ArrowRight / ArrowLeft move the roving tab stop", () => {
    const { container } = render(<BarChart label="Bars" data={barData} keyboardNav />);
    let datums = navDatums(container, "st-barChart");
    fireEvent.keyDown(datums[0], { key: "ArrowRight" });
    datums = navDatums(container, "st-barChart");
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
    fireEvent.keyDown(datums[1], { key: "ArrowLeft" });
    datums = navDatums(container, "st-barChart");
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("Home / End jump to first / last", () => {
    const { container } = render(<BarChart label="Bars" data={barData} keyboardNav />);
    let datums = navDatums(container, "st-barChart");
    fireEvent.keyDown(datums[0], { key: "End" });
    datums = navDatums(container, "st-barChart");
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["-1", "-1", "0"]);
    fireEvent.keyDown(datums[2], { key: "Home" });
    datums = navDatums(container, "st-barChart");
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("Arrow movement clamps at the edges", () => {
    const { container } = render(<BarChart label="Bars" data={barData} keyboardNav />);
    let datums = navDatums(container, "st-barChart");
    fireEvent.keyDown(datums[0], { key: "ArrowLeft" }); // already first → stays
    datums = navDatums(container, "st-barChart");
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("Enter / Space select the focused bar (onSelectKey with its label)", () => {
    const onSelectKey = vi.fn();
    const { container } = render(<BarChart label="Bars" data={barData} onSelectKey={onSelectKey} />);
    const datums = navDatums(container, "st-barChart");
    fireEvent.keyDown(datums[1], { key: "ArrowRight" }); // focus C (index 2)
    fireEvent.keyDown(navDatums(container, "st-barChart")[2], { key: "Enter" });
    expect(onSelectKey).toHaveBeenLastCalledWith("C");
    fireEvent.keyDown(navDatums(container, "st-barChart")[2], { key: " " });
    expect(onSelectKey).toHaveBeenLastCalledWith("C");
  });

  it("Escape leaves the navigation (onSelectKey null) and resets the tab stop", () => {
    const onSelectKey = vi.fn();
    const { container } = render(<BarChart label="Bars" data={barData} onSelectKey={onSelectKey} />);
    let datums = navDatums(container, "st-barChart");
    fireEvent.keyDown(datums[0], { key: "End" });
    fireEvent.keyDown(navDatums(container, "st-barChart")[2], { key: "Escape" });
    expect(onSelectKey).toHaveBeenLastCalledWith(null);
    datums = navDatums(container, "st-barChart");
    // Tab stop falls back to the first datum.
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("focusing a datum drives the shared crosshair (onHoverKeyChange) — FR-3 synergy", () => {
    const onHoverKeyChange = vi.fn();
    const { container } = render(
      <BarChart label="Bars" data={barData} keyboardNav onHoverKeyChange={onHoverKeyChange} />,
    );
    const datums = navDatums(container, "st-barChart");
    fireEvent.keyDown(datums[0], { key: "ArrowRight" });
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("B");
  });
});

describe("LineChart — keyboard datapoint navigation (FR-5)", () => {
  it("no overlay by default", () => {
    const { container } = render(<LineChart label="Line" data={lineData} />);
    expect(navDatums(container, "st-lineChart").length).toBe(0);
  });

  it("overlay datums carry x + value labels in data order", () => {
    const { container } = render(<LineChart label="Line" data={lineData} keyboardNav />);
    const datums = navDatums(container, "st-lineChart");
    expect(datums.length).toBe(3);
    expect(datums.map((d) => d.getAttribute("aria-label"))).toEqual(["Jan, 2", "Feb, 4", "Mar, 6"]);
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("arrow keys move focus; Enter selects with the datum key (String(x))", () => {
    const onSelectKey = vi.fn();
    const { container } = render(<LineChart label="Line" data={lineData} onSelectKey={onSelectKey} />);
    fireEvent.keyDown(navDatums(container, "st-lineChart")[0], { key: "ArrowDown" });
    fireEvent.keyDown(navDatums(container, "st-lineChart")[1], { key: "Enter" });
    expect(onSelectKey).toHaveBeenLastCalledWith("Feb");
  });
});

describe("AreaChart — keyboard datapoint navigation (FR-5)", () => {
  const areaData = [
    { x: "Q1", y: 10 },
    { x: "Q2", y: 20 },
    { x: "Q3", y: 15 },
  ];

  it("no overlay by default", () => {
    const { container } = render(<AreaChart label="Area" data={areaData} />);
    expect(navDatums(container, "st-areaChart").length).toBe(0);
  });

  it("overlay datums announce x + value", () => {
    const { container } = render(<AreaChart label="Area" data={areaData} keyboardNav />);
    const datums = navDatums(container, "st-areaChart");
    expect(datums.map((d) => d.getAttribute("aria-label"))).toEqual(["Q1, 10", "Q2, 20", "Q3, 15"]);
  });

  it("bare-number data announces the index as category and selects with index key", () => {
    const onSelectKey = vi.fn();
    const { container } = render(<AreaChart label="Area" data={[5, 7, 9]} onSelectKey={onSelectKey} />);
    const datums = navDatums(container, "st-areaChart");
    expect(datums[2].getAttribute("aria-label")).toBe("2, 9");
    fireEvent.keyDown(datums[0], { key: "End" });
    fireEvent.keyDown(navDatums(container, "st-areaChart")[2], { key: "Enter" });
    expect(onSelectKey).toHaveBeenLastCalledWith("2");
  });
});
