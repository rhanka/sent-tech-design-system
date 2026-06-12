import { fireEvent, render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import CandlestickChart from "./lib/CandlestickChart.svelte";
import type { ChartAnnotation } from "./lib/chartAnnotations.js";

// Lun/Ven haussiers (close ≥ open), Mer baissier (close < open).
const week = [
  { label: "Lun", open: 142, high: 148, low: 139, close: 146 },
  { label: "Mar", open: 146, high: 151, low: 144, close: 149 },
  { label: "Mer", open: 149, high: 152, low: 140, close: 143 },
  { label: "Jeu", open: 143, high: 147, low: 138, close: 145 },
  { label: "Ven", open: 145, high: 155, low: 144, close: 153 }
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("CandlestickChart", () => {
  it("renders one candle (body + wick) per period", () => {
    const { container } = render(CandlestickChart, { props: { label: "Cours", data: week } });
    expect(container.querySelectorAll(".st-candlestickChart__body").length).toBe(week.length);
    expect(container.querySelectorAll(".st-candlestickChart__wick").length).toBe(week.length);
  });

  it("applies up/down body classes by direction", () => {
    const { container } = render(CandlestickChart, { props: { label: "Cours", data: week } });
    const bodies = container.querySelectorAll(".st-candlestickChart__body");
    expect(bodies[0].classList.contains("st-candlestickChart__body--up")).toBe(true);
    expect(bodies[2].classList.contains("st-candlestickChart__body--down")).toBe(true);
  });

  it("summarizes O/H/L/C per period in the accessible list", () => {
    const { container } = render(CandlestickChart, { props: { label: "Cours", data: week } });
    const items = listItems(container);
    expect(items[0]).toBe("Lun: O 142 H 148 L 139 C 146");
  });
});

// "Highcharts-class" extensions: annotations / dataLabels / crosshair / nav.
describe("CandlestickChart — annotations / dataLabels / crosshair / keyboard nav", () => {
  it("renders no overlay primitives by default", () => {
    const { container } = render(CandlestickChart, { props: { label: "Cours", data: week } });
    expect(container.querySelector(".st-candlestickChart__annotations")).toBeNull();
    expect(container.querySelector(".st-candlestickChart__dataLabel")).toBeNull();
    expect(container.querySelector(".st-candlestickChart__crosshairLine")).toBeNull();
    expect(container.querySelector(".st-candlestickChart__navLayer")).toBeNull();
  });

  it("renders a support line, a price region and a point annotation", () => {
    const annotations: ChartAnnotation[] = [
      { kind: "line", axis: "y", value: 150, label: "Résistance" },
      { kind: "region", axis: "y", from: 140, to: 145, label: "Zone" },
      { kind: "point", x: "Mer", y: 143, label: "Creux" }
    ];
    const { container } = render(CandlestickChart, { props: { label: "Cours", data: week, annotations } });
    expect(container.querySelectorAll(".st-candlestickChart__annotationLine").length).toBe(1);
    expect(container.querySelectorAll(".st-candlestickChart__annotationRegion").length).toBe(1);
    expect(container.querySelectorAll(".st-candlestickChart__annotationPoint").length).toBe(1);
    const items = listItems(container);
    expect(items).toContain("Annotation: Résistance");
    expect(items).toContain("Annotation: Zone");
    expect(items).toContain("Annotation: Creux");
  });

  it("renders one close data label per candle (aria-hidden)", () => {
    const { container } = render(CandlestickChart, { props: { label: "Cours", data: week, dataLabels: true } });
    const group = container.querySelector(".st-candlestickChart__dataLabels");
    expect(group?.getAttribute("aria-hidden")).toBe("true");
    const labels = container.querySelectorAll(".st-candlestickChart__dataLabel");
    expect(labels.length).toBe(week.length);
    expect(labels[0].textContent).toBe("146");
  });

  it("draws a controlled crosshair at the candle matching hoverKey", async () => {
    const { container, rerender } = render(CandlestickChart, { props: { label: "Cours", data: week, hoverKey: null } });
    expect(container.querySelector(".st-candlestickChart__crosshairLine")).toBeNull();
    await rerender({ label: "Cours", data: week, hoverKey: "Mer" });
    expect(container.querySelector(".st-candlestickChart__crosshairLine")).not.toBeNull();
  });

  it("enables a roving keyboard overlay announcing date + O/H/L/C", async () => {
    const onSelectKey = vi.fn();
    const { container } = render(CandlestickChart, { props: { label: "Cours", data: week, onSelectKey } });
    const datums = Array.from(container.querySelectorAll<SVGRectElement>(".st-candlestickChart__navDatum"));
    expect(datums.length).toBe(week.length);
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1", "-1", "-1"]);
    expect(datums[0].getAttribute("aria-label")).toBe("Lun, O 142 H 148 L 139 C 146");
    await fireEvent.keyDown(datums[0], { key: "End" });
    await fireEvent.keyDown(
      container.querySelectorAll<SVGRectElement>(".st-candlestickChart__navDatum")[4],
      { key: " " }
    );
    expect(onSelectKey).toHaveBeenLastCalledWith("Ven");
  });
});
