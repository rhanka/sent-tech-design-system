import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ComboChart } from "./index.js";
import type { ComboChartBarSeries, ComboChartLineSeries } from "./ComboChart.js";
import type { ChartAnnotation } from "./chartAnnotations.js";

// ComboChart "Highcharts-class" extensions (FR-1/2/3/5) — strict tri-framework
// parity. The shared categorical x axis drives annotations, crosshair and the
// datapoint keyboard navigation; dataLabels sit on the bars AND the line points.

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const categories = ["Jan", "Feb", "Mar"];
const bars: ComboChartBarSeries[] = [{ label: "Revenue", data: [100, 200, 150], tone: "category1" }];
const lines: ComboChartLineSeries[] = [{ label: "Margin", data: [10, 25, 18], tone: "category3" }];

const navDatums = (c: HTMLElement) =>
  Array.from(c.querySelectorAll<SVGRectElement>(".st-comboChart__navDatum"));
const listItems = (c: HTMLElement) =>
  Array.from(c.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());

describe("ComboChart — annotations (FR-1)", () => {
  it("renders no annotation layer by default", () => {
    const { container } = render(<ComboChart label="C" categories={categories} bars={bars} lines={lines} />);
    expect(container.querySelector(".st-comboChart__annotations")).toBeNull();
  });

  it("renders a y-axis region behind, a category point above, and announces labels", () => {
    const annots: ChartAnnotation[] = [
      { kind: "region", axis: "y", from: 50, to: 120, label: "Cible" },
      { kind: "point", x: "Feb", y: 180, label: "Pic" },
      { kind: "label", x: "Mar", y: 150, text: "Note" },
    ];
    const { container } = render(
      <ComboChart label="C" categories={categories} bars={bars} lines={lines} annotations={annots} />,
    );
    expect(container.querySelector(".st-comboChart__annotations--behind")).not.toBeNull();
    expect(container.querySelector(".st-comboChart__annotationRegion")).not.toBeNull();
    expect(container.querySelector(".st-comboChart__annotationPoint")).not.toBeNull();
    expect(container.querySelector(".st-comboChart__annotationText")?.textContent).toBe("Note");
    // a11y: every labelled annotation is described in the data list.
    expect(listItems(container)).toEqual(expect.arrayContaining(["Annotation: Cible", "Annotation: Pic", "Annotation: Note"]));
  });
});

describe("ComboChart — dataLabels (FR-2)", () => {
  it("off by default; true labels both bars and line points", () => {
    const { container: off } = render(<ComboChart label="C" categories={categories} bars={bars} lines={lines} />);
    expect(off.querySelectorAll(".st-comboChart__dataLabel").length).toBe(0);

    const { container } = render(
      <ComboChart label="C" categories={categories} bars={bars} lines={lines} dataLabels />,
    );
    const labels = Array.from(container.querySelectorAll(".st-comboChart__dataLabel")).map((n) => n.textContent?.trim());
    // 3 bars + 3 line points.
    expect(labels.length).toBe(6);
    expect(labels).toEqual(expect.arrayContaining(["100", "200", "150", "10", "25", "18"]));
  });

  it("accepts a custom format", () => {
    const { container } = render(
      <ComboChart
        label="C"
        categories={categories}
        bars={bars}
        lines={lines}
        dataLabels={{ format: (v) => `${v}u` }}
      />,
    );
    const labels = Array.from(container.querySelectorAll(".st-comboChart__dataLabel")).map((n) => n.textContent?.trim());
    expect(labels).toContain("200u");
    expect(labels).toContain("25u");
  });
});

