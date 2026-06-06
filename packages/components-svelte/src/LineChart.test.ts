import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import LineChart from "./lib/LineChart.svelte";
import type { LineChartDatum } from "./lib/LineChart.svelte";

const data: LineChartDatum[] = [
  { x: 0, y: 2 },
  { x: 1, y: 4 },
  { x: 2, y: 6 },
  { x: 3, y: 8 }
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("LineChart analytical overlays", () => {
  it("renders no overlays by default (additive — zero regression)", () => {
    const { container } = render(LineChart, { props: { label: "Plain", data } });
    expect(container.querySelector(".st-lineChart__band")).toBeNull();
    expect(container.querySelector(".st-lineChart__refLine")).toBeNull();
    expect(container.querySelector(".st-lineChart__goalLine")).toBeNull();
    expect(container.querySelector(".st-lineChart__trend")).toBeNull();
    // Data list carries only the data points, nothing extra.
    expect(listItems(container)).toEqual(["0: 2", "1: 4", "2: 6", "3: 8"]);
  });

  it("renders a reference line with a tone class and an a11y description", () => {
    const { container } = render(LineChart, {
      props: { label: "Ref", data, referenceLines: [{ value: 5, label: "Cible", tone: "warning" }] }
    });
    const ref = container.querySelector(".st-lineChart__refLine");
    expect(ref).not.toBeNull();
    expect(ref!.classList.contains("st-lineChart__refLine--warning")).toBe(true);
    expect(listItems(container)).toContain("Référence: Cible = 5");
  });

  it("renders a shaded band and describes it", () => {
    const { container } = render(LineChart, {
      props: { label: "Band", data, bands: [{ from: 3, to: 5, label: "Plage", tone: "info" }] }
    });
    const band = container.querySelector(".st-lineChart__band");
    expect(band).not.toBeNull();
    expect(band!.classList.contains("st-lineChart__band--info")).toBe(true);
    expect(Number(band!.getAttribute("height"))).toBeGreaterThan(0);
    expect(listItems(container)).toContain("Bande: Plage (3–5)");
  });

  it("renders a goal line and describes it", () => {
    const { container } = render(LineChart, {
      props: { label: "Goal", data, goalLine: { value: 7, label: "Objectif Q3" } }
    });
    expect(container.querySelector(".st-lineChart__goalLine")).not.toBeNull();
    expect(listItems(container)).toContain("Objectif: Objectif Q3 = 7");
  });

  it("draws the goal line ABOVE the data (after the line path in document order)", () => {
    const { container } = render(LineChart, { props: { label: "Order", data, goalLine: { value: 5 } } });
    const nodes = Array.from(container.querySelectorAll("svg *"));
    const lineIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__line"));
    const goalIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__goalLine"));
    expect(lineIdx).toBeGreaterThanOrEqual(0);
    expect(goalIdx).toBeGreaterThan(lineIdx);
  });

  it("draws bands and reference lines BELOW the data (before the line path)", () => {
    const { container } = render(LineChart, {
      props: { label: "Below", data, bands: [{ from: 3, to: 5 }], referenceLines: [{ value: 6 }] }
    });
    const nodes = Array.from(container.querySelectorAll("svg *"));
    const lineIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__line"));
    const bandIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__band"));
    const refIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__refLine"));
    expect(bandIdx).toBeGreaterThanOrEqual(0);
    expect(bandIdx).toBeLessThan(lineIdx);
    expect(refIdx).toBeLessThan(lineIdx);
  });

  it("computes a correct least-squares trend slope (y = 2x + 2 → slope 2)", () => {
    const { container } = render(LineChart, { props: { label: "Trend", data, trend: true } });
    expect(container.querySelector(".st-lineChart__trend")).not.toBeNull();
    // data above is exactly y = 2x + 2.
    expect(listItems(container)).toContain("Tendance: pente 2.00");
  });

  it("extends the value domain so an out-of-range reference stays on-plot", () => {
    // Data tops at 8; a reference at 100 must push the top tick up.
    const { container } = render(LineChart, {
      props: { label: "Domain", data, referenceLines: [{ value: 100 }] }
    });
    const ticks = Array.from(container.querySelectorAll(".st-lineChart__tickLabel")).map((n) =>
      n.textContent?.trim()
    );
    expect(ticks).toContain("100");
  });

  it("ignores non-finite overlay values (no render, no a11y item, no domain change)", () => {
    const { container } = render(LineChart, {
      props: {
        label: "NaN",
        data,
        referenceLines: [{ value: Number.NaN }],
        goalLine: { value: Number.POSITIVE_INFINITY }
      }
    });
    expect(container.querySelector(".st-lineChart__refLine")).toBeNull();
    expect(container.querySelector(".st-lineChart__goalLine")).toBeNull();
    // Only the data points are described.
    expect(listItems(container)).toEqual(["0: 2", "1: 4", "2: 6", "3: 8"]);
  });
});
