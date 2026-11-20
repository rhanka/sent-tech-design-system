// Scaffold checks of lot P6: the coverage-manifest hook and the packaging guard
// fail here, with a case per invariant, rather than as one opaque `--check` line.
import assert from "node:assert/strict";
import { test } from "node:test";
import { ADAPTERS } from "./emit-react.mjs";
import { BASE_REF } from "./port-metrics.mjs";
import { checkManifest, readManifest, sourceModules } from "./coverage-manifest.mjs";
import { checkPackaging } from "./package-guard.mjs";

test("coverage manifest owns the expected ported modules of lot P6", () => {
  const { manifest } = readManifest();
  assert.deepEqual(
    manifest.modules.map((row) => row.module),
    [
      "adapter",
      "categoricalData",
      "partOfWholeData",
      "distributionData",
      "drill",
      "AreaChart",
      "ComboChart",
      "LollipopChart",
      "StackedBarChart",
      "StepLineChart",
      "CrossfilteredBarChart",
      "TimeSeriesLineChart",
      "DivergingBarChart",
      "ParetoChart",
      "DateHistogramChart",
      "advancedPivotData",
      "analyticsDsData",
      "chart-export",
      "geoMapLayers",
      "url-sync",
      "useUrlSync",
      "AdvancedPivotDataTable",
      "AnalyticsClusterPlot",
      "AnimatedBubbleChart",
      "AnomalySwimLaneChart",
      "ArcDiagramChart",
      "AreaRangeChart",
      "AreaSplineRangeChart",
      "BellCurveChart",
      "BookmarkNavigator",
      "BoxPlotChart",
      "BulletChart",
      "BumpChart",
      "CalculationEditor",
      "CalendarHeatmapChart",
      "CandlestickChart",
      "ExportMenu",
      "ChartExport",
      "ChordChart",
      "ChoroplethMap",
      "ColumnPyramidChart",
      "ColumnRangeChart",
      "ContourChart",
      "CorrelationMatrix",
      "DashboardActiveFilters",
      "DashboardFilterBar",
      "DashboardGrid",
      "DateRangeFilter",
      "DecompositionTreeChart",
      "Density2DChart",
      "DependencyWheelChart",
      "DonutChart",
      "DrillBarChart",
      "DrillBreadcrumb",
      "TreemapChart",
      "DrillChart",
      "DumbbellChart",
      "ErrorBarsChart",
      "EventFeedPanel",
      "FieldPane",
      "FlamegraphChart",
      "ForceGraph",
      "ForecastLineChart",
      "FormatPanel",
      "FunnelChart",
      "GanttChart",
      "GaugeChart",
      "GeoClusterMap",
      "GeoDensityMap",
      "GeoFlowMap",
      "GeoHexbinMap",
      "GeoJsonMap",
      "GeoPointMap",
      "HLCChart",
      "HeatmapChart",
      "HeikinAshiChart",
      "HistogramChart",
      "HollowCandlestickChart",
      "ItemChart",
      "KpiCardGroup",
      "MekkoChart",
      "OHLCChart",
      "ObjectLayers",
      "OrganizationChart",
      "PackedBubbleChart",
      "PalettePicker",
      "ParallelCoordinatesChart",
      "PercentileBandChart",
      "PivotDataTable",
      "PointAndFigureChart",
      "PolygonChart",
      "QueryBar",
      "RadarChart",
      "RangeSliderFilter",
      "RecordsTable",
    ],
  );
  assert.deepEqual(
    sourceModules(),
    manifest.modules.map((row) => row.file).sort(),
  );
});

test("coverage manifest reference is the pinned BASE_REF", () => {
  const { manifest } = readManifest();
  assert.deepEqual(manifest.reference.commit, BASE_REF);
});

test("coverage manifest adapters are the emission adapters", () => {
  const { manifest } = readManifest();
  assert.deepEqual(
    manifest.adapters.map((row) => row.module).sort(),
    Object.keys(ADAPTERS).sort(),
  );
});

test("full manifest check passes against the tree", () => {
  const { violations } = checkManifest(undefined, { adapters: ADAPTERS, baseRef: BASE_REF });
  assert.deepEqual(violations, []);
});

test("package stays private with a licence, one export, adapter side effects and dataviz runtime deps", () => {
  const { violations } = checkPackaging();
  assert.deepEqual(violations, []);
});
