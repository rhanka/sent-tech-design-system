import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarChart } from "./index.js";
import type { BarChartDatum } from "./BarChart.js";

const data: BarChartDatum[] = [
  { label: "A", value: 4 },
  { label: "B", value: 8 },
  { label: "C", value: 2 },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());
const tickLabels = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-barChart__tickLabel")).map((n) => n.textContent?.trim());

describe("BarChart analytical overlays + error bars (parity with Svelte)", () => {
  it("renders no overlays/error bars by default (additive — zero regression)", () => {
    const { container } = render(<BarChart label="Plain" data={data} />);
    expect(container.querySelector(".st-barChart__band")).toBeNull();
    expect(container.querySelector(".st-barChart__refLine")).toBeNull();
    expect(container.querySelector(".st-barChart__goalLine")).toBeNull();
    expect(container.querySelector(".st-barChart__errorBar")).toBeNull();
    expect(listItems(container)).toEqual(["A: 4", "B: 8", "C: 2"]);
  });

  it("renders a toned reference line + a11y item", () => {
    const { container } = render(
      <BarChart label="Ref" data={data} referenceLines={[{ value: 6, label: "Seuil", tone: "error" }]} />,
    );
    const ref = container.querySelector(".st-barChart__refLine");
    expect(ref?.classList.contains("st-barChart__refLine--error")).toBe(true);
    expect(listItems(container)).toContain("Référence: Seuil = 6");
  });

  it("renders a band + goal line and describes both", () => {
    const { container } = render(
      <BarChart label="BG" data={data} bands={[{ from: 2, to: 5, label: "Zone" }]} goalLine={{ value: 7 }} />,
    );
    expect(container.querySelector(".st-barChart__band")).not.toBeNull();
    expect(container.querySelector(".st-barChart__goalLine")).not.toBeNull();
    expect(listItems(container)).toContain("Bande: Zone (2–5)");
    expect(listItems(container)).toContain("Objectif: 7");
  });

  it("draws bands BELOW the bars and the goal line ABOVE (document order)", () => {
    const { container } = render(
      <BarChart label="Order" data={data} bands={[{ from: 2, to: 5 }]} goalLine={{ value: 7 }} />,
    );
    const nodes = Array.from(container.querySelectorAll("svg *"));
    const firstBar = nodes.findIndex((n) => n.classList.contains("st-barChart__bar"));
    const band = nodes.findIndex((n) => n.classList.contains("st-barChart__band"));
    const goal = nodes.findIndex((n) => n.classList.contains("st-barChart__goalLine"));
    expect(band).toBeLessThan(firstBar);
    expect(goal).toBeGreaterThan(firstBar);
  });

  it("renders an error-bar whisker only for data with finite extents", () => {
    const withErrors: BarChartDatum[] = [
      { label: "A", value: 4, errorLow: 3, errorHigh: 5 },
      { label: "B", value: 8 },
      { label: "C", value: 2, errorLow: Number.NaN, errorHigh: Number.NaN },
    ];
    const { container } = render(<BarChart label="Err" data={withErrors} />);
    const groups = container.querySelectorAll(".st-barChart__errorBar");
    expect(groups.length).toBe(1);
    expect(groups[0].querySelectorAll(".st-barChart__errorCap").length).toBe(2);
  });

  it("extends the auto domain for an out-of-range reference", () => {
    const { container } = render(<BarChart label="Domain" data={data} referenceLines={[{ value: 100 }]} />);
    expect(tickLabels(container)).toContain("100");
  });

  it("does NOT widen a pinned domain for overlays", () => {
    const { container } = render(
      <BarChart label="Pinned" data={data} domain={[0, 10]} referenceLines={[{ value: 100 }]} />,
    );
    expect(tickLabels(container)).not.toContain("100");
    expect(tickLabels(container)).toContain("10");
  });

  it("ignores a non-finite goal value", () => {
    const { container } = render(<BarChart label="NaN" data={data} goalLine={{ value: Number.NaN }} />);
    expect(container.querySelector(".st-barChart__goalLine")).toBeNull();
    expect(listItems(container)).toEqual(["A: 4", "B: 8", "C: 2"]);
  });
});
