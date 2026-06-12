import { cleanup, fireEvent, render } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import LineChart from "./lib/LineChart.svelte";
import BarChart from "./lib/BarChart.svelte";
import AreaChart from "./lib/AreaChart.svelte";
import type { LineChartDatum } from "./lib/LineChart.svelte";
import type { BarChartDatum } from "./lib/BarChart.svelte";

// FR-5 — roving-tabindex keyboard navigation of the data points (a11y), strict
// tri-framework parity. Charts: BarChart, LineChart, AreaChart.

afterEach(() => {
  cleanup();
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
    const { container } = render(BarChart, { props: { label: "Bars", data: barData } });
    expect(container.querySelector(".st-barChart__navLayer")).toBeNull();
    expect(navDatums(container, "st-barChart").length).toBe(0);
  });

  it("enables the overlay when keyboardNav is set, one focusable datum per bar", () => {
    const { container } = render(BarChart, { props: { label: "Bars", data: barData, keyboardNav: true } });
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
    const { container } = render(BarChart, { props: { label: "Bars", data: barData, onSelectKey: () => {} } });
    expect(navDatums(container, "st-barChart").length).toBe(3);
  });

  it("ArrowRight / ArrowLeft move the roving tab stop", async () => {
    const { container } = render(BarChart, { props: { label: "Bars", data: barData, keyboardNav: true } });
    await fireEvent.keyDown(navDatums(container, "st-barChart")[0], { key: "ArrowRight" });
    expect(navDatums(container, "st-barChart").map((d) => d.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
    await fireEvent.keyDown(navDatums(container, "st-barChart")[1], { key: "ArrowLeft" });
    expect(navDatums(container, "st-barChart").map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("Home / End jump to first / last", async () => {
    const { container } = render(BarChart, { props: { label: "Bars", data: barData, keyboardNav: true } });
    await fireEvent.keyDown(navDatums(container, "st-barChart")[0], { key: "End" });
    expect(navDatums(container, "st-barChart").map((d) => d.getAttribute("tabindex"))).toEqual(["-1", "-1", "0"]);
    await fireEvent.keyDown(navDatums(container, "st-barChart")[2], { key: "Home" });
    expect(navDatums(container, "st-barChart").map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("Arrow movement clamps at the edges", async () => {
    const { container } = render(BarChart, { props: { label: "Bars", data: barData, keyboardNav: true } });
    await fireEvent.keyDown(navDatums(container, "st-barChart")[0], { key: "ArrowLeft" }); // already first → stays
    expect(navDatums(container, "st-barChart").map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("Enter / Space select the focused bar (onSelectKey with its label)", async () => {
    const onSelectKey = vi.fn();
    const { container } = render(BarChart, { props: { label: "Bars", data: barData, onSelectKey } });
    await fireEvent.keyDown(navDatums(container, "st-barChart")[1], { key: "ArrowRight" }); // focus C (index 2)
    await fireEvent.keyDown(navDatums(container, "st-barChart")[2], { key: "Enter" });
    expect(onSelectKey).toHaveBeenLastCalledWith("C");
    await fireEvent.keyDown(navDatums(container, "st-barChart")[2], { key: " " });
    expect(onSelectKey).toHaveBeenLastCalledWith("C");
  });

  it("Escape leaves the navigation (onSelectKey null) and resets the tab stop", async () => {
    const onSelectKey = vi.fn();
    const { container } = render(BarChart, { props: { label: "Bars", data: barData, onSelectKey } });
    await fireEvent.keyDown(navDatums(container, "st-barChart")[0], { key: "End" });
    await fireEvent.keyDown(navDatums(container, "st-barChart")[2], { key: "Escape" });
    expect(onSelectKey).toHaveBeenLastCalledWith(null);
    // Tab stop falls back to the first datum.
    expect(navDatums(container, "st-barChart").map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("focusing a datum drives the shared crosshair (onHoverKeyChange) — FR-3 synergy", async () => {
    const onHoverKeyChange = vi.fn();
    const { container } = render(BarChart, {
      props: { label: "Bars", data: barData, keyboardNav: true, onHoverKeyChange },
    });
    await fireEvent.keyDown(navDatums(container, "st-barChart")[0], { key: "ArrowRight" });
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("B");
  });
});

describe("LineChart — keyboard datapoint navigation (FR-5)", () => {
  it("no overlay by default", () => {
    const { container } = render(LineChart, { props: { label: "Line", data: lineData } });
    expect(navDatums(container, "st-lineChart").length).toBe(0);
  });

  it("overlay datums carry x + value labels in data order", () => {
    const { container } = render(LineChart, { props: { label: "Line", data: lineData, keyboardNav: true } });
    const datums = navDatums(container, "st-lineChart");
    expect(datums.length).toBe(3);
    expect(datums.map((d) => d.getAttribute("aria-label"))).toEqual(["Jan, 2", "Feb, 4", "Mar, 6"]);
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("arrow keys move focus; Enter selects with the datum key (String(x))", async () => {
    const onSelectKey = vi.fn();
    const { container } = render(LineChart, { props: { label: "Line", data: lineData, onSelectKey } });
    await fireEvent.keyDown(navDatums(container, "st-lineChart")[0], { key: "ArrowDown" });
    await fireEvent.keyDown(navDatums(container, "st-lineChart")[1], { key: "Enter" });
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
    const { container } = render(AreaChart, { props: { label: "Area", data: areaData } });
    expect(navDatums(container, "st-areaChart").length).toBe(0);
  });

  it("overlay datums announce x + value", () => {
    const { container } = render(AreaChart, { props: { label: "Area", data: areaData, keyboardNav: true } });
    const datums = navDatums(container, "st-areaChart");
    expect(datums.map((d) => d.getAttribute("aria-label"))).toEqual(["Q1, 10", "Q2, 20", "Q3, 15"]);
  });

  it("bare-number data announces the index as category and selects with index key", async () => {
    const onSelectKey = vi.fn();
    const { container } = render(AreaChart, { props: { label: "Area", data: [5, 7, 9], onSelectKey } });
    const datums = navDatums(container, "st-areaChart");
    expect(datums[2].getAttribute("aria-label")).toBe("2, 9");
    await fireEvent.keyDown(navDatums(container, "st-areaChart")[0], { key: "End" });
    await fireEvent.keyDown(navDatums(container, "st-areaChart")[2], { key: "Enter" });
    expect(onSelectKey).toHaveBeenLastCalledWith("2");
  });
});
