// Isolation proof for the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed via side-effect `import '../runtime.js'` in every direct
// SVG chart module. This file imports ONLY `CrossfilteredBarChart` and
// `TimeSeriesLineChart` (never `index.ts` or `runtime.ts` directly).
import { cleanup, render } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { CrossfilteredBarChart } from "./CrossfilteredBarChart.js";
import { TimeSeriesLineChart } from "./TimeSeriesLineChart.js";

afterEach(cleanup);

describe("P6 SVG runtime isolation (deep imports)", () => {
  it("CrossfilteredBarChart horizontal SVG normalises camelCase presentation attrs and preserves viewBox/preserveAspectRatio", () => {
    const model: DataModel = {
      dimensions: [{ id: "country", label: "Pays", type: "discrete" }],
      measures: [{ id: "sales", label: "Ventes", aggregation: "sum" }],
    };
    const data: Row[] = [
      { country: "FR", sales: 15 },
      { country: "US", sales: 20 },
    ];
    const { container } = render(
      <CrossfilteredBarChart
        store={createDashboardStore({ model, data })}
        viewId="h"
        dimension="country"
        measure="sales"
        label="Ventes"
        orientation="horizontal"
      />,
    );

    const svg = container.querySelector("svg") as SVGSVGElement;
    expect(svg.getAttribute("viewBox")).toBe("0 0 480 240");
    expect(svg.getAttribute("preserveAspectRatio")).toBe("xMidYMid meet");

    const tick = container.querySelector(".st-barChart__tickLabel") as SVGTextElement;
    expect(tick.getAttribute("text-anchor")).toBe("middle");
    expect(tick.getAttribute("textAnchor")).toBeNull();

    const category = container.querySelector(".st-barChart__categoryLabel") as SVGTextElement;
    expect(category.getAttribute("text-anchor")).toBe("end");
    expect(category.getAttribute("dominant-baseline")).toBe("middle");
    expect(category.getAttribute("textAnchor")).toBeNull();
    expect(category.getAttribute("dominantBaseline")).toBeNull();
  });

  it("TimeSeriesLineChart SVG normalises camelCase presentation attrs and preserves viewBox", () => {
    const model: DataModel = {
      dimensions: [{ id: "ts", label: "Time", type: "continuous" }],
      measures: [{ id: "users", label: "Users", aggregation: "sum" }],
    };
    const data: Row[] = [
      { ts: Date.UTC(2026, 4, 10), users: 100 },
      { ts: Date.UTC(2026, 4, 11), users: 200 },
    ];
    const { container } = render(
      <TimeSeriesLineChart
        store={createDashboardStore({ model, data })}
        viewId="ts"
        time="ts"
        measure="users"
        label="Users"
      />,
    );

    const svg = container.querySelector("svg") as SVGSVGElement;
    expect(svg.getAttribute("viewBox")).toBe("0 0 480 240");

    const grid = container.querySelector(".st-timeSeriesLineChart__grid") as SVGLineElement;
    expect(grid.getAttribute("stroke-dasharray")).toBe("2 3");
    expect(grid.getAttribute("strokeDasharray")).toBeNull();

    const yTick = container.querySelector(".st-timeSeriesLineChart__yTickLabel") as SVGTextElement;
    expect(yTick.getAttribute("text-anchor")).toBe("end");
    expect(yTick.getAttribute("dominant-baseline")).toBe("middle");
    expect(yTick.getAttribute("font-size")).toBe("11");
    expect(yTick.getAttribute("textAnchor")).toBeNull();
    expect(yTick.getAttribute("dominantBaseline")).toBeNull();

    const line = container.querySelector(".st-timeSeriesLineChart__line") as SVGPathElement;
    expect(line.getAttribute("stroke-width")).toBe("2");
    expect(line.getAttribute("stroke-linecap")).toBe("round");
    expect(line.getAttribute("stroke-linejoin")).toBe("round");
    expect(line.getAttribute("strokeWidth")).toBeNull();
  });

  it("deep-importing the SVG charts installs SVG tabIndex -> tabindex normalisation on Preact core", () => {
    const { container } = render(
      <svg viewBox="0 0 20 20">
        <rect className="probe" tabIndex={0} width={10} height={10} />
      </svg>,
    );
    const rect = container.querySelector("rect.probe") as SVGRectElement;
    expect(rect.getAttribute("tabindex")).toBe("0");
    expect(rect.getAttribute("tabIndex")).toBeNull();
    expect(rect.tabIndex).toBe(0);
  });
});
