/**
 * @sentropic/dataviz-vue
 *
 * Vue 3 adapter + dashboard components for @sentropic/dataviz-core, built on
 * @sentropic/design-system-vue. The adapter wires the core's observable store
 * onto Vue reactivity (`shallowRef` + provide/inject); the components compose
 * design-system presentational pieces where available, with lightweight SVG
 * fallbacks for chart types not exposed by the design system.
 */

// Adapter + full core surface re-export (incl. the core's `describeFilterSpec`).
export * from './adapter.js';

// Dashboard components (state consumers built on the design system).
export { default as DashboardActiveFilters } from './lib/DashboardActiveFilters.vue';
export type { DashboardActiveFiltersProps } from './lib/DashboardActiveFilters.vue';
export { default as DashboardFilterBar } from './lib/DashboardFilterBar.vue';
export type { DashboardFilterBarProps, ActiveFilter, FilterControl, ExportConfig } from './lib/DashboardFilterBar.vue';
export { default as DashboardGrid } from './lib/DashboardGrid.vue';
export type { DashboardGridPanel, DashboardGridProps } from './lib/DashboardGrid.vue';
export { default as QueryBar } from './lib/QueryBar.vue';
export type { QueryBarProps } from './lib/QueryBar.vue';
export { default as BookmarkNavigator } from './lib/BookmarkNavigator.vue';
export type { BookmarkNavigatorProps } from './lib/BookmarkNavigator.vue';
export { default as CalculationEditor } from './lib/CalculationEditor.vue';
export type { CalculationEditorProps } from './lib/CalculationEditor.vue';
export { default as FormatPanel } from './lib/FormatPanel.vue';
export type { FormatPanelProps } from './lib/FormatPanel.vue';
export { default as WebFrame } from './lib/WebFrame.vue';
export { default as DataImage } from './lib/DataImage.vue';
export { default as ObjectLayerPanel } from './lib/ObjectLayerPanel.vue';
export type { WebFrameProps } from './lib/WebFrame.vue';
export type { DataImageProps } from './lib/DataImage.vue';
export type { ObjectLayerPanelProps } from './lib/ObjectLayerPanel.vue';
export { default as SelectionLegend } from './lib/SelectionLegend.vue';
export type { SelectionLegendProps } from './lib/SelectionLegend.vue';
export { default as CrossfilteredBarChart } from './lib/CrossfilteredBarChart.vue';
export type { CrossfilteredBarChartProps } from './lib/CrossfilteredBarChart.vue';
export { default as ParetoChart } from './lib/ParetoChart.vue';
export type { ParetoChartProps } from './lib/ParetoChart.vue';
export { default as DivergingBarChart } from './lib/DivergingBarChart.vue';
export type { DivergingBarChartProps } from './lib/DivergingBarChart.vue';
export { default as ComboChart } from './lib/ComboChart.vue';
export type { ComboChartProps } from './lib/ComboChart.vue';
export { default as StackedBarChart } from './lib/StackedBarChart.vue';
export type { StackedBarChartProps } from './lib/StackedBarChart.vue';
export { default as LollipopChart } from './lib/LollipopChart.vue';
export type { LollipopChartProps } from './lib/LollipopChart.vue';
export { default as StepLineChart } from './lib/StepLineChart.vue';
export type { StepLineChartProps } from './lib/StepLineChart.vue';
export { default as AreaChart } from './lib/AreaChart.vue';
export type { AreaChartProps } from './lib/AreaChart.vue';
export { default as DonutChart } from './lib/DonutChart.vue';
export type { DonutChartProps } from './lib/DonutChart.vue';
export { default as FunnelChart } from './lib/FunnelChart.vue';
export type { FunnelChartProps } from './lib/FunnelChart.vue';
export { default as WaterfallChart } from './lib/WaterfallChart.vue';
export type { WaterfallChartProps } from './lib/WaterfallChart.vue';
export { default as MekkoChart } from './lib/MekkoChart.vue';
export type { MekkoChartProps } from './lib/MekkoChart.vue';
export { default as ChordChart } from './lib/ChordChart.vue';
export type { ChordChartProps } from './lib/ChordChart.vue';
export { default as RoseChart } from './lib/RoseChart.vue';
export type { RoseChartProps } from './lib/RoseChart.vue';
export { default as PackedBubbleChart } from './lib/PackedBubbleChart.vue';
export type { PackedBubbleChartProps } from './lib/PackedBubbleChart.vue';
export { default as TreemapChart } from './lib/TreemapChart.vue';
export type { TreemapChartProps } from './lib/TreemapChart.vue';
export { default as SunburstChart } from './lib/SunburstChart.vue';
export type { SunburstChartProps } from './lib/SunburstChart.vue';
export { default as SankeyChart } from './lib/SankeyChart.vue';
export type { SankeyChartProps } from './lib/SankeyChart.vue';
export { default as RadarChart } from './lib/RadarChart.vue';
export type { RadarChartProps } from './lib/RadarChart.vue';
export { default as HistogramChart } from './lib/HistogramChart.vue';
export type { HistogramChartProps } from './lib/HistogramChart.vue';
export { default as DateHistogramChart } from './lib/DateHistogramChart.vue';
export type { DateHistogramChartProps, DateHistogramChartTone, DateHistogramLabelFormatter } from './lib/DateHistogramChart.vue';
export { default as BoxPlotChart } from './lib/BoxPlotChart.vue';
export type { BoxPlotChartProps } from './lib/BoxPlotChart.vue';
export { default as HeatmapChart } from './lib/HeatmapChart.vue';
export type { HeatmapChartProps } from './lib/HeatmapChart.vue';
export { default as CalendarHeatmapChart } from './lib/CalendarHeatmapChart.vue';
export type { CalendarHeatmapChartProps } from './lib/CalendarHeatmapChart.vue';
export { default as BulletChart } from './lib/BulletChart.vue';
export type { BulletChartProps } from './lib/BulletChart.vue';
export { default as GaugeChart } from './lib/GaugeChart.vue';
export type { GaugeChartProps } from './lib/GaugeChart.vue';
export { default as ReferenceLineChart } from './lib/ReferenceLineChart.vue';
export type { ReferenceLineChartProps } from './lib/ReferenceLineChart.vue';
export { default as PercentileBandChart } from './lib/PercentileBandChart.vue';
export type { PercentileBandChartProps } from './lib/PercentileBandChart.vue';
export { default as TrendLineChart } from './lib/TrendLineChart.vue';
export type { TrendLineChartProps } from './lib/TrendLineChart.vue';
export { default as ForecastLineChart } from './lib/ForecastLineChart.vue';
export type { ForecastLineChartProps } from './lib/ForecastLineChart.vue';
export { default as ErrorBarsChart } from './lib/ErrorBarsChart.vue';
export type { ErrorBarsChartProps } from './lib/ErrorBarsChart.vue';
export { default as AnalyticsClusterPlot } from './lib/AnalyticsClusterPlot.vue';
export type { AnalyticsClusterPlotProps } from './lib/AnalyticsClusterPlot.vue';
export { default as ScatterPlot } from './lib/ScatterPlot.vue';
export type { ScatterPlotProps } from './lib/ScatterPlot.vue';
export { default as CandlestickChart } from './lib/CandlestickChart.vue';
export type { CandlestickChartProps } from './lib/CandlestickChart.vue';
export { default as StreamgraphChart } from './lib/StreamgraphChart.vue';
export type { StreamgraphChartProps } from './lib/StreamgraphChart.vue';
export { default as TileMapChart } from './lib/TileMapChart.vue';
export type { TileMapChartProps } from './lib/TileMapChart.vue';
export { default as OHLCChart } from './lib/OHLCChart.vue';
export type { OHLCChartProps } from './lib/OHLCChart.vue';
export { default as GanttChart } from './lib/GanttChart.vue';
export type { GanttChartProps } from './lib/GanttChart.vue';
export { default as TimelineChart } from './lib/TimelineChart.vue';
export type { TimelineChartProps } from './lib/TimelineChart.vue';
export { default as ViolinChart } from './lib/ViolinChart.vue';
export type { ViolinChartProps } from './lib/ViolinChart.vue';
export { default as BumpChart } from './lib/BumpChart.vue';
export type { BumpChartProps } from './lib/BumpChart.vue';
export { default as ParallelCoordinatesChart } from './lib/ParallelCoordinatesChart.vue';
export type { ParallelCoordinatesChartProps } from './lib/ParallelCoordinatesChart.vue';
export { default as AreaRangeChart } from './lib/AreaRangeChart.vue';
export type { AreaRangeChartProps } from './lib/AreaRangeChart.vue';
export { default as AreaSplineRangeChart } from './lib/AreaSplineRangeChart.vue';
export type { AreaSplineRangeChartProps } from './lib/AreaSplineRangeChart.vue';
export { default as ColumnRangeChart } from './lib/ColumnRangeChart.vue';
export type { ColumnRangeChartProps } from './lib/ColumnRangeChart.vue';
export { default as DumbbellChart } from './lib/DumbbellChart.vue';
export type { DumbbellChartProps } from './lib/DumbbellChart.vue';
export { default as VariablePieChart } from './lib/VariablePieChart.vue';
export type { VariablePieChartProps } from './lib/VariablePieChart.vue';
export { default as ItemChart } from './lib/ItemChart.vue';
export type { ItemChartProps } from './lib/ItemChart.vue';
export { default as ColumnPyramidChart } from './lib/ColumnPyramidChart.vue';
export type { ColumnPyramidChartProps } from './lib/ColumnPyramidChart.vue';
export { default as ArcDiagramChart } from './lib/ArcDiagramChart.vue';
export type { ArcDiagramChartProps } from './lib/ArcDiagramChart.vue';
export { default as ForceGraph } from './lib/ForceGraph.vue';
export type { ForceGraphProps } from './lib/ForceGraph.vue';
export { default as DependencyWheelChart } from './lib/DependencyWheelChart.vue';
export type { DependencyWheelChartProps } from './lib/DependencyWheelChart.vue';
export { default as HeikinAshiChart } from './lib/HeikinAshiChart.vue';
export type { HeikinAshiChartProps } from './lib/HeikinAshiChart.vue';
export { default as HollowCandlestickChart } from './lib/HollowCandlestickChart.vue';
export type { HollowCandlestickChartProps } from './lib/HollowCandlestickChart.vue';
export { default as HLCChart } from './lib/HLCChart.vue';
export type { HLCChartProps } from './lib/HLCChart.vue';
export { default as CorrelationMatrix } from './lib/CorrelationMatrix.vue';
export type { CorrelationMatrixProps } from './lib/CorrelationMatrix.vue';
export { default as ScatterPlotMatrix } from './lib/ScatterPlotMatrix.vue';
export type { ScatterPlotMatrixProps } from './lib/ScatterPlotMatrix.vue';
export { default as AnimatedBubbleChart } from './lib/AnimatedBubbleChart.vue';
export type { AnimatedBubbleChartProps } from './lib/AnimatedBubbleChart.vue';
export { default as StateTimelineChart } from './lib/StateTimelineChart.vue';
export type { StateTimelineChartProps } from './lib/StateTimelineChart.vue';
export { default as SolidGaugeChart } from './lib/SolidGaugeChart.vue';
export type { SolidGaugeChartProps } from './lib/SolidGaugeChart.vue';
export { default as StatusHistoryChart } from './lib/StatusHistoryChart.vue';
export type { StatusHistoryChartProps } from './lib/StatusHistoryChart.vue';
export { default as WaffleChart } from './lib/WaffleChart.vue';
export type { WaffleChartProps } from './lib/WaffleChart.vue';
export { default as RibbonChart } from './lib/RibbonChart.vue';
export type { RibbonChartProps } from './lib/RibbonChart.vue';
export { default as AnomalySwimLaneChart } from './lib/AnomalySwimLaneChart.vue';
export type { AnomalySwimLaneChartProps } from './lib/AnomalySwimLaneChart.vue';
export { default as FlamegraphChart } from './lib/FlamegraphChart.vue';
export type { FlamegraphChartProps } from './lib/FlamegraphChart.vue';
export { default as Density2DChart } from './lib/Density2DChart.vue';
export type { Density2DChartProps } from './lib/Density2DChart.vue';
export { default as TraceWaterfallChart } from './lib/TraceWaterfallChart.vue';
export type { TraceWaterfallChartProps } from './lib/TraceWaterfallChart.vue';
export { default as DecompositionTreeChart } from './lib/DecompositionTreeChart.vue';
export type { DecompositionTreeChartProps } from './lib/DecompositionTreeChart.vue';
export { default as EventFeedPanel } from './lib/EventFeedPanel.vue';
export type { EventFeedPanelProps } from './lib/EventFeedPanel.vue';
export { default as VectorFieldChart } from './lib/VectorFieldChart.vue';
export type { VectorFieldChartProps } from './lib/VectorFieldChart.vue';
export { default as ContourChart } from './lib/ContourChart.vue';
export type { ContourChartProps } from './lib/ContourChart.vue';
export { default as WindBarbChart } from './lib/WindBarbChart.vue';
export type { WindBarbChartProps } from './lib/WindBarbChart.vue';
export { default as RenkoChart } from './lib/RenkoChart.vue';
export type { RenkoChartProps } from './lib/RenkoChart.vue';
export { default as PointAndFigureChart } from './lib/PointAndFigureChart.vue';
export type { PointAndFigureChartProps } from './lib/PointAndFigureChart.vue';
export { default as PalettePicker } from './lib/PalettePicker.vue';
export type { PalettePickerProps } from './lib/PalettePicker.vue';
export { default as BellCurveChart } from './lib/BellCurveChart.vue';
export type { BellCurveChartProps } from './lib/BellCurveChart.vue';
export { default as OrganizationChart } from './lib/OrganizationChart.vue';
export type { OrganizationChartProps } from './lib/OrganizationChart.vue';
export { default as TreegraphChart } from './lib/TreegraphChart.vue';
export type { TreegraphChartProps } from './lib/TreegraphChart.vue';
export { default as VennChart } from './lib/VennChart.vue';
export type { VennChartProps } from './lib/VennChart.vue';
export { default as WordCloudChart } from './lib/WordCloudChart.vue';
export type { WordCloudChartProps } from './lib/WordCloudChart.vue';
export { default as PolygonChart } from './lib/PolygonChart.vue';
export type { PolygonChartProps } from './lib/PolygonChart.vue';
export { default as Sparkline } from './lib/Sparkline.vue';
export type { SparklineProps, SparklineTone } from './lib/Sparkline.vue';
export { default as GeoPointMap } from './lib/GeoPointMap.vue';
export type { GeoPointMapProps } from './lib/GeoPointMap.vue';
export { default as ChoroplethMap } from './lib/ChoroplethMap.vue';
export type { ChoroplethMapProps } from './lib/ChoroplethMap.vue';
export { default as GeoFlowMap } from './lib/GeoFlowMap.vue';
export type { GeoFlowMapProps } from './lib/GeoFlowMap.vue';
export { default as GeoHexbinMap } from './lib/GeoHexbinMap.vue';
export type { GeoHexbinMapProps } from './lib/GeoHexbinMap.vue';
export { default as GeoClusterMap } from './lib/GeoClusterMap.vue';
export type { GeoClusterMapProps } from './lib/GeoClusterMap.vue';
export { default as GeoDensityMap } from './lib/GeoDensityMap.vue';
export type { GeoDensityMapProps } from './lib/GeoDensityMap.vue';
export { default as GeoJsonMap } from './lib/GeoJsonMap.vue';
export type { GeoJsonMapProps } from './lib/GeoJsonMap.vue';
export { default as SmallMultiples } from './lib/SmallMultiples.vue';
export type { SmallMultiplesProps } from './lib/SmallMultiples.vue';
export { default as FieldPane } from './lib/FieldPane.vue';
export type { FieldPaneProps } from './lib/FieldPane.vue';
export { default as PivotDataTable } from './lib/PivotDataTable.vue';
export type { PivotDataTableProps } from './lib/PivotDataTable.vue';
export { default as AdvancedPivotDataTable } from './lib/AdvancedPivotDataTable.vue';
export type { AdvancedPivotDataTableProps } from './lib/AdvancedPivotDataTable.vue';
export { default as KpiCardGroup } from './lib/KpiCardGroup.vue';
export type { KpiCardGroupProps } from './lib/KpiCardGroup.vue';
export { default as ScoreCard } from './lib/ScoreCard.vue';
export type { ScoreCardProps } from './lib/ScoreCard.vue';
export { default as RecordsTable } from './lib/RecordsTable.vue';
export type { RecordsTableProps } from './lib/RecordsTable.vue';
export { default as DrillBarChart } from './lib/DrillBarChart.vue';
export type { DrillBarChartProps } from './lib/DrillBarChart.vue';
export { default as DrillBreadcrumb } from './lib/DrillBreadcrumb.vue';
export type { DrillBreadcrumbProps } from './lib/DrillBreadcrumb.vue';
export { default as TopNFilter } from './lib/TopNFilter.vue';
export type { TopNFilterProps } from './lib/TopNFilter.vue';
export { default as ValueSlicer } from './lib/ValueSlicer.vue';
export type { ValueSlicerProps } from './lib/ValueSlicer.vue';
export { default as ExportMenu, rowsToCsv } from './lib/ExportMenu.vue';
export type { ExportMenuProps } from './lib/ExportMenu.vue';
export { default as DateRangeFilter, dateRangeToSpec } from './lib/DateRangeFilter.vue';
export type { DateRangeFilterProps } from './lib/DateRangeFilter.vue';
export { default as RelativeDateFilter, relativeRangeToSpec, DEFAULT_RELATIVE_PRESETS } from './lib/RelativeDateFilter.vue';
export type { RelativeDateFilterProps, RelativeDatePreset } from './lib/RelativeDateFilter.vue';
export { default as RangeSliderFilter, numericDomain, rangeBoundsToSpec } from './lib/RangeSliderFilter.vue';
export type { RangeSliderFilterProps, NumericDomain } from './lib/RangeSliderFilter.vue';
export { default as ChartExport } from './lib/ChartExport.vue';
export type { ChartExportProps, ChartExportTarget } from './lib/ChartExport.vue';
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
export { default as DrillChart } from './lib/DrillChart.vue';
export type { DrillChartProps, DrillChartKind } from './lib/DrillChart.vue';
export { drillLevel, onDrillSelect, drillDepth } from './lib/drill.js';
export type { DrillLevel, DrillDatum } from './lib/drill.js';
