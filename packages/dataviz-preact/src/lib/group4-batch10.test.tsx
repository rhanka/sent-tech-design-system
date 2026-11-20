import { signal } from "@preact/signals";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { TraceWaterfallChart } from "./TraceWaterfallChart.js";
import { TreegraphChart } from "./TreegraphChart.js";
import { TrendLineChart } from "./TrendLineChart.js";
import { ValueSlicer } from "./ValueSlicer.js";
import { VariablePieChart } from "./VariablePieChart.js";

afterEach(cleanup);

describe("P6 group 4 batch 10 (Preact leg + MaybeSignal mutations)", () => {
  it("TraceWaterfallChart, TreegraphChart, TrendLineChart, ValueSlicer and VariablePieChart react to post-mount MaybeSignal mutations", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "spanId", label: "Span", type: "discrete" },
        { id: "parentSpanId", label: "Parent", type: "discrete" },
        { id: "service", label: "Service", type: "discrete" },
        { id: "x", label: "X", type: "continuous" },
      ],
      measures: [
        { id: "start", label: "Start", aggregation: "min" },
        { id: "duration", label: "Duration", aggregation: "sum" },
        { id: "y", label: "Y", aggregation: "sum" },
        { id: "z", label: "Z", aggregation: "avg" },
      ],
    };
    const rows: Row[] = [
      { spanId: "s1", parentSpanId: "", service: "gateway", x: 1, start: 0, duration: 100, y: 10, z: 30 },
      { spanId: "s2", parentSpanId: "s1", service: "auth", x: 2, start: 10, duration: 40, y: 20, z: 50 },
      { spanId: "s3", parentSpanId: "s1", service: "db", x: 3, start: 50, duration: 45, y: 35, z: 70 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const slicerStore = createDashboardStore({ model, data: rows });

    const traceCls = signal("trace-a");
    const treeCls = signal("tree-a");
    const trendCls = signal("trend-a");
    const hoverKey = signal<string | null>(null);
    const slicerCls = signal("slicer-a");
    const pieCls = signal("pie-a");

    const { container } = render(
      <>
        <TraceWaterfallChart store={store} viewId="tw" spanId="spanId" parentSpanId="parentSpanId" service="service" start="start" duration="duration" label="Request trace" className={traceCls} />
        <TreegraphChart store={store} viewId="tg" id_field="spanId" parent_field="parentSpanId" label_field="service" label="Service tree" className={treeCls} />
        <TrendLineChart store={store} viewId="tr" x="x" y="y" hoverKey={hoverKey} label="Trend" className={trendCls} />
        <ValueSlicer store={slicerStore} dimension="service" legend="Services" className={slicerCls} />
        <VariablePieChart store={store} viewId="vp" label_field="service" value="y" z="z" label="Service pie" className={pieCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Request trace" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Service tree" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Trend" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Service pie" })).toBeTruthy();

    expect(container.querySelector(".trace-a")).toBeTruthy();
    expect(container.querySelector(".tree-a")).toBeTruthy();
    expect(container.querySelector(".st-trendLineChart")?.className).toContain("trend-a");
    expect(container.querySelector(".trend-a .st-lineChart__crosshair")).toBeNull();
    expect(container.querySelector(".slicer-a")).toBeTruthy();
    expect(container.querySelector(".pie-a")).toBeTruthy();

    fireEvent.click(screen.getByRole("checkbox", { name: "auth" }));
    await waitFor(() => {
      expect(slicerStore.getState().filters.service).toEqual({ kind: "include", values: ["auth"] });
    });

    traceCls.value = "trace-b";
    treeCls.value = "tree-b";
    trendCls.value = "trend-b";
    hoverKey.value = "3";
    slicerCls.value = "slicer-b";
    pieCls.value = "pie-b";

    await waitFor(() => {
      expect(container.querySelector(".trace-b")).toBeTruthy();
      expect(container.querySelector(".tree-b")).toBeTruthy();
      expect(container.querySelector(".st-trendLineChart")?.className).toContain("trend-b");
      expect(container.querySelector(".trend-b .st-lineChart__crosshair")).toBeTruthy();
      expect(container.querySelector(".slicer-b")).toBeTruthy();
      expect(container.querySelector(".pie-b")).toBeTruthy();
    });
  });
});
