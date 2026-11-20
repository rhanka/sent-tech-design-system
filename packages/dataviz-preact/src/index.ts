/**
 * @sentropic/dataviz-preact
 *
 * Preact + Signals adapter and dashboard components for @sentropic/dataviz-core,
 * built on @sentropic/design-system-preact. Single JSX source of truth for the
 * Preact package and the emitted @sentropic/dataviz-react build (lot P6).
 */

// Adapter + full core surface re-export (incl. the core's `describeFilterSpec`).
export * from './adapter.js';

// Flagship interactive / SVG / BI charts (batch 3).
export { CrossfilteredBarChart } from './lib/CrossfilteredBarChart.js';
export type { CrossfilteredBarChartProps } from './lib/CrossfilteredBarChart.js';
export { ParetoChart } from './lib/ParetoChart.js';
export type { ParetoChartProps } from './lib/ParetoChart.js';
export { DivergingBarChart } from './lib/DivergingBarChart.js';
export type { DivergingBarChartProps } from './lib/DivergingBarChart.js';

// Categorical charts (batch 2).
export { ComboChart } from './lib/ComboChart.js';
export type { ComboChartProps } from './lib/ComboChart.js';
export { StackedBarChart } from './lib/StackedBarChart.js';
export type { StackedBarChartProps } from './lib/StackedBarChart.js';
export { LollipopChart } from './lib/LollipopChart.js';
export type { LollipopChartProps } from './lib/LollipopChart.js';
export { StepLineChart } from './lib/StepLineChart.js';
export type { StepLineChartProps } from './lib/StepLineChart.js';
export { TimeSeriesLineChart } from './lib/TimeSeriesLineChart.js';
export type { TimeSeriesLineChartProps, TimeSeriesLineChartTone } from './lib/TimeSeriesLineChart.js';
export { AreaChart } from './lib/AreaChart.js';
export type { AreaChartProps } from './lib/AreaChart.js';
export { DateHistogramChart } from './lib/DateHistogramChart.js';
export type { DateHistogramChartProps, DateHistogramChartTone, DateHistogramLabelFormatter } from './lib/DateHistogramChart.js';

// Shared drill engine helpers.
export { drillLevel, onDrillSelect, drillDepth } from './lib/drill.js';
export type { DrillLevel, DrillDatum } from './lib/drill.js';

// Chart export & URL sync helpers (group 2 batch 1).
export {
  serializeSvg,
  svgStringToBlob,
  svgStringToPngBlob,
  downloadBlob,
  downloadSvg,
  downloadPng,
  printElement,
} from './lib/chart-export.js';
export type { SerializeSvgOptions, RasterizeOptions, ChartExportFormat } from './lib/chart-export.js';
export {
  stateToQuery,
  queryToState,
  applyStateToStore,
  readStateFromUrl,
  writeStateToUrl,
  readLocationSearch,
  DEFAULT_URL_SYNC_PARAM,
} from './lib/url-sync.js';
export type { UrlSyncOptions } from './lib/url-sync.js';
export { useUrlSync } from './lib/useUrlSync.js';

// Group 2 batch 2 components.
export { AdvancedPivotDataTable } from './lib/AdvancedPivotDataTable.js';
export type { AdvancedPivotDataTableProps } from './lib/AdvancedPivotDataTable.js';
export { AnalyticsClusterPlot } from './lib/AnalyticsClusterPlot.js';
export type { AnalyticsClusterPlotProps } from './lib/AnalyticsClusterPlot.js';
export { AnimatedBubbleChart } from './lib/AnimatedBubbleChart.js';
export type { AnimatedBubbleChartProps } from './lib/AnimatedBubbleChart.js';
export { AnomalySwimLaneChart } from './lib/AnomalySwimLaneChart.js';
export type { AnomalySwimLaneChartProps } from './lib/AnomalySwimLaneChart.js';

// Group 2 batch 3 components.
export { ArcDiagramChart } from './lib/ArcDiagramChart.js';
export type { ArcDiagramChartProps } from './lib/ArcDiagramChart.js';
export { AreaRangeChart } from './lib/AreaRangeChart.js';
export type { AreaRangeChartProps } from './lib/AreaRangeChart.js';
export { AreaSplineRangeChart } from './lib/AreaSplineRangeChart.js';
export type { AreaSplineRangeChartProps } from './lib/AreaSplineRangeChart.js';
export { BellCurveChart } from './lib/BellCurveChart.js';
export type { BellCurveChartProps } from './lib/BellCurveChart.js';
export { BookmarkNavigator } from './lib/BookmarkNavigator.js';
export type { BookmarkNavigatorProps } from './lib/BookmarkNavigator.js';

