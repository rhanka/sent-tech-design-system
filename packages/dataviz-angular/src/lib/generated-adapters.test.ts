import '@angular/compiler';
import { Component, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type Cell, type DataModel, type Row } from '@sentropic/dataviz-core';
import { ArcDiagramChart } from '../../dist/lib/ArcDiagramChart.js';
import { BellCurveChart } from '../../dist/lib/BellCurveChart.js';
import { BumpChart } from '../../dist/lib/BumpChart.js';
import { ColumnPyramidChart } from '../../dist/lib/ColumnPyramidChart.js';
import { ContourChart } from '../../dist/lib/ContourChart.js';
import { DecompositionTreeChart } from '../../dist/lib/DecompositionTreeChart.js';
import { Density2DChart } from '../../dist/lib/Density2DChart.js';
import { DependencyWheelChart } from '../../dist/lib/DependencyWheelChart.js';
import { FlamegraphChart } from '../../dist/lib/FlamegraphChart.js';
import { FunnelChart } from '../../dist/lib/FunnelChart.js';
import { GanttChart } from '../../dist/lib/GanttChart.js';
import { GaugeChart } from '../../dist/lib/GaugeChart.js';
import { MekkoChart } from '../../dist/lib/MekkoChart.js';
import { OrganizationChart } from '../../dist/lib/OrganizationChart.js';
import { SankeyChart } from '../../dist/lib/SankeyChart.js';
import { SolidGaugeChart } from '../../dist/lib/SolidGaugeChart.js';
import { StateTimelineChart } from '../../dist/lib/StateTimelineChart.js';
import { StatusHistoryChart } from '../../dist/lib/StatusHistoryChart.js';
import { StreamgraphChart } from '../../dist/lib/StreamgraphChart.js';
import { TimelineChart } from '../../dist/lib/TimelineChart.js';
import { TreegraphChart } from '../../dist/lib/TreegraphChart.js';
import { VariablePieChart } from '../../dist/lib/VariablePieChart.js';
import { ViolinChart } from '../../dist/lib/ViolinChart.js';
import { WaffleChart } from '../../dist/lib/WaffleChart.js';
import { WaterfallChart } from '../../dist/lib/WaterfallChart.js';
import { AreaRangeChart } from '../../dist/lib/AreaRangeChart.js';
import { AreaSplineRangeChart } from '../../dist/lib/AreaSplineRangeChart.js';
import { CandlestickChart } from '../../dist/lib/CandlestickChart.js';
import { ChoroplethMap } from '../../dist/lib/ChoroplethMap.js';
import { ColumnRangeChart } from '../../dist/lib/ColumnRangeChart.js';
import { DumbbellChart } from '../../dist/lib/DumbbellChart.js';
import { GeoClusterMap } from '../../dist/lib/GeoClusterMap.js';
import { GeoDensityMap } from '../../dist/lib/GeoDensityMap.js';
import { GeoFlowMap } from '../../dist/lib/GeoFlowMap.js';
import { GeoHexbinMap } from '../../dist/lib/GeoHexbinMap.js';
import { GeoJsonMap } from '../../dist/lib/GeoJsonMap.js';
import { GeoPointMap } from '../../dist/lib/GeoPointMap.js';
import { HLCChart } from '../../dist/lib/HLCChart.js';
import { HeikinAshiChart } from '../../dist/lib/HeikinAshiChart.js';
import { HollowCandlestickChart } from '../../dist/lib/HollowCandlestickChart.js';
import { OHLCChart } from '../../dist/lib/OHLCChart.js';
import { PackedBubbleChart } from '../../dist/lib/PackedBubbleChart.js';
import { RenkoChart } from '../../dist/lib/RenkoChart.js';
import { RoseChart } from '../../dist/lib/RoseChart.js';
import { SunburstChart } from '../../dist/lib/SunburstChart.js';
import { AnalyticsClusterPlot } from '../../dist/lib/AnalyticsClusterPlot.js';
import { AnomalySwimLaneChart } from '../../dist/lib/AnomalySwimLaneChart.js';
import { BoxPlotChart } from '../../dist/lib/BoxPlotChart.js';
import { BulletChart } from '../../dist/lib/BulletChart.js';
import { CorrelationMatrix } from '../../dist/lib/CorrelationMatrix.js';
import { EventFeedPanel } from '../../dist/lib/EventFeedPanel.js';
import { ForceGraph } from '../../dist/lib/ForceGraph.js';
import { ForecastLineChart } from '../../dist/lib/ForecastLineChart.js';
import { HistogramChart } from '../../dist/lib/HistogramChart.js';
import { ItemChart } from '../../dist/lib/ItemChart.js';
import { ParallelCoordinatesChart } from '../../dist/lib/ParallelCoordinatesChart.js';
import { PointAndFigureChart } from '../../dist/lib/PointAndFigureChart.js';
import { PolygonChart } from '../../dist/lib/PolygonChart.js';
import { RibbonChart } from '../../dist/lib/RibbonChart.js';
import { TileMapChart } from '../../dist/lib/TileMapChart.js';
import { TraceWaterfallChart } from '../../dist/lib/TraceWaterfallChart.js';
import { VectorFieldChart } from '../../dist/lib/VectorFieldChart.js';
import { WindBarbChart } from '../../dist/lib/WindBarbChart.js';
import { WordCloudChart } from '../../dist/lib/WordCloudChart.js';
import { CalendarHeatmapChart } from '../../dist/lib/CalendarHeatmapChart.js';
import { ChordChart } from '../../dist/lib/ChordChart.js';
import { DivergingBarChart } from '../../dist/lib/DivergingBarChart.js';
import { LollipopChart } from '../../dist/lib/LollipopChart.js';
import { ParetoChart } from '../../dist/lib/ParetoChart.js';
import { StepLineChart } from '../../dist/lib/StepLineChart.js';
import { ComboChart } from '../../dist/lib/ComboChart.js';
import { ErrorBarsChart } from '../../dist/lib/ErrorBarsChart.js';
import { PercentileBandChart } from '../../dist/lib/PercentileBandChart.js';
import { ReferenceLineChart } from '../../dist/lib/ReferenceLineChart.js';
import { TrendLineChart } from '../../dist/lib/TrendLineChart.js';
import { CrossfilteredBarChart } from '../../dist/lib/CrossfilteredBarChart.js';
import { DrillBarChart } from '../../dist/lib/DrillBarChart.js';

