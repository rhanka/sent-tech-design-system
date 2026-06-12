import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScatterPlot } from "./index.js";
import type { ScatterPlotDatum } from "./ScatterPlot.js";
import type { ChartAnnotation } from "./chartAnnotations.js";

// ScatterPlot "Highcharts-class" props (react), strict tri-framework parity:
// annotations (FR), dataLabels (FR-2), crosshair (FR-3), keyboard nav (FR-5).
// Both axes are continuous (numeric) — linear xScale/yScale.

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const data: ScatterPlotDatum[] = [
  { x: 1, y: 2, label: "A" },
  { x: 2, y: 4, label: "B" },
  { x: 3, y: 6, label: "C" },
];

const listItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-chartDataList li")).map((n) => n.textContent?.trim());
const navDatums = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<SVGRectElement>(".st-scatterPlot__navDatum"));
const dataLabelTexts = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".st-scatterPlot__dataLabel")).map((n) => n.textContent?.trim());

describe("ScatterPlot annotations", () => {
  it("renders nothing extra by default (additive)", () => {
    const { container } = render(<ScatterPlot label="Plain" data={data} />);
    expect(container.querySelector(".st-scatterPlot__annotations")).toBeNull();
  });

  it("renders the 5 kinds (x AND y continuous) and appends a11y items", () => {
    const annotations: ChartAnnotation[] = [
      { kind: "region", axis: "y", from: 2, to: 4, label: "Zone" },
      { kind: "line", axis: "x", value: 2, label: "Repère" },
      { kind: "point", x: 3, y: 6, label: "Pic" },
      { kind: "label", x: 1, y: 4, text: "Ici" },
      { kind: "shape", points: [{ x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 2 }], label: "Aire" },
    ];
    const { container } = render(<ScatterPlot label="Ann" data={data} annotations={annotations} />);
    expect(container.querySelector(".st-scatterPlot__annotationRegion")).not.toBeNull();
    expect(container.querySelector(".st-scatterPlot__annotationLine")).not.toBeNull();
    expect(container.querySelector(".st-scatterPlot__annotationPoint")).not.toBeNull();
    expect(container.querySelector(".st-scatterPlot__annotationText")).not.toBeNull();
    expect(container.querySelector(".st-scatterPlot__annotationShape")).not.toBeNull();
    const items = listItems(container);
    expect(items).toContain("Annotation: Zone");
    expect(items).toContain("Annotation: Repère");
    expect(items).toContain("Annotation: Ici");
  });

  it("draws regions BEHIND and other annotations ABOVE the points", () => {
    const annotations: ChartAnnotation[] = [
      { kind: "region", axis: "y", from: 2, to: 4 },
      { kind: "point", x: 3, y: 6 },
    ];
    const { container } = render(<ScatterPlot label="Order" data={data} annotations={annotations} />);
    const nodes = Array.from(container.querySelectorAll("svg *"));
    const pointIdx = nodes.findIndex((n) => n.classList.contains("st-scatterPlot__point"));
    const regionIdx = nodes.findIndex((n) => n.classList.contains("st-scatterPlot__annotationRegion"));
    const annPointIdx = nodes.findIndex((n) => n.classList.contains("st-scatterPlot__annotationPoint"));
    expect(regionIdx).toBeLessThan(pointIdx);
    expect(annPointIdx).toBeGreaterThan(pointIdx);
  });

  it("ignores an out-of-domain annotation (never escapes the plot)", () => {
    const { container } = render(
      <ScatterPlot label="Out" data={data} annotations={[{ kind: "point", x: 99, y: 99 }]} />,
    );
    expect(container.querySelector(".st-scatterPlot__annotationPoint")).toBeNull();
  });
});

