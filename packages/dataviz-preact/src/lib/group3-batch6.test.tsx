import { signal } from "@preact/signals";
import { cleanup, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { GanttChart } from "./GanttChart.js";
import { GaugeChart } from "./GaugeChart.js";
import { GeoClusterMap } from "./GeoClusterMap.js";
import { GeoDensityMap } from "./GeoDensityMap.js";
import { GeoFlowMap } from "./GeoFlowMap.js";

afterEach(cleanup);

describe("P6 group 3 batch 6 (Preact leg + MaybeSignal mutations)", () => {
  it("GanttChart, GaugeChart, GeoClusterMap, GeoDensityMap and GeoFlowMap follow post-mount className signals with normalised SVG", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "task", label: "Task", type: "discrete" },
        { id: "cat", label: "Category", type: "discrete" },
        { id: "id", label: "Id", type: "discrete" },
      ],
      measures: [
        { id: "start", label: "Start", aggregation: "min" },
        { id: "end", label: "End", aggregation: "max" },
        { id: "score", label: "Score", aggregation: "avg" },
        { id: "lat", label: "Lat", aggregation: "avg" },
        { id: "lon", label: "Lon", aggregation: "avg" },
        { id: "tlat", label: "Target Lat", aggregation: "avg" },
        { id: "tlon", label: "Target Lon", aggregation: "avg" },
        { id: "vol", label: "Volume", aggregation: "sum" },
      ],
    };
    const rows: Row[] = [
      { task: "Design", cat: "Build", id: "p1", start: 0, end: 10, score: 72, lat: 48.85, lon: 2.35, tlat: 45.76, tlon: 4.83, vol: 40 },
      { task: "Ship", cat: "Release", id: "p2", start: 10, end: 20, score: 84, lat: 48.86, lon: 2.36, tlat: 43.29, tlon: 5.36, vol: 60 },
    ];
    const store = createDashboardStore({ model, data: rows });
    const ganttCls = signal("gantt-a");
    const gaugeCls = signal("gauge-a");
    const clusterCls = signal("cluster-a");
    const densityCls = signal("density-a");
    const flowCls = signal("flow-a");

    const { container } = render(
      <>
        <GanttChart store={store} viewId="gantt" task="task" start="start" end="end" category="cat" label="Roadmap" className={ganttCls} />
        <GaugeChart store={store} viewId="gauge" value="score" label="Health" min={0} max={100} className={gaugeCls} />
        <GeoClusterMap store={store} viewId="gcl" latitude="lat" longitude="lon" id="id" value="vol" label="Clusters" className={clusterCls} />
        <GeoDensityMap store={store} viewId="gdn" latitude="lat" longitude="lon" value="vol" label="Density" className={densityCls} />
        <GeoFlowMap
          store={store}
          viewId="gfl"
          sourceLatitude="lat"
          sourceLongitude="lon"
          targetLatitude="tlat"
          targetLongitude="tlon"
          value="vol"
          label="Flows"
          className={flowCls}
        />
      </>,
    );

    expect(screen.getByRole("img", { name: "Roadmap" })).toBeTruthy();
    expect(screen.getByRole("meter", { name: "Health" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Clusters" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Density" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Flows" })).toBeTruthy();

    expect(container.querySelector(".gantt-a")).toBeTruthy();
    expect(container.querySelector(".gauge-a")).toBeTruthy();
    expect(container.querySelector(".st-geoClusterMap")?.className).toContain("cluster-a");
    expect(container.querySelector(".st-geoDensityMap")?.className).toContain("density-a");
    expect(container.querySelector(".st-geoFlowMap")?.className).toContain("flow-a");

    const gaugeTrack = container.querySelector(".gauge-a .st-gaugeChart__track");
    expect(gaugeTrack?.getAttribute("stroke-width")).toBeTruthy();
    expect(gaugeTrack?.getAttribute("strokeWidth")).toBeNull();
    const gaugeValue = container.querySelector(".gauge-a .st-gaugeChart__value");
    expect(gaugeValue?.getAttribute("text-anchor")).toBe("middle");
    expect(gaugeValue?.getAttribute("textAnchor")).toBeNull();

    ganttCls.value = "gantt-b";
    gaugeCls.value = "gauge-b";
    clusterCls.value = "cluster-b";
    densityCls.value = "density-b";
    flowCls.value = "flow-b";

    await waitFor(() => {
      expect(container.querySelector(".gantt-b")).toBeTruthy();
      expect(container.querySelector(".gauge-b")).toBeTruthy();
      expect(container.querySelector(".st-geoClusterMap")?.className).toContain("cluster-b");
      expect(container.querySelector(".st-geoDensityMap")?.className).toContain("density-b");
      expect(container.querySelector(".st-geoFlowMap")?.className).toContain("flow-b");
    });
  });
});
