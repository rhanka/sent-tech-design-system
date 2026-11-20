import { cleanup, render, screen, waitFor } from "@testing-library/preact";
import { createDashboardStore, type DataModel, type Row } from "@sentropic/dataviz-core";
import { afterEach, describe, expect, it } from "vitest";
import { buildFieldPaneTree, drillDepth, drillLevel, onDrillSelect, useDashboard } from "./index.js";
import {
  buildSafeCategoricalSeries,
  buildSimpleCategoricalSeries,
  measureInputId,
  toSimpleCategoricalData,
  toSimpleCategoricalPoints,
  toStackedCategoricalData,
} from "./lib/categoricalData.js";
import {
  buildBoxPlotData,
  buildBulletData,
  buildCalendarHeatmapData,
  buildGaugeData,
  buildHeatmapData,
  buildHistogramData,
} from "./lib/distributionData.js";
import {
  buildSafeFlowModel,
  buildSafeMekkoModel,
  buildSafePackedBubbleModel,
  buildSafePartWholeHierarchy,
  buildSafePartWholeModel,
  buildSafeRadarModel,
  buildSafeRoseModel,
  buildSafeWaterfallModel,
  toFlowData,
  toHierarchyDatum,
  toMarimekkoData,
  toPackedBubbleData,
  toPartWholeData,
  toRadarAxes,
  toRadarSeries,
  toRoseData,
  toTreemapData,
  toWaterfallData,
} from "./lib/partOfWholeData.js";

afterEach(cleanup);

const model: DataModel = {
  dimensions: [
    { id: "country", label: "Country", type: "discrete" },
    { id: "city", label: "City", type: "discrete" },
    { id: "channel", label: "Channel", type: "discrete" },
    { id: "date", label: "Date", type: "discrete" },
  ],
  measures: [
    { id: "revenue", label: "Revenue", aggregation: "sum" },
    { id: "cost", label: "Cost", aggregation: "sum" },
  ],
};

const rows: Row[] = [
  { country: "FR", city: "Paris", channel: "Direct", date: "2026-01-01", revenue: 10, cost: 4 },
  { country: "FR", city: "Lyon", channel: "Partner", date: "2026-01-02", revenue: 5, cost: 2 },
  { country: "US", city: "NYC", channel: "Direct", date: "2026-01-01", revenue: 20, cost: 8 },
];

describe("useDashboard (Preact leg)", () => {
  it("returns snapshot, reacts to store mutations, supports selectors with Object.is bailout and unsubscribes", async () => {
    const store = createDashboardStore({ model, data: rows });
    let selectorRenders = 0;

    function FullReader() {
      const state = useDashboard(store);
      return <output data-testid="full">{JSON.stringify(state.filters)}</output>;
    }

    function SelectorReader() {
      selectorRenders += 1;
      const count = useDashboard(store, (s) => Object.keys(s.filters).length);
      return <output data-testid="count">{count}</output>;
    }

    const { unmount } = render(
      <>
        <FullReader />
        <SelectorReader />
      </>,
    );

    expect(screen.getByTestId("full").textContent).toBe("{}");
    expect(screen.getByTestId("count").textContent).toBe("0");

    const settledRenders = selectorRenders;
    store.toggleSelection("chart", "FR");
    await new Promise((r) => setTimeout(r, 15));
    expect(selectorRenders).toBe(settledRenders);

    store.setFilter("country", { kind: "include", values: ["FR"] });
    await waitFor(() => {
      expect(screen.getByTestId("count").textContent).toBe("1");
      expect(screen.getByTestId("full").textContent).toContain('"FR"');
    });

    unmount();
    store.setFilter("country", { kind: "include", values: ["US"] });
    expect(buildFieldPaneTree(model).nodes.map((n) => n.id)).toEqual(["group:dimensions", "group:measures"]);
  });
});