describe("ComboChart — crosshair / synchronised hover (FR-3)", () => {
  it("uncontrolled: no crosshair until a bar/point is hovered", () => {
    const { container } = render(<ComboChart label="C" categories={categories} bars={bars} lines={lines} />);
    expect(container.querySelector(".st-comboChart__crosshair")).toBeNull();
    fireEvent.pointerMove(container.querySelectorAll(".st-comboChart__bar")[1]);
    expect(container.querySelector(".st-comboChart__crosshair")).not.toBeNull();
  });

  it("controlled: crosshair tracks hoverKey (a category), ignoring internal pointer", () => {
    const { container } = render(
      <ComboChart label="C" categories={categories} bars={bars} lines={lines} hoverKey="Mar" />,
    );
    expect(container.querySelector(".st-comboChart__crosshairLine")).not.toBeNull();
  });

  it("controlled with hoverKey=null shows nothing", () => {
    const { container } = render(
      <ComboChart label="C" categories={categories} bars={bars} lines={lines} hoverKey={null} />,
    );
    expect(container.querySelector(".st-comboChart__crosshair")).toBeNull();
  });

  it("emits onHoverKeyChange with the CATEGORY on bar + line hover and null on leave", () => {
    const onHoverKeyChange = vi.fn();
    const { container } = render(
      <ComboChart label="C" categories={categories} bars={bars} lines={lines} onHoverKeyChange={onHoverKeyChange} />,
    );
    fireEvent.pointerMove(container.querySelectorAll(".st-comboChart__bar")[2]);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("Mar");
    fireEvent.pointerMove(container.querySelectorAll(".st-comboChart__dot")[0]);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("Jan");
    fireEvent.pointerLeave(container.querySelector(".st-comboChart__visual") as Element);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith(null);
  });
});

describe("ComboChart — keyboard datapoint navigation (FR-5)", () => {
  it("no overlay by default", () => {
    const { container } = render(<ComboChart label="C" categories={categories} bars={bars} lines={lines} />);
    expect(container.querySelector(".st-comboChart__navLayer")).toBeNull();
    expect(navDatums(container).length).toBe(0);
  });

  it("one focusable column per category, single roving tab stop, announces category + summary", () => {
    const { container } = render(
      <ComboChart label="C" categories={categories} bars={bars} lines={lines} keyboardNav />,
    );
    const datums = navDatums(container);
    expect(datums.length).toBe(3);
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
    expect(datums[1].getAttribute("aria-label")).toBe("Feb, Revenue: 200, Margin: 25");
    expect(container.querySelector(".st-comboChart__navLayer")?.getAttribute("role")).toBe("group");
  });

  it("arrows move focus; Enter selects with the category key; Escape leaves", () => {
    const onSelectKey = vi.fn();
    const { container } = render(
      <ComboChart label="C" categories={categories} bars={bars} lines={lines} onSelectKey={onSelectKey} />,
    );
    fireEvent.keyDown(navDatums(container)[0], { key: "ArrowRight" });
    expect(navDatums(container).map((d) => d.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
    fireEvent.keyDown(navDatums(container)[1], { key: "Enter" });
    expect(onSelectKey).toHaveBeenLastCalledWith("Feb");
    fireEvent.keyDown(navDatums(container)[1], { key: "Escape" });
    expect(onSelectKey).toHaveBeenLastCalledWith(null);
  });

  it("focusing a column drives the shared crosshair channel (FR-3 synergy)", () => {
    const onHoverKeyChange = vi.fn();
    const { container } = render(
      <ComboChart label="C" categories={categories} bars={bars} lines={lines} keyboardNav onHoverKeyChange={onHoverKeyChange} />,
    );
    fireEvent.keyDown(navDatums(container)[0], { key: "End" });
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("Mar");
  });
});

describe("ComboChart — existing FR-4 legend untouched", () => {
  it("still toggles series via onToggleSeries / hiddenSeries", () => {
    const onToggleSeries = vi.fn();
    const { container } = render(
      <ComboChart
        label="C"
        categories={categories}
        bars={bars}
        lines={lines}
        hiddenSeries={["Margin"]}
        onToggleSeries={onToggleSeries}
      />,
    );
    // Hidden line is omitted (no dots), legend button is pressed/off.
    expect(container.querySelectorAll(".st-comboChart__dot").length).toBe(0);
    const buttons = container.querySelectorAll<HTMLButtonElement>(".st-comboChart__legendButton");
    expect(buttons.length).toBe(2);
    fireEvent.click(buttons[0]);
    expect(onToggleSeries).toHaveBeenCalledWith("Revenue");
  });
});
