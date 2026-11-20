// React leg, type level (`npm run check`). What the emitted React tree
// publishes must be the very types `@sentropic/dataviz-react` publishes
// today: each line below fails to compile when the two differ.
//
// Components and values are compared as whole types (`typeof X`): parameters,
// return type and static members. Never member-wise.
import type * as HandWritten from "@sentropic/dataviz-react";
import type * as Emitted from "../.react-emit/src/index.js";
import type * as EmittedCategoricalData from "../.react-emit/src/lib/categoricalData.js";
import type * as HandWrittenCategoricalData from "../../dataviz-react/src/lib/categoricalData.js";
import type * as EmittedDistributionData from "../.react-emit/src/lib/distributionData.js";
import type * as HandWrittenDistributionData from "../../dataviz-react/src/lib/distributionData.js";
import type * as EmittedPartOfWholeData from "../.react-emit/src/lib/partOfWholeData.js";
import type * as HandWrittenPartOfWholeData from "../../dataviz-react/src/lib/partOfWholeData.js";
import type * as EmittedAdvancedPivotData from "../.react-emit/src/lib/advancedPivotData.js";
import type * as HandWrittenAdvancedPivotData from "../../dataviz-react/src/lib/advancedPivotData.js";
import type * as EmittedAnalyticsDsData from "../.react-emit/src/lib/analyticsDsData.js";
import type * as HandWrittenAnalyticsDsData from "../../dataviz-react/src/lib/analyticsDsData.js";
import type * as EmittedChartExport from "../.react-emit/src/lib/chart-export.js";
import type * as HandWrittenChartExport from "../../dataviz-react/src/lib/chart-export.js";
import type * as EmittedGeoMapLayers from "../.react-emit/src/lib/geoMapLayers.js";
import type * as HandWrittenGeoMapLayers from "../../dataviz-react/src/lib/geoMapLayers.js";
import type * as EmittedUrlSync from "../.react-emit/src/lib/url-sync.js";
import type * as HandWrittenUrlSync from "../../dataviz-react/src/lib/url-sync.js";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

export type PropsParity = [
  Expect<Equal<Emitted.ButtonProps, HandWritten.ButtonProps>>,
  Expect<Equal<Emitted.TenantTheme, HandWritten.TenantTheme>>,
  Expect<Equal<Emitted.DrillLevel, HandWritten.DrillLevel>>,
  Expect<Equal<Emitted.DrillDatum, HandWritten.DrillDatum>>,
  Expect<Equal<Emitted.AreaChartProps, HandWritten.AreaChartProps>>,
  Expect<Equal<Emitted.ComboChartProps, HandWritten.ComboChartProps>>,
  Expect<Equal<Emitted.LollipopChartProps, HandWritten.LollipopChartProps>>,
  Expect<Equal<Emitted.StackedBarChartProps, HandWritten.StackedBarChartProps>>,
  Expect<Equal<Emitted.StepLineChartProps, HandWritten.StepLineChartProps>>,
  Expect<Equal<Emitted.CrossfilteredBarChartProps, HandWritten.CrossfilteredBarChartProps>>,
  Expect<Equal<Emitted.TimeSeriesLineChartProps, HandWritten.TimeSeriesLineChartProps>>,
  Expect<Equal<Emitted.TimeSeriesLineChartTone, HandWritten.TimeSeriesLineChartTone>>,
  Expect<Equal<Emitted.DivergingBarChartProps, HandWritten.DivergingBarChartProps>>,
  Expect<Equal<Emitted.ParetoChartProps, HandWritten.ParetoChartProps>>,
  Expect<Equal<Emitted.DateHistogramChartProps, HandWritten.DateHistogramChartProps>>,
  Expect<Equal<Emitted.DateHistogramChartTone, HandWritten.DateHistogramChartTone>>,
  Expect<Equal<Emitted.DateHistogramLabelFormatter, HandWritten.DateHistogramLabelFormatter>>,
  Expect<Equal<Emitted.SerializeSvgOptions, HandWritten.SerializeSvgOptions>>,
  Expect<Equal<Emitted.RasterizeOptions, HandWritten.RasterizeOptions>>,
  Expect<Equal<Emitted.ChartExportFormat, HandWritten.ChartExportFormat>>,
  Expect<Equal<Emitted.UrlSyncOptions, HandWritten.UrlSyncOptions>>,
  Expect<Equal<Emitted.AdvancedPivotDataTableProps, HandWritten.AdvancedPivotDataTableProps>>,
  Expect<Equal<Emitted.AnalyticsClusterPlotProps, HandWritten.AnalyticsClusterPlotProps>>,
  Expect<Equal<Emitted.AnimatedBubbleChartProps, HandWritten.AnimatedBubbleChartProps>>,
  Expect<Equal<Emitted.AnomalySwimLaneChartProps, HandWritten.AnomalySwimLaneChartProps>>,
];

