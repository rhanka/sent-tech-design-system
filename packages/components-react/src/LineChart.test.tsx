import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LineChart } from "./index.js";
import type { LineChartDatum } from "./LineChart.js";

const data: LineChartDatum[] = [
  { x: 0, y: 2 },
  { x: 1, y: 4 },
  { x: 2, y: 6 },
  { x: 3, y: 8 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("LineChart analytical overlays (parity with Svelte)", () => {
  it("renders no overlays by default (additive — zero regression)", () => {
    const { container } = render(<LineChart label="Plain" data={data} />);
    expect(container.querySelector(".st-lineChart__band")).toBeNull();
    expect(container.querySelector(".st-lineChart__refLine")).toBeNull();
    expect(container.querySelector(".st-lineChart__goalLine")).toBeNull();
    expect(container.querySelector(".st-lineChart__trend")).toBeNull();
    expect(listItems(container)).toEqual(["0: 2", "1: 4", "2: 6", "3: 8"]);
  });

  it("renders a toned reference line + a11y item", () => {
    const { container } = render(
      <LineChart label="Ref" data={data} referenceLines={[{ value: 5, label: "Cible", tone: "warning" }]} />,
    );
    const ref = container.querySelector(".st-lineChart__refLine");
    expect(ref?.classList.contains("st-lineChart__refLine--warning")).toBe(true);
    expect(listItems(container)).toContain("Référence: Cible = 5");
  });

  it("renders a band and describes it", () => {
    const { container } = render(
      <LineChart label="Band" data={data} bands={[{ from: 3, to: 5, label: "Plage", tone: "info" }]} />,
    );
    const band = container.querySelector(".st-lineChart__band");
    expect(band?.classList.contains("st-lineChart__band--info")).toBe(true);
    expect(Number(band?.getAttribute("height"))).toBeGreaterThan(0);
    expect(listItems(container)).toContain("Bande: Plage (3–5)");
  });

  it("draws the goal line ABOVE and bands/refs BELOW the data", () => {
    const { container } = render(
      <LineChart label="Order" data={data} bands={[{ from: 3, to: 5 }]} referenceLines={[{ value: 6 }]} goalLine={{ value: 5 }} />,
    );
    const nodes = Array.from(container.querySelectorAll("svg *"));
    const lineIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__line"));
    const bandIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__band"));
    const refIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__refLine"));
    const goalIdx = nodes.findIndex((n) => n.classList.contains("st-lineChart__goalLine"));
    expect(bandIdx).toBeLessThan(lineIdx);
    expect(refIdx).toBeLessThan(lineIdx);
    expect(goalIdx).toBeGreaterThan(lineIdx);
  });

  it("computes a correct least-squares trend slope (y = 2x + 2 → slope 2)", () => {
    const { container } = render(<LineChart label="Trend" data={data} trend />);
    expect(container.querySelector(".st-lineChart__trend")).not.toBeNull();
    expect(listItems(container)).toContain("Tendance: pente 2.00");
  });

  it("extends the value domain for an out-of-range reference", () => {
    const { container } = render(<LineChart label="Domain" data={data} referenceLines={[{ value: 100 }]} />);
    const ticks = Array.from(container.querySelectorAll(".st-lineChart__tickLabel")).map((n) => n.textContent?.trim());
    expect(ticks).toContain("100");
  });

  it("ignores non-finite overlay values", () => {
    const { container } = render(
      <LineChart
        label="NaN"
        data={data}
        referenceLines={[{ value: Number.NaN }]}
        goalLine={{ value: Number.POSITIVE_INFINITY }}
      />,
    );
    expect(container.querySelector(".st-lineChart__refLine")).toBeNull();
    expect(container.querySelector(".st-lineChart__goalLine")).toBeNull();
    expect(listItems(container)).toEqual(["0: 2", "1: 4", "2: 6", "3: 8"]);
  });
});