describe("ScatterPlot data labels (FR-2)", () => {
  it("renders no data labels by default (off — zero regression)", () => {
    const { container } = render(<ScatterPlot label="Plain" data={data} />);
    expect(container.querySelector(".st-scatterPlot__dataLabel")).toBeNull();
  });

  it("`dataLabels={true}` shows the datum label (else the value) on every point", () => {
    const { container } = render(<ScatterPlot label="DL" data={data} dataLabels />);
    expect(dataLabelTexts(container)).toEqual(["A", "B", "C"]);
  });

  it("falls back to the y value when a point has no label", () => {
    const { container } = render(
      <ScatterPlot label="DL" data={[{ x: 1, y: 2 }, { x: 2, y: 4 }]} dataLabels />,
    );
    expect(dataLabelTexts(container)).toEqual(["2", "4"]);
  });

  it("applies a custom `format`", () => {
    const { container } = render(
      <ScatterPlot label="DL" data={[{ x: 1, y: 2 }]} dataLabels={{ format: (v) => `${v} pts` }} />,
    );
    expect(dataLabelTexts(container)).toEqual(["2 pts"]);
  });

  it("labels are aria-hidden (values stay in the accessible ChartDataList)", () => {
    const { container } = render(<ScatterPlot label="DL" data={data} dataLabels />);
    expect(container.querySelector(".st-scatterPlot__dataLabels")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("ScatterPlot crosshair / synchronised hover (FR-3)", () => {
  it("uncontrolled: no crosshair by default, internal hover drives it (crossed pair)", () => {
    const { container } = render(<ScatterPlot label="Uncontrolled" data={data} />);
    expect(container.querySelector(".st-scatterPlot__crosshair")).toBeNull();
    const points = container.querySelectorAll(".st-scatterPlot__point");
    fireEvent.pointerMove(points[1]);
    expect(container.querySelector(".st-scatterPlot__crosshair")).not.toBeNull();
    // Crossed crosshair: a vertical AND a horizontal line.
    expect(container.querySelectorAll(".st-scatterPlot__crosshairLine").length).toBe(2);
    expect(container.querySelector(".st-scatterPlot__tooltipLabel")?.textContent).toBe("B");
    fireEvent.pointerLeave(container.querySelector(".st-scatterPlot__visual") as Element);
    expect(container.querySelector(".st-scatterPlot__crosshair")).toBeNull();
  });

  it("controlled: crosshair + tooltip track hoverKey (the label), ignoring pointer", () => {
    const { container } = render(<ScatterPlot label="Controlled" data={data} hoverKey="C" />);
    expect(container.querySelector(".st-scatterPlot__crosshair")).not.toBeNull();
    expect(container.querySelector(".st-scatterPlot__tooltipLabel")?.textContent).toBe("C");
    const points = container.querySelectorAll(".st-scatterPlot__point");
    fireEvent.pointerMove(points[0]);
    expect(container.querySelector(".st-scatterPlot__tooltipLabel")?.textContent).toBe("C");
  });

  it("controlled with hoverKey=null shows nothing", () => {
    const { container } = render(<ScatterPlot label="Null" data={data} hoverKey={null} />);
    expect(container.querySelector(".st-scatterPlot__crosshair")).toBeNull();
  });

  it("emits onHoverKeyChange on move (the point key) and on leave (null)", () => {
    const onHoverKeyChange = vi.fn();
    const { container } = render(<ScatterPlot label="Emit" data={data} onHoverKeyChange={onHoverKeyChange} />);
    const points = container.querySelectorAll(".st-scatterPlot__point");
    fireEvent.pointerMove(points[2]);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("C");
    fireEvent.pointerLeave(container.querySelector(".st-scatterPlot__visual") as Element);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith(null);
  });

  it("a label-less point uses its serialised coordinates as key", () => {
    const onHoverKeyChange = vi.fn();
    const { container } = render(
      <ScatterPlot label="NoLabel" data={[{ x: 1, y: 2 }, { x: 7, y: 9 }]} onHoverKeyChange={onHoverKeyChange} />,
    );
    const points = container.querySelectorAll(".st-scatterPlot__point");
    fireEvent.pointerMove(points[1]);
    expect(onHoverKeyChange).toHaveBeenLastCalledWith("7,9");
  });
});

describe("ScatterPlot — keyboard datapoint navigation (FR-5)", () => {
  it("no overlay by default", () => {
    const { container } = render(<ScatterPlot label="Plain" data={data} />);
    expect(navDatums(container).length).toBe(0);
  });

  it("overlay datums carry key + value labels in data order", () => {
    const { container } = render(<ScatterPlot label="Nav" data={data} keyboardNav />);
    const datums = navDatums(container);
    expect(datums.length).toBe(3);
    expect(datums.map((d) => d.getAttribute("aria-label"))).toEqual(["A, 2", "B, 4", "C, 6"]);
    expect(datums.map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
    expect(container.querySelector(".st-scatterPlot__navLayer")?.getAttribute("role")).toBe("group");
  });

  it("is enabled implicitly by wiring onSelectKey", () => {
    const { container } = render(<ScatterPlot label="Nav" data={data} onSelectKey={() => {}} />);
    expect(navDatums(container).length).toBe(3);
  });

  it("arrow keys move focus; Enter selects with the point key (label)", () => {
    const onSelectKey = vi.fn();
    const { container } = render(<ScatterPlot label="Nav" data={data} onSelectKey={onSelectKey} />);
    fireEvent.keyDown(navDatums(container)[0], { key: "ArrowRight" });
    expect(navDatums(container).map((d) => d.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
    fireEvent.keyDown(navDatums(container)[1], { key: "Enter" });
    expect(onSelectKey).toHaveBeenLastCalledWith("B");
  });

  it("Escape leaves the navigation (onSelectKey null) and resets the tab stop", () => {
    const onSelectKey = vi.fn();
    const { container } = render(<ScatterPlot label="Nav" data={data} onSelectKey={onSelectKey} />);
    fireEvent.keyDown(navDatums(container)[0], { key: "End" });
    fireEvent.keyDown(navDatums(container)[2], { key: "Escape" });
    expect(onSelectKey).toHaveBeenLastCalledWith(null);
    expect(navDatums(container).map((d) => d.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("label-less data selects with the serialised coordinates", () => {
    const onSelectKey = vi.fn();
    const { container } = render(
      <ScatterPlot label="Nav" data={[{ x: 1, y: 2 }, { x: 7, y: 9 }]} onSelectKey={onSelectKey} />,
    );
    const datums = navDatums(container);
    expect(datums[1].getAttribute("aria-label")).toBe("7, 9, 9");
    fireEvent.keyDown(datums[0], { key: "End" });
    fireEvent.keyDown(navDatums(container)[1], { key: "Enter" });
    expect(onSelectKey).toHaveBeenLastCalledWith("7,9");
  });
});