// Group 2 batch 4 components.
export { BoxPlotChart } from './lib/BoxPlotChart.js';
export type { BoxPlotChartProps } from './lib/BoxPlotChart.js';
export { BulletChart } from './lib/BulletChart.js';
export type { BulletChartProps } from './lib/BulletChart.js';
export { BumpChart } from './lib/BumpChart.js';
export type { BumpChartProps } from './lib/BumpChart.js';
export { CalculationEditor } from './lib/CalculationEditor.js';
export type { CalculationEditorProps } from './lib/CalculationEditor.js';
export { CalendarHeatmapChart } from './lib/CalendarHeatmapChart.js';
export type { CalendarHeatmapChartProps } from './lib/CalendarHeatmapChart.js';

// Group 2 batch 5 components.
export { CandlestickChart } from './lib/CandlestickChart.js';
export type { CandlestickChartProps } from './lib/CandlestickChart.js';
export { ExportMenu, rowsToCsv } from './lib/ExportMenu.js';
export type { ExportMenuProps } from './lib/ExportMenu.js';
export { ChartExport } from './lib/ChartExport.js';
export type { ChartExportProps, ChartExportTarget } from './lib/ChartExport.js';
export { ChordChart } from './lib/ChordChart.js';
export type { ChordChartProps } from './lib/ChordChart.js';
export { ChoroplethMap } from './lib/ChoroplethMap.js';
export type { ChoroplethMapProps } from './lib/ChoroplethMap.js';

// Group 3 batch 1 components.
export { ColumnPyramidChart } from './lib/ColumnPyramidChart.js';
export type { ColumnPyramidChartProps } from './lib/ColumnPyramidChart.js';
export { ColumnRangeChart } from './lib/ColumnRangeChart.js';
export type { ColumnRangeChartProps } from './lib/ColumnRangeChart.js';
export { ContourChart } from './lib/ContourChart.js';
export type { ContourChartProps } from './lib/ContourChart.js';
export { CorrelationMatrix } from './lib/CorrelationMatrix.js';
export type { CorrelationMatrixProps } from './lib/CorrelationMatrix.js';
export { DashboardActiveFilters } from './lib/DashboardActiveFilters.js';
export type { DashboardActiveFiltersProps } from './lib/DashboardActiveFilters.js';

// Group 3 batch 2 components.
export { DashboardFilterBar } from './lib/DashboardFilterBar.js';
export type { DashboardFilterBarProps, ActiveFilter, FilterControl, ExportConfig } from './lib/DashboardFilterBar.js';
export { DashboardGrid } from './lib/DashboardGrid.js';
export type { DashboardGridPanel, DashboardGridProps } from './lib/DashboardGrid.js';
export { DateRangeFilter, dateRangeToSpec } from './lib/DateRangeFilter.js';
export type { DateRangeFilterProps } from './lib/DateRangeFilter.js';
export { DecompositionTreeChart } from './lib/DecompositionTreeChart.js';
export type { DecompositionTreeChartProps } from './lib/DecompositionTreeChart.js';
export { Density2DChart } from './lib/Density2DChart.js';
export type { Density2DChartProps } from './lib/Density2DChart.js';

// Group 3 batch 3 components (includes TreemapChart required by DrillChart).
export { DependencyWheelChart } from './lib/DependencyWheelChart.js';
export type { DependencyWheelChartProps } from './lib/DependencyWheelChart.js';
export { DonutChart } from './lib/DonutChart.js';
export type { DonutChartProps } from './lib/DonutChart.js';
export { DrillBarChart } from './lib/DrillBarChart.js';
export type { DrillBarChartProps } from './lib/DrillBarChart.js';
export { DrillBreadcrumb } from './lib/DrillBreadcrumb.js';
export type { DrillBreadcrumbProps } from './lib/DrillBreadcrumb.js';
export { TreemapChart } from './lib/TreemapChart.js';
export type { TreemapChartProps } from './lib/TreemapChart.js';

// Group 3 batch 4 components.
export { DrillChart } from './lib/DrillChart.js';
export type { DrillChartProps, DrillChartKind } from './lib/DrillChart.js';
export { DumbbellChart } from './lib/DumbbellChart.js';
export type { DumbbellChartProps } from './lib/DumbbellChart.js';
export { ErrorBarsChart } from './lib/ErrorBarsChart.js';
export type { ErrorBarsChartProps } from './lib/ErrorBarsChart.js';
export { EventFeedPanel } from './lib/EventFeedPanel.js';
export type { EventFeedPanelProps } from './lib/EventFeedPanel.js';
export { FieldPane } from './lib/FieldPane.js';
export type { FieldPaneProps } from './lib/FieldPane.js';

// Group 3 batch 5 components.
export { FlamegraphChart } from './lib/FlamegraphChart.js';
export type { FlamegraphChartProps } from './lib/FlamegraphChart.js';
export { ForceGraph } from './lib/ForceGraph.js';
export type { ForceGraphProps } from './lib/ForceGraph.js';
export { ForecastLineChart } from './lib/ForecastLineChart.js';
export type { ForecastLineChartProps } from './lib/ForecastLineChart.js';
export { FormatPanel } from './lib/FormatPanel.js';
export type { FormatPanelProps } from './lib/FormatPanel.js';
export { FunnelChart } from './lib/FunnelChart.js';
export type { FunnelChartProps } from './lib/FunnelChart.js';