/**
 * One table for every adapter that is pure store-to-builder-to-DS wiring —
 * whether tools/dataviz-angular-port emitted it or a lot hand-wrote it because the
 * tool refused its shape (lot 5). The file name is historical; what the table
 * requires is the shape, not the author.
 * They differ only in which builder feeds which design-system component, so the
 * assertions are the same for all of them and the expectations are data:
 *
 *  - the design-system component really rendered (its `data-st-component` marker);
 *  - the caller's `class` reaches the DS root, next to the adapter's own class;
 *  - the accessible value list carries the shared `Data values for <label>` label
 *    and exactly the values the adapter derived;
 *  - a selection made in ANOTHER cross-filter view changes what is rendered,
 *    which is what proves the store subscription and the memoised recompute are
 *    wired (a broken subscription leaves the first render in place).
 */

// `buildGeoJsonLayerModel` reads a geometry OBJECT from the cell, not a JSON string.
const geo = (lon: number, lat: number) =>
  ({
    type: 'Polygon',
    coordinates: [[[lon, lat], [lon + 1, lat], [lon + 1, lat + 1], [lon, lat]]],
  }) as unknown as Cell;

const DAY = 86_400_000;
const T0 = Date.UTC(2026, 0, 1);

const model: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'shape', label: 'Shape', type: 'discrete' },
    { id: 'ts', label: 'Timestamp', type: 'continuous' },
    { id: 'day', label: 'Day', type: 'discrete' },
    { id: 'lat', label: 'Latitude', type: 'continuous' },
    { id: 'lon', label: 'Longitude', type: 'continuous' },
    { id: 'dstLat', label: 'Target latitude', type: 'continuous' },
    { id: 'dstLon', label: 'Target longitude', type: 'continuous' },
  ],
  measures: [
    { id: 'amount', label: 'Amount', aggregation: 'sum' },
    { id: 'open', label: 'Open', aggregation: 'avg' },
    { id: 'high', label: 'High', aggregation: 'max' },
    { id: 'low', label: 'Low', aggregation: 'min' },
    { id: 'close', label: 'Close', aggregation: 'avg' },
  ],
};

const rows: Row[] = [
  { service: 'checkout', region: 'eu', shape: geo(2, 48), day: '2026-01-01', ts: T0, lat: 48.85, lon: 2.35, dstLat: 51.5, dstLon: -0.12, amount: 10, open: 100, high: 110, low: 95, close: 105 },
  { service: 'checkout', region: 'us', shape: geo(-74, 40), day: '2026-01-02', ts: T0 + DAY, lat: 40.71, lon: -74.0, dstLat: 34.05, dstLon: -118.24, amount: 5, open: 105, high: 112, low: 101, close: 102 },
  { service: 'billing', region: 'eu', shape: geo(13, 52), day: '2026-01-03', ts: T0 + 2 * DAY, lat: 52.52, lon: 13.4, dstLat: 41.9, dstLon: 12.5, amount: 7, open: 102, high: 108, low: 99, close: 107 },
];

type Items = string[] | { count: number; first: string; last: string };

type Case = {
  family: string;
  name: string;
  component: Type<unknown>;
  ds: string;
  ownClass?: string;
  template: string;
  /**
   * Defaults to the shared `Data values for <label>`; BellCurveChart appends its
   * stats, and `null` states that the DS component renders no value list at all
   * (EventFeedPanel, ForceGraph) — those cases assert their datum elements instead.
   */
  listAria?: string | null;
  items: Items;
  after: Items;
  mark?: [string, number, number];
};

