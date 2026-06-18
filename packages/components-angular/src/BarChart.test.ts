import "@angular/compiler";
import { describe, expect, it } from "vitest";

import { BarChart, type BarChartDatum } from "../dist/BarChart.js";

const data: BarChartDatum[] = [
  { label: "A", value: 4 },
  { label: "B", value: 8, tone: "category2" },
  { label: "C", value: 2 },
];

describe("BarChart (angular)", () => {
  it("computes visible bars, ticks, category labels, and chart data list items", () => {
    const component = new BarChart();
    component.label = "Plain";
    component.data = data;

    expect(component.bars).toHaveLength(3);
    expect(component.bars[1]?.datum.label).toBe("B");
    expect(component.gridItems.length).toBeGreaterThan(0);
    expect(component.categoryLabels.map((item) => item.text)).toEqual(["A", "B", "C"]);
    expect(component.dataValueItems).toEqual(["A: 4", "B: 8", "C: 2"]);
  });

  it("supports controlled selection through accessible filter chips", () => {
    const selected: string[] = [];
    const component = new BarChart();
    component.label = "Selectable";
    component.data = data;
    component.selectedKeys = ["B"];
    component.onSelect = (key) => selected.push(key);

    expect(component.interactive).toBe(true);
    expect(component.barClass(component.bars[1]!)).toContain("st-barChart__bar--selected");
    expect(component.barClass(component.bars[0]!)).toContain("st-barChart__bar--dim");
    expect(component.filterChipClass(component.bars[1]!)).toContain("st-barChart__filterChip--selected");

    component.selectBar("A");
    expect(selected).toEqual(["A"]);
  });

  it("renders overlay geometry and describes overlays in the data list", () => {
    const component = new BarChart();
    component.label = "Overlays";
    component.data = [{ label: "A", value: 4, errorLow: 3, errorHigh: 5 }, { label: "B", value: 8 }, { label: "C", value: 2 }];
    component.referenceLines = [{ value: 6, label: "Seuil", tone: "error" }];
    component.bands = [{ from: 2, to: 5, label: "Zone" }];
    component.goalLine = { value: 7 };
    component.annotations = [
      { kind: "region", axis: "y", from: 3, to: 7, label: "Annotation zone" },
      { kind: "line", axis: "y", value: 6, label: "Annotation line" },
      { kind: "point", x: "B", y: 8, label: "Peak" },
      { kind: "shape", label: "Envelope", points: [{ x: "A", y: 2 }, { x: "B", y: 8 }, { x: "C", y: 2 }] },
      { kind: "label", x: "C", y: 2, text: "Low" },
    ];

    expect(component.refLines).toHaveLength(1);
    expect(component.refLineClass(component.refLines[0]!)).toContain("st-barChart__refLine--error");
    expect(component.bandRects).toHaveLength(1);
    expect(component.goalGeom?.value).toBe(7);
    expect(component.errorBarGeom).toHaveLength(1);
    expect(component.annotationRegions).toHaveLength(1);
    expect(component.annotationAbove.map((annotation) => annotation.kind)).toEqual(["line", "point", "shape", "label"]);
    const shape = component.annotationAbove[2];
    if (shape?.kind !== "shape") throw new Error("expected shape annotation");
    expect(component.annotationShapePoints(shape)).toContain(",");
    expect(component.dataValueItems).toContain("Référence: Seuil = 6");
    expect(component.dataValueItems).toContain("Bande: Zone (2–5)");
    expect(component.dataValueItems).toContain("Objectif: 7");
    expect(component.dataValueItems).toContain("Annotation: Annotation zone");
    expect(component.dataValueItems).toContain("Annotation: Low");
  });

  it("emits shared hover keys from pointer movement", () => {
    const hovers: Array<string | null> = [];
    const component = new BarChart();
    component.label = "Hover";
    component.data = data;
    component.onHoverKeyChange = (key) => hovers.push(key);

    component.handleVisualPointerMove({
      target: { getAttribute: () => "1" },
    } as unknown as PointerEvent);
    expect(component.hoveredBar?.datum.label).toBe("B");

    component.handleLeave();
    expect(hovers).toEqual(["B", null]);
  });

  it("moves keyboard roving focus state and emits keyboard selections", () => {
    const hovers: Array<string | null> = [];
    const selections: Array<string | null> = [];
    const component = new BarChart();
    component.label = "Keyboard";
    component.data = data;
    component.keyboardNav = true;
    component.onHoverKeyChange = (key) => hovers.push(key);
    component.onSelectKey = (key) => selections.push(key);

    const preventions: string[] = [];
    const event = {
      key: "ArrowRight",
      preventDefault: () => preventions.push("prevented"),
      currentTarget: { blur: () => selections.push(null) },
    } as unknown as KeyboardEvent;

    component.handleDatapointFocus(0);
    component.handleDatapointKeyDown(event, 0);
    expect(preventions).toEqual(["prevented"]);
    expect(component.rovingTabIndexFor(1)).toBe(0);
    expect(hovers).toEqual(["A", "B"]);

    component.handleDatapointKeyDown({ ...event, key: "Enter" } as unknown as KeyboardEvent, 1);
    expect(selections).toEqual(["B"]);
  });
});