describe("shared dataviz derivation & drill helpers (Preact leg)", () => {
  it("drill engine resolves levels, advances drill, and falls back to selection at leaf", () => {
    const store = createDashboardStore({ model, data: rows });
    const hierarchy = ["country", "city"];
    expect(drillDepth(store, "v", hierarchy)).toBe(0);

    const top = drillLevel(store, "v", hierarchy, "revenue");
    expect(top).toEqual({
      dimension: "country",
      level: 0,
      canDrill: true,
      data: [
        { key: "FR", value: 15 },
        { key: "US", value: 20 },
      ],
    });

    onDrillSelect(store, "v", hierarchy, "FR");
    expect(drillDepth(store, "v", hierarchy)).toBe(1);
    const leaf = drillLevel(store, "v", hierarchy, "revenue");
    expect(leaf.canDrill).toBe(false);
    expect(leaf.dimension).toBe("city");
    expect(leaf.data).toEqual([
      { key: "Paris", value: 10 },
      { key: "Lyon", value: 5 },
    ]);

    onDrillSelect(store, "v", hierarchy, "Paris");
    expect(store.getState().selections.v).toEqual(["Paris"]);
  });

  it("categoricalData builds safe/simple/stacked series and returns empty on unknown fields", () => {
    expect(measureInputId("revenue")).toBe("revenue");
    expect(measureInputId({ id: "revenue", mark: "line" })).toBe("revenue");

    const simple = buildSimpleCategoricalSeries(model, rows, "country", "revenue");
    expect(toSimpleCategoricalData(simple)).toEqual([
      { label: "FR", value: 15 },
      { label: "US", value: 20 },
    ]);
    expect(toSimpleCategoricalPoints(simple)).toEqual([
      { x: "FR", y: 15 },
      { x: "US", y: 20 },
    ]);

    const stacked = buildSafeCategoricalSeries(model, rows, {
      category: "country",
      series: "channel",
      measures: ["revenue"],
      mode: "stacked",
    });
    expect(toStackedCategoricalData(stacked)).toHaveLength(2);
    expect(buildSafeCategoricalSeries(model, rows, { category: "missing", measures: ["revenue"] }).categories).toEqual([]);
  });

  it("partOfWholeData builds safe models and transforms data consistently", () => {
    const pw = buildSafePartWholeModel(model, rows, { category: "country", measure: "revenue" });
    expect(toPartWholeData(pw.items)).toHaveLength(2);
    expect(buildSafePartWholeModel(model, rows, { category: "nope", measure: "revenue" }).items).toEqual([]);

    const hier = buildSafePartWholeHierarchy(model, rows, { hierarchy: ["country", "city"], measure: "revenue" });
    expect(toHierarchyDatum(hier).children?.length).toBe(2);
    expect(toTreemapData(hier)).toHaveLength(2);

    const wf = buildSafeWaterfallModel(model, rows, { category: "country", measure: "revenue" });
    expect(toWaterfallData(wf).length).toBeGreaterThan(0);

    const flow = buildSafeFlowModel(model, rows, { source: "country", target: "channel", measure: "revenue" });
    expect(toFlowData(flow).data.length).toBeGreaterThan(0);

    const mekko = buildSafeMekkoModel(model, rows, { category: "country", series: "channel", measure: "revenue" });
    expect(toMarimekkoData(mekko)).toHaveLength(2);

    const pb = buildSafePackedBubbleModel(model, rows, { category: "country", measure: "revenue" });
    expect(toPackedBubbleData(pb)).toHaveLength(2);

    const radar = buildSafeRadarModel(model, rows, { axes: ["revenue", "cost"], series: "country" });
    expect(toRadarAxes(radar)).toHaveLength(2);
    expect(toRadarSeries(radar)).toHaveLength(2);

    const rose = buildSafeRoseModel(model, rows, { category: "country", measure: "revenue" });
    expect(toRoseData(rose)).toHaveLength(2);
  });

  it("distributionData derives histogram, box plot, heatmap, calendar heatmap, bullet and gauge data safely", () => {
    expect(buildHistogramData(model, rows, { value: "revenue", bins: 3 }).length).toBeGreaterThan(0);
    expect(buildHistogramData(model, rows, { value: "missing" })).toEqual([]);
    expect(buildBoxPlotData(model, rows, { group: "country", value: "revenue" })).toHaveLength(2);
    expect(buildHeatmapData(model, rows, { x: "country", y: "channel", measure: "revenue" }).length).toBeGreaterThan(0);
    expect(buildCalendarHeatmapData(model, rows, "date", "revenue")).toHaveLength(2);
    expect(buildCalendarHeatmapData(model, rows, "missing", "revenue")).toEqual([]);
    expect(buildBulletData(model, rows, { category: "country", value: "revenue", target: "cost" })).toHaveLength(2);
    expect(buildGaugeData(model, rows, { value: "revenue" }).value).toBe(35);
    expect(buildGaugeData(model, rows, { value: "missing" }).value).toBe(0);
  });
});