export type ComponentParity = [
  Expect<Equal<typeof Emitted.AreaChart, typeof HandWritten.AreaChart>>,
  Expect<Equal<typeof Emitted.ComboChart, typeof HandWritten.ComboChart>>,
  Expect<Equal<typeof Emitted.LollipopChart, typeof HandWritten.LollipopChart>>,
  Expect<Equal<typeof Emitted.StackedBarChart, typeof HandWritten.StackedBarChart>>,
  Expect<Equal<typeof Emitted.StepLineChart, typeof HandWritten.StepLineChart>>,
  Expect<Equal<typeof Emitted.CrossfilteredBarChart, typeof HandWritten.CrossfilteredBarChart>>,
  Expect<Equal<typeof Emitted.TimeSeriesLineChart, typeof HandWritten.TimeSeriesLineChart>>,
  Expect<Equal<typeof Emitted.DivergingBarChart, typeof HandWritten.DivergingBarChart>>,
  Expect<Equal<typeof Emitted.ParetoChart, typeof HandWritten.ParetoChart>>,
  Expect<Equal<typeof Emitted.DateHistogramChart, typeof HandWritten.DateHistogramChart>>,
  Expect<Equal<typeof Emitted.AdvancedPivotDataTable, typeof HandWritten.AdvancedPivotDataTable>>,
  Expect<Equal<typeof Emitted.AnalyticsClusterPlot, typeof HandWritten.AnalyticsClusterPlot>>,
  Expect<Equal<typeof Emitted.AnimatedBubbleChart, typeof HandWritten.AnimatedBubbleChart>>,
  Expect<Equal<typeof Emitted.AnomalySwimLaneChart, typeof HandWritten.AnomalySwimLaneChart>>,
];

export type ValueParity = [
  Expect<Equal<typeof Emitted.useDashboard, typeof HandWritten.useDashboard>>,
  Expect<Equal<typeof Emitted.drillLevel, typeof HandWritten.drillLevel>>,
  Expect<Equal<typeof Emitted.onDrillSelect, typeof HandWritten.onDrillSelect>>,
  Expect<Equal<typeof Emitted.drillDepth, typeof HandWritten.drillDepth>>,
  Expect<Equal<typeof Emitted.serializeSvg, typeof HandWritten.serializeSvg>>,
  Expect<Equal<typeof Emitted.svgStringToBlob, typeof HandWritten.svgStringToBlob>>,
  Expect<Equal<typeof Emitted.svgStringToPngBlob, typeof HandWritten.svgStringToPngBlob>>,
  Expect<Equal<typeof Emitted.downloadBlob, typeof HandWritten.downloadBlob>>,
  Expect<Equal<typeof Emitted.downloadSvg, typeof HandWritten.downloadSvg>>,
  Expect<Equal<typeof Emitted.downloadPng, typeof HandWritten.downloadPng>>,
  Expect<Equal<typeof Emitted.printElement, typeof HandWritten.printElement>>,
  Expect<Equal<typeof Emitted.stateToQuery, typeof HandWritten.stateToQuery>>,
  Expect<Equal<typeof Emitted.queryToState, typeof HandWritten.queryToState>>,
  Expect<Equal<typeof Emitted.applyStateToStore, typeof HandWritten.applyStateToStore>>,
  Expect<Equal<typeof Emitted.readStateFromUrl, typeof HandWritten.readStateFromUrl>>,
  Expect<Equal<typeof Emitted.writeStateToUrl, typeof HandWritten.writeStateToUrl>>,
  Expect<Equal<typeof Emitted.readLocationSearch, typeof HandWritten.readLocationSearch>>,
  Expect<Equal<typeof Emitted.DEFAULT_URL_SYNC_PARAM, typeof HandWritten.DEFAULT_URL_SYNC_PARAM>>,
  Expect<Equal<typeof Emitted.useUrlSync, typeof HandWritten.useUrlSync>>,
];

export type InternalHelpersParity = [
  Expect<Equal<typeof EmittedCategoricalData, typeof HandWrittenCategoricalData>>,
  Expect<Equal<EmittedCategoricalData.SimpleCategoricalDatum, HandWrittenCategoricalData.SimpleCategoricalDatum>>,
  Expect<Equal<EmittedCategoricalData.SimpleCategoricalPoint, HandWrittenCategoricalData.SimpleCategoricalPoint>>,
  Expect<Equal<EmittedCategoricalData.StackedMode, HandWrittenCategoricalData.StackedMode>>,
  Expect<Equal<typeof EmittedPartOfWholeData, typeof HandWrittenPartOfWholeData>>,
  Expect<Equal<EmittedPartOfWholeData.HierarchyDatum, HandWrittenPartOfWholeData.HierarchyDatum>>,
  Expect<Equal<EmittedPartOfWholeData.TreemapDatum, HandWrittenPartOfWholeData.TreemapDatum>>,
  Expect<Equal<typeof EmittedDistributionData, typeof HandWrittenDistributionData>>,
  Expect<Equal<typeof EmittedAdvancedPivotData, typeof HandWrittenAdvancedPivotData>>,
  Expect<Equal<EmittedAdvancedPivotData.AdvancedPivotTableRowView, HandWrittenAdvancedPivotData.AdvancedPivotTableRowView>>,
  Expect<Equal<EmittedAdvancedPivotData.AdvancedPivotTableView, HandWrittenAdvancedPivotData.AdvancedPivotTableView>>,
  Expect<Equal<typeof EmittedAnalyticsDsData, typeof HandWrittenAnalyticsDsData>>,
  Expect<Equal<typeof EmittedChartExport, typeof HandWrittenChartExport>>,
  Expect<Equal<EmittedChartExport.PdfExportOptions, HandWrittenChartExport.PdfExportOptions>>,
  Expect<Equal<typeof EmittedGeoMapLayers, typeof HandWrittenGeoMapLayers>>,
  Expect<Equal<typeof EmittedUrlSync, typeof HandWrittenUrlSync>>,
];

// The emitted barrel publishes no value the hand-written package keeps internal.
export type NoExtraExport = Expect<Equal<Exclude<keyof typeof Emitted, keyof typeof HandWritten>, never>>;