const cases: Case[] = [
  {
    family: "geo maps on the DS GeoChart",
    name: "ChoroplethMap",
    component: ChoroplethMap,
    ds: "GeoChart",
    ownClass: "st-choroplethMap",
    template: `<st-dataviz-choropleth-map [store]="store" viewId="v" region="region" measure="amount" geometry="shape" label="L" class="probe"></st-dataviz-choropleth-map>`,
    items: ["L: 2 régions", "eu: 17", "us: 5"],
    after: ["L: 1 régions", "eu: 7"],
    mark: [".st-geoMap__region", 2, 1],
  },
  {
    family: "geo maps on the DS GeoChart",
    name: "GeoClusterMap",
    component: GeoClusterMap,
    ds: "GeoChart",
    ownClass: "st-geoClusterMap",
    template: `<st-dataviz-geo-cluster-map [store]="store" viewId="v" latitude="lat" longitude="lon" label="L" class="probe"></st-dataviz-geo-cluster-map>`,
    items: ["L: 3", "cluster:0: 1", "cluster:1: 1", "cluster:2: 1"],
    after: ["L: 1", "cluster:0: 1"],
    mark: [".st-geoMap__cluster", 3, 1],
  },
  {
    family: "geo maps on the DS GeoChart",
    name: "GeoDensityMap",
    component: GeoDensityMap,
    ds: "GeoChart",
    ownClass: "st-geoDensityMap",
    template: `<st-dataviz-geo-density-map [store]="store" viewId="v" latitude="lat" longitude="lon" label="L" class="probe"></st-dataviz-geo-density-map>`,
    items: ["L: 3 points", "(48.85, 2.35): 1", "(40.71, -74): 1", "(52.52, 13.4): 1"],
    after: ["L: 1 points", "(52.52, 13.4): 1"],
    mark: [".st-geoMap__density", 3, 1],
  },
  {
    family: "geo maps on the DS GeoChart",
    name: "GeoFlowMap",
    component: GeoFlowMap,
    ds: "GeoChart",
    ownClass: "st-geoFlowMap",
    template: `<st-dataviz-geo-flow-map [store]="store" viewId="v" sourceLatitude="lat" sourceLongitude="lon" targetLatitude="dstLat" targetLongitude="dstLon" label="L" class="probe"></st-dataviz-geo-flow-map>`,
    items: ["L: 3", "1 flows: 1", "1 flows: 1", "1 flows: 1"],
    after: ["L: 1", "1 flows: 1"],
    mark: [".st-geoMap__flow", 3, 1],
  },
  {
    family: "geo maps on the DS GeoChart",
    name: "GeoHexbinMap",
    component: GeoHexbinMap,
    ds: "GeoChart",
    ownClass: "st-geoHexbinMap",
    template: `<st-dataviz-geo-hexbin-map [store]="store" viewId="v" latitude="lat" longitude="lon" label="L" class="probe"></st-dataviz-geo-hexbin-map>`,
    items: ["L: 3 alvéoles", "2:56: 1", "-74:47: 1", "13:60: 1"],
    after: ["L: 1 alvéoles", "13:60: 1"],
    mark: [".st-geoMap__hexbin", 3, 1],
  },
  {
    family: "geo maps on the DS GeoChart",
    name: "GeoJsonMap",
    component: GeoJsonMap,
    ds: "GeoChart",
    ownClass: "st-geoJsonMap",
    template: `<st-dataviz-geo-json-map [store]="store" viewId="v" geometry="shape" label="L" class="probe"></st-dataviz-geo-json-map>`,
    items: ["L: 3 entités", "0", "1", "2"],
    after: ["L: 1 entités", "0"],
    mark: [".st-geoMap__feature", 3, 1],
  },
  {
    family: "geo maps on the DS GeoChart",
    name: "GeoPointMap",
    component: GeoPointMap,
    ds: "GeoChart",
    ownClass: "st-geoPointMap",
    template: `<st-dataviz-geo-point-map [store]="store" viewId="v" latitude="lat" longitude="lon" label="L" class="probe"></st-dataviz-geo-point-map>`,
    items: ["L: 3", "0", "1", "2"],
    after: ["L: 1", "0"],
    mark: [".st-geoMap__point", 3, 1],
  },
  {
    family: "OHLC-family charts",
    name: "CandlestickChart",
    component: CandlestickChart,
    ds: "CandlestickChart",
    template: `<st-dataviz-candlestick-chart [store]="store" viewId="v" label_field="region" open="open" high="high" low="low" close="close" label="L" class="probe"></st-dataviz-candlestick-chart>`,
    items: ["eu: O 100 H 110 L 95 C 105", "us: O 105 H 112 L 101 C 102", "eu: O 102 H 108 L 99 C 107"],
    after: ["eu: O 102 H 108 L 99 C 107"],
  },
  {
    family: "OHLC-family charts",
    name: "HeikinAshiChart",
    component: HeikinAshiChart,
    ds: "HeikinAshiChart",
    template: `<st-dataviz-heikin-ashi-chart [store]="store" viewId="v" label_field="region" open="open" high="high" low="low" close="close" label="L" class="probe"></st-dataviz-heikin-ashi-chart>`,
    items: ["eu: O 102.50 H 110 L 95 C 102.50", "us: O 102.50 H 112 L 101 C 105", "eu: O 103.75 H 108 L 99 C 104"],
    after: ["eu: O 104.50 H 108 L 99 C 104"],
  },
  {
    family: "OHLC-family charts",
    name: "HollowCandlestickChart",
    component: HollowCandlestickChart,
    ds: "HollowCandlestickChart",
    template: `<st-dataviz-hollow-candlestick-chart [store]="store" viewId="v" label_field="region" open="open" high="high" low="low" close="close" label="L" class="probe"></st-dataviz-hollow-candlestick-chart>`,
    items: ["eu: O 100 H 110 L 95 C 105", "us: O 105 H 112 L 101 C 102", "eu: O 102 H 108 L 99 C 107"],
    after: ["eu: O 102 H 108 L 99 C 107"],
  },
  {
    family: "OHLC-family charts",
    name: "OHLCChart",
    component: OHLCChart,
    ds: "OHLCChart",
    template: `<st-dataviz-ohlc-chart [store]="store" viewId="v" label_field="region" open="open" high="high" low="low" close="close" label="L" class="probe"></st-dataviz-ohlc-chart>`,
    items: ["eu: O 100 H 110 L 95 C 105", "us: O 105 H 112 L 101 C 102", "eu: O 102 H 108 L 99 C 107"],
    after: ["eu: O 102 H 108 L 99 C 107"],
  },
  {
    family: "OHLC-family charts",
    name: "HLCChart",
    component: HLCChart,
    ds: "HLCChart",
    template: `<st-dataviz-hlc-chart [store]="store" viewId="v" label_field="region" high="high" low="low" close="close" label="L" class="probe"></st-dataviz-hlc-chart>`,
    items: ["eu: H 110 L 95 C 105", "us: H 112 L 101 C 102", "eu: H 108 L 99 C 107"],
    after: ["eu: H 108 L 99 C 107"],
  },
  {
    family: "OHLC-family charts",
    name: "RenkoChart",
    component: RenkoChart,
    ds: "RenkoChart",
    template: `<st-dataviz-renko-chart [store]="store" viewId="v" date="ts" close="close" label="L" class="probe"></st-dataviz-renko-chart>`,
    items: { count: 31, first: '▼ 104.8 → 105', last: '▲ 106.8 → 107' },
    after: [],
  },
  {
    family: "range charts",
    name: "AreaRangeChart",
    component: AreaRangeChart,
    ds: "AreaRangeChart",
    template: `<st-dataviz-area-range-chart [store]="store" viewId="v" x_field="region" low="low" high="high" label="L" class="probe"></st-dataviz-area-range-chart>`,
    items: ["eu: 95 – 110", "us: 101 – 112", "eu: 99 – 108"],
    after: ["eu: 99 – 108"],
  },
  {
    family: "range charts",
    name: "AreaSplineRangeChart",
    component: AreaSplineRangeChart,
    ds: "AreaSplineRangeChart",
    template: `<st-dataviz-area-spline-range-chart [store]="store" viewId="v" x_field="region" low="low" high="high" label="L" class="probe"></st-dataviz-area-spline-range-chart>`,
    items: ["eu: 95 – 110", "us: 101 – 112", "eu: 99 – 108"],
    after: ["eu: 99 – 108"],
  },
  {
    family: "range charts",
    name: "ColumnRangeChart",
    component: ColumnRangeChart,
    ds: "ColumnRangeChart",
    template: `<st-dataviz-column-range-chart [store]="store" viewId="v" category="region" low="low" high="high" label="L" class="probe"></st-dataviz-column-range-chart>`,
    items: ["eu: 95 – 110", "us: 101 – 112", "eu: 99 – 108"],
    after: ["eu: 99 – 108"],
  },
  {
    family: "range charts",
    name: "DumbbellChart",
    component: DumbbellChart,
    ds: "DumbbellChart",
    template: `<st-dataviz-dumbbell-chart [store]="store" viewId="v" category="region" low="low" high="high" label="L" class="probe"></st-dataviz-dumbbell-chart>`,
    items: ["eu: 95 – 110", "us: 101 – 112", "eu: 99 – 108"],
    after: ["eu: 99 – 108"],
  },
  {
    family: "part-of-whole charts",
    name: "RoseChart",
    component: RoseChart,
    ds: "RoseChart",
    template: `<st-dataviz-rose-chart [store]="store" viewId="v" category="region" measure="amount" label="L" class="probe"></st-dataviz-rose-chart>`,
    items: ["eu: 17", "us: 5"],
    after: ["eu: 7"],
    mark: [".st-roseChart__sector", 2, 1],
  },
  {
    family: "part-of-whole charts",
    name: "SunburstChart",
    component: SunburstChart,
    ds: "SunburstChart",
    template: `<st-dataviz-sunburst-chart [store]="store" viewId="v" [hierarchy]="hierarchy" measure="amount" label="L" class="probe"></st-dataviz-sunburst-chart>`,
    items: ["Total, eu, checkout: 10", "Total, eu, billing: 7", "Total, us, checkout: 5"],
    after: ["Total, eu, billing: 7"],
    mark: [".st-sunburstChart__arc", 5, 2],
  },
  {
    family: "part-of-whole charts",
    name: "PackedBubbleChart",
    component: PackedBubbleChart,
    ds: "PackedBubblesChart",
    template: `<st-dataviz-packed-bubble-chart [store]="store" viewId="v" category="region" measure="amount" label="L" class="probe"></st-dataviz-packed-bubble-chart>`,
    items: ["eu: 17", "us: 5"],
    after: ["eu: 7"],
    mark: [".st-packedBubblesChart__bubble", 2, 1],
  },
  {
    family: "part-of-whole and flow charts",
    name: "FunnelChart",
    component: FunnelChart,
    ds: "FunnelChart",
    template: `<st-dataviz-funnel-chart [store]="store" viewId="v" category="region" measure="amount" label="L" class="probe"></st-dataviz-funnel-chart>`,
    items: ["eu: 17 (100%)", "us: 5 (29.4%)"],
    after: ["eu: 7 (100%)"],
  },
  {
    family: "part-of-whole and flow charts",
    name: "MekkoChart",
    component: MekkoChart,
    ds: "MarimekkoChart",
    template: `<st-dataviz-mekko-chart [store]="store" viewId="v" category="region" series="service" measure="amount" label="L" class="probe"></st-dataviz-mekko-chart>`,
    items: ["eu, checkout: 59% (colonne 77%)", "eu, billing: 41% (colonne 77%)", "us, checkout: 100% (colonne 23%)"],
    after: ["eu, billing: 100% (colonne 100%)"],
  },
  {
    family: "part-of-whole and flow charts",
    name: "SankeyChart",
    component: SankeyChart,
    ds: "SankeyChart",
    template: `<st-dataviz-sankey-chart [store]="store" viewId="v" source="region" target="service" measure="amount" label="L" class="probe"></st-dataviz-sankey-chart>`,
    items: ["eu -> checkout: 10", "us -> checkout: 5", "eu -> billing: 7"],
    after: ["eu -> billing: 7"],
  },
  {
    family: "part-of-whole and flow charts",
    name: "WaffleChart",
    component: WaffleChart,
    ds: "WaffleChart",
    template: `<st-dataviz-waffle-chart [store]="store" viewId="v" label_field="region" value="amount" label="L" class="probe"></st-dataviz-waffle-chart>`,
    items: ["eu: 10 (45%)", "us: 5 (23%)", "eu: 7 (32%)"],
    after: ["eu: 7 (100%)"],
  },
  {
    family: "part-of-whole and flow charts",
    name: "WaterfallChart",
    component: WaterfallChart,
    ds: "WaterfallChart",
    template: `<st-dataviz-waterfall-chart [store]="store" viewId="v" category="region" measure="amount" label="L" class="probe"></st-dataviz-waterfall-chart>`,
    items: ["eu: 17", "us: 5", "Total: 22"],
    after: ["eu: 7", "Total: 7"],
  },
  {
    family: "part-of-whole and flow charts",
    name: "VariablePieChart",
    component: VariablePieChart,
    ds: "VariablePieChart",
    template: `<st-dataviz-variable-pie-chart [store]="store" viewId="v" label_field="region" value="amount" z="close" label="L" class="probe"></st-dataviz-variable-pie-chart>`,
    items: ["eu: 10", "us: 5", "eu: 7"],
    after: ["eu: 7"],
  },
  {
    family: "part-of-whole and flow charts",
    name: "ColumnPyramidChart",
    component: ColumnPyramidChart,
    ds: "ColumnPyramidChart",
    template: `<st-dataviz-column-pyramid-chart [store]="store" viewId="v" category="region" value="amount" label="L" class="probe"></st-dataviz-column-pyramid-chart>`,
    items: ["eu: 10", "us: 5", "eu: 7"],
    after: ["eu: 7"],
  },
  {
    family: "hierarchy and relation charts",
    name: "TreegraphChart",
    component: TreegraphChart,
    ds: "TreegraphChart",
    template: `<st-dataviz-treegraph-chart [store]="store" viewId="v" id_field="region" parent_field="service" label_field="service" label="L" class="probe"></st-dataviz-treegraph-chart>`,
    items: ["checkout (eu)", "checkout (us)"],
    after: ["billing (eu)"],
  },
  {
    family: "hierarchy and relation charts",
    name: "OrganizationChart",
    component: OrganizationChart,
    ds: "OrganizationChart",
    template: `<st-dataviz-organization-chart [store]="store" viewId="v" id_field="region" parent_field="service" label_field="service" label="L" class="probe"></st-dataviz-organization-chart>`,
    items: ["checkout (eu)", "checkout (us)"],
    after: ["billing (eu)"],
  },
  {
    family: "hierarchy and relation charts",
    name: "DecompositionTreeChart",
    component: DecompositionTreeChart,
    ds: "DecompositionTreeChart",
    template: `<st-dataviz-decomposition-tree-chart [store]="store" viewId="v" measure="amount" [levels]="hierarchy" label="L" class="probe"></st-dataviz-decomposition-tree-chart>`,
    items: ["amount: 22", "·eu: 17", "·us: 5", "··checkout: 10", "··checkout: 5", "··billing: 7"],
    after: ["amount: 7", "·eu: 7", "··billing: 7"],
  },
  {
    family: "hierarchy and relation charts",
    name: "ArcDiagramChart",
    component: ArcDiagramChart,
    ds: "ArcDiagramChart",
    template: `<st-dataviz-arc-diagram-chart [store]="store" viewId="v" source="region" target="service" weight="amount" label="L" class="probe"></st-dataviz-arc-diagram-chart>`,
    items: ["eu -> checkout: 10", "us -> checkout: 5", "eu -> billing: 7"],
    after: ["eu -> billing: 7"],
  },
  {
    family: "hierarchy and relation charts",
    name: "DependencyWheelChart",
    component: DependencyWheelChart,
    ds: "DependencyWheelChart",
    template: `<st-dataviz-dependency-wheel-chart [store]="store" viewId="v" source="region" target="service" weight="amount" label="L" class="probe"></st-dataviz-dependency-wheel-chart>`,
    items: ["eu -> checkout: 10", "us -> checkout: 5", "eu -> billing: 7"],
    after: ["eu -> billing: 7"],
  },
  {
    family: "distribution and gauge charts",
    name: "GaugeChart",
    component: GaugeChart,
    ds: "GaugeChart",
    template: `<st-dataviz-gauge-chart [store]="store" viewId="v" value="amount" label="L" class="probe"></st-dataviz-gauge-chart>`,
    items: ["L: 22 (min 0, max 100)"],
    after: ["L: 7 (min 0, max 100)"],
  },
  {
    family: "distribution and gauge charts",
    name: "SolidGaugeChart",
    component: SolidGaugeChart,
    ds: "SolidGaugeChart",
    template: `<st-dataviz-solid-gauge-chart [store]="store" viewId="v" value="amount" label="L" class="probe"></st-dataviz-solid-gauge-chart>`,
    items: ["L: 22 (min 0, max 100)"],
    after: ["L: 7 (min 0, max 100)"],
  },
  {
    family: "distribution and gauge charts",
    name: "ViolinChart",
    component: ViolinChart,
    ds: "ViolinChart",
    template: `<st-dataviz-violin-chart [store]="store" viewId="v" groupBy="region" measure="amount" label="L" class="probe"></st-dataviz-violin-chart>`,
    items: ["eu: 2 points, min 7, median 8.5, max 10", "us: 1 points, min 5, median 5, max 5"],
    after: ["eu: 1 points, min 7, median 7, max 7"],
  },
  {
    family: "distribution and gauge charts",
    name: "BellCurveChart",
    listAria: "Data values for L — μ 7.33, σ 2.52, n 3",
    component: BellCurveChart,
    ds: "BellCurveChart",
    template: `<st-dataviz-bell-curve-chart [store]="store" viewId="v" measure="amount" label="L" class="probe"></st-dataviz-bell-curve-chart>`,
    items: ["Moyenne (μ): 7.33", "Écart-type (σ): 2.52", "Taille de l'échantillon (n): 3"],
    after: ["Échantillon insuffisant (au moins 2 valeurs requises)"],
  },
  {
    family: "distribution and gauge charts",
    name: "Density2DChart",
    component: Density2DChart,
    ds: "Density2DChart",
    template: `<st-dataviz-density2-d-chart [store]="store" viewId="v" x="amount" y="close" label="L" class="probe"></st-dataviz-density2-d-chart>`,
    items: ["[5–5.4] × [102–102.4]: 1", "[9.6–10] × [104.9–105.3]: 1", "[6.7–7.1] × [106.6–107]: 1"],
    after: [],
  },
  {
    family: "distribution and gauge charts",
    name: "ContourChart",
    component: ContourChart,
    ds: "ContourChart",
    template: `<st-dataviz-contour-chart [store]="store" viewId="v" x="amount" y="close" value="high" label="L" class="probe"></st-dataviz-contour-chart>`,
    items: ["x 10, y 105 · 110", "x 5, y 102 · 112", "x 7, y 107 · 108"],
    after: ["x 7, y 107 · 108"],
  },
  {
    family: "time and state charts",
    name: "StateTimelineChart",
    component: StateTimelineChart,
    ds: "StateTimelineChart",
    template: `<st-dataviz-state-timeline-chart [store]="store" viewId="v" series="region" start="ts" end="ts" state="service" label="L" class="probe"></st-dataviz-state-timeline-chart>`,
    items: ["eu: checkout [1767225600000 → 1767225600000], billing [1767398400000 → 1767398400000]", "us: checkout [1767312000000 → 1767312000000]"],
    after: ["eu: billing [1767398400000 → 1767398400000]"],
  },
  {
    family: "time and state charts",
    name: "StatusHistoryChart",
    component: StatusHistoryChart,
    ds: "StatusHistoryChart",
    template: `<st-dataviz-status-history-chart [store]="store" viewId="v" series="region" at="ts" value="amount" label="L" class="probe"></st-dataviz-status-history-chart>`,
    items: ["eu: 1767225600000 = 10, 1767398400000 = 7", "us: 1767312000000 = 5"],
    after: ["eu: 1767398400000 = 7"],
  },
  {
    family: "time and state charts",
    name: "TimelineChart",
    component: TimelineChart,
    ds: "TimelineChart",
    template: `<st-dataviz-timeline-chart [store]="store" viewId="v" label_field="region" position="ts" label="L" class="probe"></st-dataviz-timeline-chart>`,
    items: ["1767225600000: eu", "1767312000000: us", "1767398400000: eu"],
    after: ["1767398400000: eu"],
  },
  {
    family: "time and state charts",
    name: "GanttChart",
    component: GanttChart,
    ds: "GanttChart",
    template: `<st-dataviz-gantt-chart [store]="store" viewId="v" task="region" start="ts" end="ts" label="L" class="probe"></st-dataviz-gantt-chart>`,
    items: ["eu: 1767225600000 → 1767225600000", "us: 1767312000000 → 1767312000000", "eu: 1767398400000 → 1767398400000"],
    after: ["eu: 1767398400000 → 1767398400000"],
  },
  {
    family: "time and state charts",
    name: "FlamegraphChart",
    component: FlamegraphChart,
    ds: "FlamegraphChart",
    template: `<st-dataviz-flamegraph-chart [store]="store" viewId="v" id="region" parentId="service" name="shape" value="amount" label="L" class="probe"></st-dataviz-flamegraph-chart>`,
    items: ["root: 12", "·[object Object]: 7", "·[object Object]: 5"],
    after: ["[object Object]: 7"],
  },
  {
    family: "time and state charts",
    name: "StreamgraphChart",
    component: StreamgraphChart,
    ds: "StreamgraphChart",
    template: `<st-dataviz-streamgraph-chart [store]="store" viewId="v" category="region" series="service" measure="amount" label="L" class="probe"></st-dataviz-streamgraph-chart>`,
    items: ["checkout: 15", "billing: 7", "Total: 22"],
    after: ["billing: 7", "Total: 7"],
  },
  {
    family: "time and state charts",
    name: "BumpChart",
    component: BumpChart,
    ds: "BumpChart",
    template: `<st-dataviz-bump-chart [store]="store" viewId="v" series="region" category="service" measure="amount" label="L" class="probe"></st-dataviz-bump-chart>`,
    items: ["eu: checkout #1, billing #1", "us: checkout #2, billing ?"],
    after: ["eu: billing #1"],
  },
  {
    family: "statistical distribution charts",
    name: "BoxPlotChart",
    component: BoxPlotChart,
    ds: "BoxPlotChart",
    template: `<st-dataviz-box-plot-chart [store]="store" viewId="v" value="amount" label="L" class="probe"></st-dataviz-box-plot-chart>`,
    items: ["All: min 5, q1 6, median 7, q3 8.5, max 10"],
    after: ["All: min 7, q1 7, median 7, q3 7, max 7"],
  },
  {
    family: "statistical distribution charts",
    name: "BulletChart",
    component: BulletChart,
    ds: "BulletChart",
    template: `<st-dataviz-bullet-chart [store]="store" viewId="v" value="amount" target="close" label="L" class="probe"></st-dataviz-bullet-chart>`,
    items: ["All: value 22, target 104.66666666666667"],
    after: ["All: value 7, target 107"],
  },
  {
    family: "statistical distribution charts",
    name: "HistogramChart",
    component: HistogramChart,
    ds: "HistogramChart",
    template: `<st-dataviz-histogram-chart [store]="store" viewId="v" value="amount" label="L" class="probe"></st-dataviz-histogram-chart>`,
    items: ["5-5.5: 1", "5.5-6: 0", "6-6.5: 0", "6.5-7: 0", "7-7.5: 1", "7.5-8: 0", "8-8.5: 0", "8.5-9: 0", "9-9.5: 0", "9.5-10: 1"],
    after: ["7-7: 1"],
    mark: [".st-histogramChart__bar", 10, 1],
  },
  {
    family: "statistical distribution charts",
    name: "CorrelationMatrix",
    component: CorrelationMatrix,
    ds: "HeatmapChart",
    template: `<st-dataviz-correlation-matrix [store]="store" viewId="v" [measures]="measures" label="L" class="probe"></st-dataviz-correlation-matrix>`,
    items: ["Amount, Amount: 1", "Close, Amount: 0.5", "Amount, Close: 0.5", "Close, Close: 1"],
    // One row left: the off-diagonal correlation collapses to 0 while the cell
    // count stays at 4 — the values move, the grid does not.
    after: ["Amount, Amount: 1", "Close, Amount: 0", "Amount, Close: 0", "Close, Close: 1"],
    mark: [".st-heatmapChart__cell", 4, 4],
  },
  {
    family: "statistical distribution charts",
    name: "ParallelCoordinatesChart",
    component: ParallelCoordinatesChart,
    ds: "ParallelCoordinatesChart",
    template: `<st-dataviz-parallel-coordinates-chart [store]="store" viewId="v" [measures]="measures" label="L" class="probe"></st-dataviz-parallel-coordinates-chart>`,
    items: ["Amount: 10, Close: 105", "Amount: 5, Close: 102", "Amount: 7, Close: 107"],
    after: ["Amount: 7, Close: 107"],
  },
  {
    family: "analytics overlays reusing a DS chart",
    name: "AnalyticsClusterPlot",
    component: AnalyticsClusterPlot,
    ds: "ScatterPlot",
    ownClass: "st-analyticsClusterPlot",
    template: `<st-dataviz-analytics-cluster-plot [store]="store" viewId="v" [fields]="measures" [k]="1" label="L" class="probe"></st-dataviz-analytics-cluster-plot>`,
    items: [
      "amount 10 · close 105: x 10, y 105",
      "amount 5 · close 102: x 5, y 102",
      "amount 7 · close 107: x 7, y 107",
      "Centroïde cluster:0: 3: (7.333333333333333, 104.66666666666667)",
    ],
    after: ["amount 7 · close 107: x 7, y 107", "Centroïde cluster:0: 1: (7, 107)"],
  },
  {
    family: "analytics overlays reusing a DS chart",
    name: "ForecastLineChart",
    component: ForecastLineChart,
    ds: "LineChart",
    ownClass: "st-forecastLineChart",
    template: `<st-dataviz-forecast-line-chart [store]="store" viewId="v" x="amount" y="close" [periods]="1" label="L" class="probe"></st-dataviz-forecast-line-chart>`,
    items: ["5: 102", "7: 107", "10: 105", "12.5: 107.25 (prévision)"],
    // A single observation gives the regression nothing to extrapolate, so the
    // forecast point disappears with the history.
    after: ["7: 107"],
  },
  {
    family: "grid and glyph charts",
    name: "ItemChart",
    component: ItemChart,
    ds: "ItemChart",
    template: `<st-dataviz-item-chart [store]="store" viewId="v" label_field="region" value="amount" label="L" class="probe"></st-dataviz-item-chart>`,
    items: ["eu: 10", "us: 5", "eu: 7"],
    after: ["eu: 7"],
    mark: [".st-itemChart__seat", 22, 7],
  },
  {
    family: "grid and glyph charts",
    name: "PolygonChart",
    component: PolygonChart,
    ds: "PolygonChart",
    template: `<st-dataviz-polygon-chart [store]="store" viewId="v" x="amount" y="close" label="L" class="probe"></st-dataviz-polygon-chart>`,
    items: ["x 10, y 105", "x 5, y 102", "x 7, y 107"],
    after: ["x 7, y 107"],
  },
  {
    family: "grid and glyph charts",
    name: "TileMapChart",
    component: TileMapChart,
    ds: "TileMapChart",
    // `col` and `row` are NUMERIC grid positions: a discrete dimension there
    // yields no tile at all, which is how the empty render was first found.
    template: `<st-dataviz-tile-map-chart [store]="store" viewId="v" label_field="region" col="lat" row="lon" value="amount" label="L" class="probe"></st-dataviz-tile-map-chart>`,
    items: ["eu: 10", "us: 5", "eu: 7"],
    after: ["eu: 7"],
  },
  {
    family: "grid and glyph charts",
    name: "VectorFieldChart",
    component: VectorFieldChart,
    ds: "VectorFieldChart",
    template: `<st-dataviz-vector-field-chart [store]="store" viewId="v" x="amount" y="close" length="low" direction="high" label="L" class="probe"></st-dataviz-vector-field-chart>`,
    items: ["x 10, y 105 · |v| 95 @ 110°", "x 5, y 102 · |v| 101 @ 112°", "x 7, y 107 · |v| 99 @ 108°"],
    after: ["x 7, y 107 · |v| 99 @ 108°"],
    mark: [".st-vectorFieldChart__head", 6, 2],
  },
  {
    family: "grid and glyph charts",
    name: "WindBarbChart",
    component: WindBarbChart,
    ds: "WindBarbChart",
    template: `<st-dataviz-wind-barb-chart [store]="store" viewId="v" at="ts" speed="amount" direction="close" label="L" class="probe"></st-dataviz-wind-barb-chart>`,
    items: ["1767225600k · 10 kt @ 105°", "1767312000k · 5 kt @ 102°", "1767398400k · 7 kt @ 107°"],
    after: ["1767398400k · 7 kt @ 107°"],
  },
  {
    family: "grid and glyph charts",
    name: "WordCloudChart",
    component: WordCloudChart,
    ds: "WordCloudChart",
    template: `<st-dataviz-word-cloud-chart [store]="store" viewId="v" word_field="region" weight="amount" label="L" class="probe"></st-dataviz-word-cloud-chart>`,
    items: ["eu: 10", "eu: 7", "us: 5"],
    after: ["eu: 7"],
    mark: [".st-wordCloudChart__word", 3, 1],
  },
  {
    family: "grid and glyph charts",
    name: "PointAndFigureChart",
    component: PointAndFigureChart,
    ds: "PointAndFigureChart",
    template: `<st-dataviz-point-and-figure-chart [store]="store" viewId="v" date="ts" close="amount" label="L" class="probe"></st-dataviz-point-and-figure-chart>`,
    items: ["O 5 → 10.3", "X 5.3 → 7.3"],
    // A single close cannot move by one box, so no column forms: the list empties.
    after: [],
  },
  {
    family: "trace, event and anomaly views",
    name: "AnomalySwimLaneChart",
    component: AnomalySwimLaneChart,
    ds: "AnomalySwimLaneChart",
    template: `<st-dataviz-anomaly-swim-lane-chart [store]="store" viewId="v" job="region" at="ts" score="amount" label="L" class="probe"></st-dataviz-anomaly-swim-lane-chart>`,
    items: ["eu: 1767225600000 = 10, 1767398400000 = 7", "us: 1767312000000 = 5"],
    after: ["eu: 1767398400000 = 7"],
  },
  {
    family: "trace, event and anomaly views",
    name: "TraceWaterfallChart",
    component: TraceWaterfallChart,
    ds: "TraceWaterfallChart",
    template: `<st-dataviz-trace-waterfall-chart [store]="store" viewId="v" spanId="service" parentSpanId="region" service="region" start="ts" duration="amount" label="L" class="probe"></st-dataviz-trace-waterfall-chart>`,
    items: ["eu: 1767225600000 → 1767225600010", "eu: 1767398400000 → 1767398400007"],
    after: ["eu: 1767398400000 → 1767398400007"],
  },
  {
    family: "trace, event and anomaly views",
    name: "EventFeedPanel",
    component: EventFeedPanel,
    ds: "EventFeedPanel",
    template: `<st-dataviz-event-feed-panel [store]="store" viewId="v" at="ts" type="region" severity="service" message="shape" label="L" class="probe"></st-dataviz-event-feed-panel>`,
    // The DS EventFeedPanel is a feed, not a chart: it renders no
    // `ul.st-chartDataList` at all, so the datum elements carry the assertion.
    listAria: null,
    items: [],
    after: [],
    mark: [".st-eventFeedPanel__item", 3, 1],
  },
  {
    family: "graph and ribbon charts",
    name: "ForceGraph",
    component: ForceGraph,
    ds: "ForceGraph",
    template: `<st-dataviz-force-graph [store]="store" viewId="v" source="region" target="service" label="L" class="probe"></st-dataviz-force-graph>`,
    // Same as EventFeedPanel: no accessible value list in the DS component.
    listAria: null,
    items: [],
    after: [],
    mark: [".st-forceGraph__node", 4, 2],
  },
  {
    family: "graph and ribbon charts",
    name: "RibbonChart",
    component: RibbonChart,
    ds: "RibbonChart",
    template: `<st-dataviz-ribbon-chart [store]="store" viewId="v" category="region" period="service" value="amount" label="L" class="probe"></st-dataviz-ribbon-chart>`,
    items: ["eu: checkout = 10, billing = 7", "us: checkout = 5, billing = 0"],
    after: ["eu: billing = 7"],
    mark: [".st-ribbonChart__seg", 3, 1],
  },
  {
    family: "store-driven charts the port generator refuses (hand-written, lot 5)",
    name: "LollipopChart",
    component: LollipopChart,
    ds: "LollipopChart",
    template: `<st-dataviz-lollipop-chart [store]="store" viewId="v" category="region" measure="amount" label="L" class="probe"></st-dataviz-lollipop-chart>`,
    items: ["eu: 17", "us: 5"],
    after: ["eu: 7"],
    mark: ['.st-lollipopChart__stem', 2, 1],
  },
  {
    family: "store-driven charts the port generator refuses (hand-written, lot 5)",
    name: "StepLineChart",
    component: StepLineChart,
    ds: "StepLineChart",
    template: `<st-dataviz-step-line-chart [store]="store" viewId="v" category="region" measure="amount" label="L" class="probe"></st-dataviz-step-line-chart>`,
    items: ["eu: 17", "us: 5"],
    after: ["eu: 7"],
    mark: ['.st-stepLineChart__dot', 2, 1],
  },
  {
    family: "store-driven charts the port generator refuses (hand-written, lot 5)",
    name: "CalendarHeatmapChart",
    component: CalendarHeatmapChart,
    ds: "CalendarHeatmapChart",
    template: `<st-dataviz-calendar-heatmap-chart [store]="store" viewId="v" date="day" measure="amount" label="L" class="probe"></st-dataviz-calendar-heatmap-chart>`,
    items: ["2026-01-01: 10", "2026-01-02: 5", "2026-01-03: 7"],
    after: ["2026-01-03: 7"],
  },
  {
    family: "store-driven charts the port generator refuses (hand-written, lot 5)",
    name: "ChordChart",
    component: ChordChart,
    ds: "ChordDiagram",
    template: `<st-dataviz-chord-chart [store]="store" viewId="v" source="region" target="service" measure="amount" label="L" class="probe"></st-dataviz-chord-chart>`,
    items: ["eu -> checkout: 10", "us -> checkout: 5", "eu -> billing: 7"],
    after: ["eu -> billing: 7"],
  },
  {
    family: "store-driven charts the port generator refuses (hand-written, lot 5)",
    name: "DivergingBarChart",
    component: DivergingBarChart,
    ds: "DivergentBarChart",
    template: `<st-dataviz-diverging-bar-chart [store]="store" viewId="v" category="region" measure="amount" label="L" class="probe"></st-dataviz-diverging-bar-chart>`,
    items: ["eu: 17", "us: 5"],
    after: ["eu: 7"],
  },
  {
    family: "store-driven charts the port generator refuses (hand-written, lot 5)",
    name: "ParetoChart",
    component: ParetoChart,
    ds: "ParetoChart",
    template: `<st-dataviz-pareto-chart [store]="store" viewId="v" category="region" measure="amount" label="L" class="probe"></st-dataviz-pareto-chart>`,
    items: ["eu: 17 (77.3% cumulé)", "us: 5 (100% cumulé)"],
    after: ["eu: 7 (100% cumulé)"],
  },
  {
    family: "store-driven charts the port generator refuses (a binding reads a prop the descriptor cannot express, lot 7)",
    name: "ErrorBarsChart",
    component: ErrorBarsChart,
    ds: "BarChart",
    ownClass: "st-errorBarsChart",
    template: `<st-dataviz-error-bars-chart [store]="store" viewId="v" category="region" value="amount" label="L" class="probe"></st-dataviz-error-bars-chart>`,
    items: ["eu: 8.5", "us: 5"],
    after: ["eu: 7"],
  },
  {
    family: "store-driven charts the port generator refuses (a binding reads a prop the descriptor cannot express, lot 7)",
    name: "PercentileBandChart",
    component: PercentileBandChart,
    ds: "LineChart",
    ownClass: "st-percentileBandChart",
    template: `<st-dataviz-percentile-band-chart [store]="store" viewId="v" value="amount" [lower]="0.25" [upper]="0.75" label="L" class="probe"></st-dataviz-percentile-band-chart>`,
    items: ["25%: 6", "median: 7", "75%: 8.5", "Référence: Median = 7", "Bande: Percentiles (6–8.5)"],
    after: ["25%: 7", "median: 7", "75%: 7", "Référence: Median = 7", "Bande: Percentiles (7–7)"],
  },
  {
    family: "store-driven charts the port generator refuses (a binding reads a prop the descriptor cannot express, lot 7)",
    name: "ReferenceLineChart",
    component: ReferenceLineChart,
    ds: "LineChart",
    ownClass: "st-referenceLineChart",
    template: `<st-dataviz-reference-line-chart [store]="store" viewId="v" measure="amount" label="L" class="probe"></st-dataviz-reference-line-chart>`,
    items: ["0: 0", "22: 0", "Référence: Amount = 22"],
    after: ["0: 0", "7: 0", "Référence: Amount = 7"],
  },
  {
    family: "store-driven charts the port generator refuses (a binding reads a prop the descriptor cannot express, lot 7)",
    name: "TrendLineChart",
    component: TrendLineChart,
    ds: "LineChart",
    ownClass: "st-trendLineChart",
    template: `<st-dataviz-trend-line-chart [store]="store" viewId="v" x="amount" y="close" label="L" class="probe"></st-dataviz-trend-line-chart>`,
    items: ["5: 103.5", "10: 106", "Tendance: pente 0.50"],
    // A single observation gives the regression nothing to fit: the trend line
    // and its data both disappear.
    after: [],
  },
  {
    family: "store-driven charts the port generator refuses (a binding reads a prop the descriptor cannot express, lot 7)",
    name: "ComboChart",
    component: ComboChart,
    ds: "ComboChart",
    template: `<st-dataviz-combo-chart [store]="store" viewId="v" category="region" [measures]="['amount', { id: 'close', mark: 'line' }]" label="L" class="probe"></st-dataviz-combo-chart>`,
    items: ["Amount, eu: 17", "Amount, us: 5", "Close, eu: 106", "Close, us: 102"],
    after: ["Amount, eu: 7", "Close, eu: 107"],
  },
  {
    family: "store-driven charts the port generator refuses (no `void <state>.value` marker, lot 8)",
    name: "CrossfilteredBarChart",
    component: CrossfilteredBarChart,
    ds: "BarChart",
    ownClass: "st-crossfilteredBarChart",
    template: `<st-dataviz-crossfiltered-bar-chart [store]="store" viewId="v" dimension="service" measure="amount" label="L" class="probe"></st-dataviz-crossfiltered-bar-chart>`,
    items: ["checkout: 15", "billing: 7"],
    after: ["billing: 7"],
  },
  {
    family: "store-driven charts the port generator refuses (no `void <state>.value` marker, lot 8)",
    name: "DrillBarChart",
    component: DrillBarChart,
    ds: "BarChart",
    ownClass: "st-drillBarChart",
    template: `<st-dataviz-drill-bar-chart [store]="store" viewId="v" [hierarchy]="hierarchy" measure="amount" label="L" class="probe"></st-dataviz-drill-bar-chart>`,
    items: ["eu: 17", "us: 5"],
    after: ["eu: 7"],
  },
];

