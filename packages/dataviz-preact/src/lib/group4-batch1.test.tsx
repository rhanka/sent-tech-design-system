import { signal } from "@preact/signals";
import { cleanup, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { GeoHexbinMap } from "./GeoHexbinMap.js";
import { GeoJsonMap } from "./GeoJsonMap.js";
import { GeoPointMap } from "./GeoPointMap.js";
import { HLCChart } from "./HLCChart.js";
import { HeatmapChart } from "./HeatmapChart.js";

afterEach(cleanup);

describe("P6 group 4 batch 1 (Preact leg + MaybeSignal mutations)", () => {
  it("GeoHexbinMap, GeoJsonMap, GeoPointMap, HLCChart and HeatmapChart react to post-mount MaybeSignal mutations with normalised SVG", async () => {
    const model: DataModel = {
      dimensions: [
        { id: "id", label: "Id", type: "discrete" },
        { id: "city", label: "City", type: "discrete" },
        { id: "day", label: "Day", type: "discrete" },
        { id: "slot", label: "Slot", type: "discrete" },
        { id: "shape", label: "Shape", type: "discrete" },
      ],
      measures: [
        { id: "lat", label: "Lat", aggregation: "avg" },
        { id: "lon", label: "Lon", aggregation: "avg" },
        { id: "high", label: "High", aggregation: "max" },
        { id: "low", label: "Low", aggregation: "min" },
        { id: "close", label: "Close", aggregation: "avg" },
        { id: "val", label: "Value", aggregation: "sum" },
      ],
    };
    const shape = {
      type: "Polygon",
      coordinates: [[[2, 48], [3, 48], [3, 49], [2, 48]]],
    } as unknown as Row[string];
    const rows: Row[] = [
      { id: "p1", city: "Paris", day: "Mon", slot: "AM", shape, lat: 48.85, lon: 2.35, high: 120, low: 95, close: 110, val: 40 },
      { id: "p2", city: "Lyon", day: "Tue", slot: "PM", shape, lat: 45.76, lon: 4.83, high: 130, low: 100, close: 125, val: 60 },
    ];
    const store = createDashboardStore({ model, data: rows });

    const hexCls = signal("hex-a");
    const jsonCls = signal("json-a");
    const pointCls = signal("point-a");
    const hlcCls = signal("hlc-a");
    const heatCls = signal("heat-a");
    const heatLegend = signal(true);

    const { container } = render(
      <>
        <GeoHexbinMap store={store} viewId="hex" latitude="lat" longitude="lon" value="val" cellSize={10} label="Hexbins" className={hexCls} />
        <GeoJsonMap store={store} viewId="json" geometry="shape" id="id" labelField="city" value="val" label="GeoJSON" className={jsonCls} />
        <GeoPointMap store={store} viewId="pts" latitude="lat" longitude="lon" id="id" labelField="city" value="val" label="Points" className={pointCls} />
        <HLCChart store={store} viewId="hlc" label_field="day" high="high" low="low" close="close" label="Sessions HLC" className={hlcCls} />
        <HeatmapChart store={store} viewId="heat" x="day" y="slot" measure="val" legend={heatLegend} label="Activity heat" className={heatCls} />
      </>,
    );

    expect(screen.getByRole("img", { name: "Hexbins" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "GeoJSON" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Points" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Sessions HLC" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Activity heat" })).toBeTruthy();

    expect(container.querySelector(".st-geoHexbinMap")?.className).toContain("hex-a");
    expect(container.querySelector(".st-geoJsonMap")?.className).toContain("json-a");
    expect(container.querySelector(".st-geoPointMap")?.className).toContain("point-a");
    expect(container.querySelector(".hlc-a")).toBeTruthy();
    expect(container.querySelector(".heat-a")).toBeTruthy();
    expect(container.querySelector(".heat-a .st-heatmapChart__legend")).toBeTruthy();

    const hlcSvg = container.querySelector(".hlc-a svg");
    expect(hlcSvg).toBeTruthy();
    expect(container.querySelector(".hlc-a [strokeWidth]")).toBeNull();

    hexCls.value = "hex-b";
    jsonCls.value = "json-b";
    pointCls.value = "point-b";
    hlcCls.value = "hlc-b";
    heatCls.value = "heat-b";
    heatLegend.value = false;

    await waitFor(() => {
      expect(container.querySelector(".st-geoHexbinMap")?.className).toContain("hex-b");
      expect(container.querySelector(".st-geoJsonMap")?.className).toContain("json-b");
      expect(container.querySelector(".st-geoPointMap")?.className).toContain("point-b");
      expect(container.querySelector(".hlc-b")).toBeTruthy();
      expect(container.querySelector(".heat-b")).toBeTruthy();
      expect(container.querySelector(".heat-b .st-heatmapChart__legend")).toBeNull();
    });
  });
});
