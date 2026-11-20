import { createDashboardStore, type DashboardState, type DataModel, type Row } from "@sentropic/dataviz-core";
import { describe, expect, it } from "vitest";
import { buildAdvancedPivotView } from "./advancedPivotData.js";
import { buildClusterScatterData, buildForecastLineData } from "./analyticsDsData.js";
import {
  downloadBlob,
  downloadPdf,
  downloadPng,
  downloadSvg,
  printElement,
  resolveSvg,
  serializeSvg,
  svgStringToBlob,
  svgStringToPngBlob,
} from "./chart-export.js";
import {
  choroplethLayer,
  clusterLayer,
  densityLayer,
  flowLayer,
  geojsonLayer,
  hexbinLayer,
  mapClass,
  pointsLayer,
} from "./geoMapLayers.js";
import {
  applyStateToStore,
  DEFAULT_URL_SYNC_PARAM,
  queryToState,
  readLocationSearch,
  readStateFromUrl,
  stateToQuery,
  writeStateToUrl,
} from "./url-sync.js";

describe("P6 group 2 batch 1 helpers (Preact leg)", () => {
  it("advancedPivotData builds pivot view with subtotals, heat and sparkline, and falls back safely", () => {
    const model: DataModel = {
      dimensions: [
        { id: "country", label: "Country", type: "discrete" },
        { id: "category", label: "Category", type: "discrete" },
        { id: "month", label: "Month", type: "discrete" },
      ],
      measures: [{ id: "revenue", label: "Revenue", aggregation: "sum" }],
    };
    const rows: Row[] = [
      { country: "FR", category: "A", month: "Jan", revenue: 100 },
      { country: "FR", category: "B", month: "Feb", revenue: 50 },
      { country: "US", category: "A", month: "Jan", revenue: 200 },
    ];
    const view = buildAdvancedPivotView(model, rows, {
      rows: ["country", "category"],
      measures: ["revenue"],
      includeSubtotals: true,
      heatmap: true,
      sparklineDimension: "month",
    });
    expect(view.columns.length).toBeGreaterThanOrEqual(3);
    expect(view.rows.some((r) => r.__kind === "subtotal" && String(r["row:country"]).includes("FR subtotal"))).toBe(true);
    expect(buildAdvancedPivotView(model, rows, { rows: ["missing"], measures: ["revenue"] })).toEqual({ columns: [], rows: [] });
  });

  it("analyticsDsData builds forecast line data and k-means cluster scatter data", () => {
    const model: DataModel = {
      dimensions: [{ id: "x", label: "X", type: "continuous" }],
      measures: [{ id: "y", label: "Y", aggregation: "sum" }],
    };
    const rows: Row[] = [
      { x: 1, y: 10 },
      { x: 2, y: 20 },
      { x: 3, y: 30 },
      { x: 4, y: 40 },
    ];
    const forecast = buildForecastLineData(model, rows, { x: "x", y: "y", periods: 2 });
    expect(forecast).toHaveLength(6);
    expect(forecast.filter((p) => p.forecast)).toHaveLength(2);

    const clusters = buildClusterScatterData(model, rows, { fields: ["x", "y"], k: 2 });
    expect(clusters.data).toHaveLength(4);
    expect(clusters.centroids).toHaveLength(2);
    expect(clusters.xLabel).toBe("x");
    expect(clusters.yLabel).toBe("y");
  });

  it("chart-export serialises SVG, resolves targets and guards browser-only paths in jsdom", async () => {
    const SVG_NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", "120");
    svg.setAttribute("height", "60");

    const xml = serializeSvg(svg, { inlineStyles: false, background: "#ffffff" });
    expect(xml).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(xml).toContain('viewBox="0 0 120 60"');
    expect(xml).toContain('fill="#ffffff"');
    expect(svgStringToBlob(xml)).toBeInstanceOf(Blob);

    const wrap = document.createElement("div");
    wrap.appendChild(svg);
    expect(resolveSvg(svg)).toBe(svg);
    expect(resolveSvg(wrap)).toBe(svg);
    expect(resolveSvg(null)).toBeNull();

    expect(await svgStringToPngBlob(xml)).toBeNull();
    expect(await downloadPng(svg, "chart.png", { inlineStyles: false })).toBe(false);
    const bare = document.createElementNS(SVG_NS, "svg") as SVGElement;
    expect(await downloadPdf(bare, "chart.pdf")).toBe(false);
    expect(() => downloadBlob(new Blob(["ok"]), "x.txt")).not.toThrow();
    expect(() => downloadSvg(svg, "chart.svg", { inlineStyles: false })).not.toThrow();
    expect(() => printElement(svg)).not.toThrow();
  });

  it("geoMapLayers builds all seven layer descriptors and joins class names", () => {
    expect(mapClass("st-geoMap", "extra")).toBe("st-geoMap extra");
    expect(mapClass("st-geoMap")).toBe("st-geoMap");

    const poly = {
      type: "Polygon",
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
    } as const;
    const model: DataModel = {
      dimensions: [
        { id: "region", label: "Region", type: "discrete" },
        { id: "geom", label: "Geometry", type: "discrete" },
        { id: "lat", label: "Lat", type: "continuous" },
        { id: "lon", label: "Lon", type: "continuous" },
        { id: "lat2", label: "Lat2", type: "continuous" },
        { id: "lon2", label: "Lon2", type: "continuous" },
      ],
      measures: [{ id: "sales", label: "Sales", aggregation: "sum" }],
    };
    const rows = [
      { region: "FR", geom: poly, lat: 48.8, lon: 2.3, lat2: 45.7, lon2: 4.8, sales: 120 },
      { region: "FR", geom: poly, lat: 43.3, lon: 5.4, lat2: 48.8, lon2: 2.3, sales: 80 },
    ] as unknown as Row[];
    const store = createDashboardStore({ model, data: rows });

    expect(pointsLayer(store, "v", { latitude: "lat", longitude: "lon", value: "sales" }).type).toBe("points");
    const choro = choroplethLayer(store, "v", { region: "region", measure: "sales", geometry: "geom" });
    expect(choro.type).toBe("choropleth");
    expect(flowLayer(store, "v", { sourceLatitude: "lat", sourceLongitude: "lon", targetLatitude: "lat2", targetLongitude: "lon2", value: "sales" }).type).toBe("flow");
    expect(hexbinLayer(store, "v", { latitude: "lat", longitude: "lon", cellSize: 20 }).type).toBe("hexbin");
    expect(clusterLayer(store, "v", { latitude: "lat", longitude: "lon", radius: 15 }).type).toBe("cluster");
    expect(densityLayer(store, "v", { latitude: "lat", longitude: "lon" }).type).toBe("density");
    expect(geojsonLayer(store, "v", { geometry: "geom", id: "region" }).type).toBe("geojson");
  });

  it("url-sync round-trips dashboard state through query string and history", () => {
    window.history.replaceState(null, "", "/");
    const model: DataModel = {
      dimensions: [{ id: "country", label: "Country", type: "discrete" }],
      measures: [{ id: "sales", label: "Sales", aggregation: "sum" }],
    };
    const store = createDashboardStore({ model, data: [{ country: "FR", sales: 10 }] });
    const sample: DashboardState = {
      filters: { country: { kind: "include", values: ["FR"] } },
      selections: { bar: ["FR"] },
      drill: {},
    };
    const query = stateToQuery(sample);
    expect(query).toContain(`${DEFAULT_URL_SYNC_PARAM}=`);
    expect(queryToState(query, { model })).toEqual(sample);

    applyStateToStore(store, sample);
    expect(store.getState()).toEqual(sample);

    const written = writeStateToUrl(sample);
    expect(written).toContain(`${DEFAULT_URL_SYNC_PARAM}=`);
    expect(readLocationSearch()).toContain(`${DEFAULT_URL_SYNC_PARAM}=`);
    expect(readStateFromUrl(store)).toEqual(sample);

    writeStateToUrl({});
    expect(readLocationSearch()).toBe("");
  });
});