function dataList(root: Element): string[] {
  return Array.from(root.querySelectorAll('ul.st-chartDataList > li')).map((li) => li.textContent?.trim() ?? '');
}

function expectItems(actual: string[], expected: Items, what: string): void {
  if (Array.isArray(expected)) {
    expect(actual, what).toEqual(expected);
    return;
  }
  expect(actual.length, what + ' count').toBe(expected.count);
  expect(actual[0], what + ' first').toBe(expected.first);
  expect(actual[actual.length - 1], what + ' last').toBe(expected.last);
}

for (const [family] of new Map(cases.map((c) => [c.family, true]))) {
  describe(family + ' (angular)', () => {
    for (const testCase of cases.filter((c) => c.family === family)) {
      it(testCase.name + ' renders its DS component from the cross-filtered rows', () => {
        class Host {
          readonly store = createDashboardStore({
            model,
            data: rows,
            crossfilter: { views: { v: { field: 'service' }, other: { field: 'service' } } },
          });
          readonly hierarchy = ['region', 'service'];
          readonly measures = ['amount', 'close'];
        }
        Component({ standalone: true, imports: [testCase.component], template: testCase.template })(Host);

        const fixture = TestBed.createComponent(Host);
        fixture.detectChanges();
        const root = fixture.nativeElement as HTMLElement;

        const marker = root.querySelector('[data-st-component]');
        expect(marker?.getAttribute('data-st-component'), 'DS component').toBe(testCase.ds);
        const classes = marker?.getAttribute('class')?.split(' ') ?? [];
        expect(classes, 'class passthrough').toContain('probe');
        if (testCase.ownClass) expect(classes, 'adapter class').toContain(testCase.ownClass);

        if (testCase.listAria === null) {
          expect(root.querySelector('ul.st-chartDataList'), 'no DS value list').toBeNull();
        } else {
          expect(root.querySelector('ul.st-chartDataList')?.getAttribute('aria-label')).toBe(
            testCase.listAria ?? 'Data values for L',
          );
        }
        expectItems(dataList(root), testCase.items, testCase.name + ' values');
        if (testCase.mark) {
          expect(root.querySelectorAll(testCase.mark[0]).length, testCase.mark[0]).toBe(testCase.mark[1]);
        }

        // A selection in the other view narrows this one: same assertions, new data.
        fixture.componentInstance.store.toggleSelection('other', 'billing');
        fixture.detectChanges();

        expectItems(dataList(root), testCase.after, testCase.name + ' values after narrowing');
        if (testCase.mark) {
          expect(root.querySelectorAll(testCase.mark[0]).length, testCase.mark[0] + ' after').toBe(testCase.mark[2]);
        }
      });
    }
  });
}
