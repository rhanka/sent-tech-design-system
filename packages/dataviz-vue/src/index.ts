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
export { QueryBar } from './lib/QueryBar.js';
export type { QueryBarProps } from './lib/QueryBar.js';
export { default as BookmarkNavigator } from './lib/BookmarkNavigator.vue';
export type { BookmarkNavigatorProps } from './lib/BookmarkNavigator.vue';
export { default as CalculationEditor } from './lib/CalculationEditor.vue';
export type { CalculationEditorProps } from './lib/CalculationEditor.vue';
export { default as FormatPanel } from './lib/FormatPanel.vue';
export type { FormatPanelProps } from './lib/FormatPanel.vue';
export { WebFrame, DataImage, ObjectLayerPanel } from './lib/ObjectLayers.js';
export type { WebFrameProps, DataImageProps, ObjectLayerPanelProps } from './lib/ObjectLayers.js';
export { SelectionLegend } from './lib/SelectionLegend.js';
export type { SelectionLegendProps } from './lib/SelectionLegend.js';
export { default as CrossfilteredBarChart } from './lib/CrossfilteredBarChart.vue';
export type { CrossfilteredBarChartProps } from './lib/CrossfilteredBarChart.vue';
export { ParetoChart } from './lib/ParetoChart.js';
export type { ParetoChartProps } from './lib/ParetoChart.js';
export { default as ComboChart } from './lib/ComboChart.vue';
export type { ComboChartProps } from './lib/ComboChart.vue';
export { default as DivergingBarChart } from './lib/DivergingBarChart.vue';
export type { DivergingBarChartProps } from './lib/DivergingBarChart.vue';
export { StackedBarChart } from './lib/StackedBarChart.js';
export type { StackedBarChartProps } from './lib/StackedBarChart.js';
export { LollipopChart } from './lib/LollipopChart.js';
export type { LollipopChartProps } from './lib/LollipopChart.js';
export { StepLineChart } from './lib/StepLineChart.js';
export type { StepLineChartProps } from './lib/StepLineChart.js';
export { default as AreaChart } from './lib/AreaChart.vue';
export type { AreaChartProps } from './lib/AreaChart.vue';
export { default as DonutChart } from './lib/DonutChart.vue';
export type { DonutChartProps } from './lib/DonutChart.vue';
export { default as FunnelChart } from './lib/FunnelChart.vue';
export type { FunnelChartProps } from './lib/FunnelChart.vue';
export { WaterfallChart } from './lib/WaterfallChart.js';
export type { WaterfallChartProps } from './lib/WaterfallChart.js';
export { MekkoChart } from './lib/MekkoChart.js';
export type { MekkoChartProps } from './lib/MekkoChart.js';
export { default as ChordChart } from './lib/ChordChart.vue';
export type { ChordChartProps } from './lib/ChordChart.vue';
export { RoseChart } from './lib/RoseChart.js';
export type { RoseChartProps } from './lib/RoseChart.js';
export { PackedBubbleChart } from './lib/PackedBubbleChart.js';
export type { PackedBubbleChartProps } from './lib/PackedBubbleChart.js';
export { TreemapChart } from './lib/TreemapChart.js';
export type { TreemapChartProps } from './lib/TreemapChart.js';
export { SunburstChart } from './lib/SunburstChart.js';
export type { SunburstChartProps } from './lib/SunburstChart.js';
export { SankeyChart } from './lib/SankeyChart.js';
export type { SankeyChartProps } from './lib/SankeyChart.js';
export { RadarChart } from './lib/RadarChart.js';
export type { RadarChartProps } from './lib/RadarChart.js';
export { default as DateHistogramChart } from './lib/DateHistogramChart.vue';
export type { DateHistogramChartProps, DateHistogramChartTone, DateHistogramLabelFormatter } from './lib/DateHistogramChart.vue';
export { default as BoxPlotChart } from './lib/BoxPlotChart.vue';
export type { BoxPlotChartProps } from './lib/BoxPlotChart.vue';
export { default as CalendarHeatmapChart } from './lib/CalendarHeatmapChart.vue';
export type { CalendarHeatmapChartProps } from './lib/CalendarHeatmapChart.vue';
export { default as BulletChart } from './lib/BulletChart.vue';
export type { BulletChartProps } from './lib/BulletChart.vue';
export { default as HistogramChart } from './lib/HistogramChart.vue';
export type { HistogramChartProps } from './lib/HistogramChart.vue';
export { default as HeatmapChart } from './lib/HeatmapChart.vue';
export type { HeatmapChartProps } from './lib/HeatmapChart.vue';
export { default as GaugeChart } from './lib/GaugeChart.vue';
export type { GaugeChartProps } from './lib/GaugeChart.vue';
export { ReferenceLineChart } from './lib/ReferenceLineChart.js';
export type { ReferenceLineChartProps } from './lib/ReferenceLineChart.js';
export { PercentileBandChart } from './lib/PercentileBandChart.js';
export type { PercentileBandChartProps } from './lib/PercentileBandChart.js';
export { TrendLineChart } from './lib/TrendLineChart.js';
export type { TrendLineChartProps } from './lib/TrendLineChart.js';
export { default as ForecastLineChart } from './lib/ForecastLineChart.vue';
export type { ForecastLineChartProps } from './lib/ForecastLineChart.vue';
export { default as ErrorBarsChart } from './lib/ErrorBarsChart.vue';
export type { ErrorBarsChartProps } from './lib/ErrorBarsChart.vue';
export { default as AnalyticsClusterPlot } from './lib/AnalyticsClusterPlot.vue';
export type { AnalyticsClusterPlotProps } from './lib/AnalyticsClusterPlot.vue';
export { ScatterPlot } from './lib/ScatterPlot.js';
export type { ScatterPlotProps } from './lib/ScatterPlot.js';
export { default as CandlestickChart } from './lib/CandlestickChart.vue';
export type { CandlestickChartProps } from './lib/CandlestickChart.vue';
export { StreamgraphChart } from './lib/StreamgraphChart.js';
export type { StreamgraphChartProps } from './lib/StreamgraphChart.js';
export { TileMapChart } from './lib/TileMapChart.js';
export type { TileMapChartProps } from './lib/TileMapChart.js';
export { OHLCChart } from './lib/OHLCChart.js';
export type { OHLCChartProps } from './lib/OHLCChart.js';
export { default as GanttChart } from './lib/GanttChart.vue';
export type { GanttChartProps } from './lib/GanttChart.vue';
export { TimelineChart } from './lib/TimelineChart.js';
export type { TimelineChartProps } from './lib/TimelineChart.js';
export { ViolinChart } from './lib/ViolinChart.js';
export type { ViolinChartProps } from './lib/ViolinChart.js';
export { default as BumpChart } from './lib/BumpChart.vue';
export type { BumpChartProps } from './lib/BumpChart.vue';
export { ParallelCoordinatesChart } from './lib/ParallelCoordinatesChart.js';
export type { ParallelCoordinatesChartProps } from './lib/ParallelCoordinatesChart.js';
export { default as AreaRangeChart } from './lib/AreaRangeChart.vue';
export type { AreaRangeChartProps } from './lib/AreaRangeChart.vue';
export { default as AreaSplineRangeChart } from './lib/AreaSplineRangeChart.vue';
export type { AreaSplineRangeChartProps } from './lib/AreaSplineRangeChart.vue';
export { default as ColumnRangeChart } from './lib/ColumnRangeChart.vue';
export type { ColumnRangeChartProps } from './lib/ColumnRangeChart.vue';
export { default as DumbbellChart } from './lib/DumbbellChart.vue';
export type { DumbbellChartProps } from './lib/DumbbellChart.vue';
export { VariablePieChart } from './lib/VariablePieChart.js';
export type { VariablePieChartProps } from './lib/VariablePieChart.js';
export { ItemChart } from './lib/ItemChart.js';
export type { ItemChartProps } from './lib/ItemChart.js';
export { default as ColumnPyramidChart } from './lib/ColumnPyramidChart.vue';
export type { ColumnPyramidChartProps } from './lib/ColumnPyramidChart.vue';
export { default as ArcDiagramChart } from './lib/ArcDiagramChart.vue';
export type { ArcDiagramChartProps } from './lib/ArcDiagramChart.vue';
export { default as ForceGraph } from './lib/ForceGraph.vue';
export type { ForceGraphProps } from './lib/ForceGraph.vue';
export { default as CorrelationMatrix } from './lib/CorrelationMatrix.vue';
export type { CorrelationMatrixProps } from './lib/CorrelationMatrix.vue';
export { default as DependencyWheelChart } from './lib/DependencyWheelChart.vue';
export type { DependencyWheelChartProps } from './lib/DependencyWheelChart.vue';
export { default as HeikinAshiChart } from './lib/HeikinAshiChart.vue';
export type { HeikinAshiChartProps } from './lib/HeikinAshiChart.vue';
export { default as HollowCandlestickChart } from './lib/HollowCandlestickChart.vue';
export type { HollowCandlestickChartProps } from './lib/HollowCandlestickChart.vue';
export { default as HLCChart } from './lib/HLCChart.vue';
export type { HLCChartProps } from './lib/HLCChart.vue';
export { ScatterPlotMatrix } from './lib/ScatterPlotMatrix.js';
export type { ScatterPlotMatrixProps } from './lib/ScatterPlotMatrix.js';
export { default as AnimatedBubbleChart } from './lib/AnimatedBubbleChart.vue';
export type { AnimatedBubbleChartProps } from './lib/AnimatedBubbleChart.vue';
export { StateTimelineChart } from './lib/StateTimelineChart.js';
export type { StateTimelineChartProps } from './lib/StateTimelineChart.js';
export { SolidGaugeChart } from './lib/SolidGaugeChart.js';
export type { SolidGaugeChartProps } from './lib/SolidGaugeChart.js';
export { StatusHistoryChart } from './lib/StatusHistoryChart.js';
export type { StatusHistoryChartProps } from './lib/StatusHistoryChart.js';
export { WaffleChart } from './lib/WaffleChart.js';
export type { WaffleChartProps } from './lib/WaffleChart.js';
export { RibbonChart } from './lib/RibbonChart.js';
export type { RibbonChartProps } from './lib/RibbonChart.js';
export { default as AnomalySwimLaneChart } from './lib/AnomalySwimLaneChart.vue';
export type { AnomalySwimLaneChartProps } from './lib/AnomalySwimLaneChart.vue';
export { default as FlamegraphChart } from './lib/FlamegraphChart.vue';
export type { FlamegraphChartProps } from './lib/FlamegraphChart.vue';
export { default as Density2DChart } from './lib/Density2DChart.vue';
export type { Density2DChartProps } from './lib/Density2DChart.vue';
export { TraceWaterfallChart } from './lib/TraceWaterfallChart.js';
export type { TraceWaterfallChartProps } from './lib/TraceWaterfallChart.js';
export { default as DecompositionTreeChart } from './lib/DecompositionTreeChart.vue';
export type { DecompositionTreeChartProps } from './lib/DecompositionTreeChart.vue';
export { default as EventFeedPanel } from './lib/EventFeedPanel.vue';
export type { EventFeedPanelProps } from './lib/EventFeedPanel.vue';
export { VectorFieldChart } from './lib/VectorFieldChart.js';
export type { VectorFieldChartProps } from './lib/VectorFieldChart.js';
export { default as ContourChart } from './lib/ContourChart.vue';
export type { ContourChartProps } from './lib/ContourChart.vue';
export { WindBarbChart } from './lib/WindBarbChart.js';
export type { WindBarbChartProps } from './lib/WindBarbChart.js';
export { RenkoChart } from './lib/RenkoChart.js';
export type { RenkoChartProps } from './lib/RenkoChart.js';
export { PointAndFigureChart } from './lib/PointAndFigureChart.js';
export type { PointAndFigureChartProps } from './lib/PointAndFigureChart.js';
export { default as PalettePicker } from './lib/PalettePicker.vue';
export type { PalettePickerProps } from './lib/PalettePicker.vue';
export { default as BellCurveChart } from './lib/BellCurveChart.vue';
export type { BellCurveChartProps } from './lib/BellCurveChart.vue';
export { OrganizationChart } from './lib/OrganizationChart.js';
export type { OrganizationChartProps } from './lib/OrganizationChart.js';
export { TreegraphChart } from './lib/TreegraphChart.js';
export type { TreegraphChartProps } from './lib/TreegraphChart.js';
export { VennChart } from './lib/VennChart.js';
export type { VennChartProps } from './lib/VennChart.js';
export { WordCloudChart } from './lib/WordCloudChart.js';
export type { WordCloudChartProps } from './lib/WordCloudChart.js';
export { PolygonChart } from './lib/PolygonChart.js';
export type { PolygonChartProps } from './lib/PolygonChart.js';
export { Sparkline } from './lib/Sparkline.js';
export type { SparklineProps, SparklineTone } from './lib/Sparkline.js';
export { default as ChoroplethMap } from './lib/ChoroplethMap.vue';
export type { ChoroplethMapProps } from './lib/ChoroplethMap.vue';
export { default as GeoPointMap } from './lib/GeoPointMap.vue';
export type { GeoPointMapProps } from './lib/GeoPointMap.vue';
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
export { PivotDataTable } from './lib/PivotDataTable.js';
export type { PivotDataTableProps } from './lib/PivotDataTable.js';
export { default as AdvancedPivotDataTable } from './lib/AdvancedPivotDataTable.vue';
export type { AdvancedPivotDataTableProps } from './lib/AdvancedPivotDataTable.vue';
export { KpiCardGroup } from './lib/KpiCardGroup.js';
export type { KpiCardGroupProps } from './lib/KpiCardGroup.js';
export { ScoreCard } from './lib/ScoreCard.js';
export type { ScoreCardProps } from './lib/ScoreCard.js';
export { RecordsTable } from './lib/RecordsTable.js';
export type { RecordsTableProps } from './lib/RecordsTable.js';
export { default as DrillBarChart } from './lib/DrillBarChart.vue';
export type { DrillBarChartProps } from './lib/DrillBarChart.vue';
export { default as DrillBreadcrumb } from './lib/DrillBreadcrumb.vue';
export type { DrillBreadcrumbProps } from './lib/DrillBreadcrumb.vue';
export { TopNFilter } from './lib/TopNFilter.js';
export type { TopNFilterProps } from './lib/TopNFilter.js';
export { ValueSlicer } from './lib/ValueSlicer.js';
export type { ValueSlicerProps } from './lib/ValueSlicer.js';
export { ExportMenu, rowsToCsv } from './lib/ExportMenu.js';
export { default as DateRangeFilter, dateRangeToSpec } from './lib/DateRangeFilter.vue';
export type { DateRangeFilterProps } from './lib/DateRangeFilter.vue';
export { default as ExportMenu, rowsToCsv } from './lib/ExportMenu.vue';
export type { ExportMenuProps } from './lib/ExportMenu.vue';
export { DateRangeFilter, dateRangeToSpec } from './lib/DateRangeFilter.js';
export {
  RelativeDateFilter,
  relativeRangeToSpec,
  DEFAULT_RELATIVE_PRESETS,
} from './lib/RelativeDateFilter.js';
export type { RelativeDateFilterProps, RelativeDatePreset } from './lib/RelativeDateFilter.js';
export { RangeSliderFilter, numericDomain, rangeBoundsToSpec } from './lib/RangeSliderFilter.js';
export type { RangeSliderFilterProps, NumericDomain } from './lib/RangeSliderFilter.js';
export { default as ChartExport, DEFAULT_EXPORT_LABELS } from './lib/ChartExport.vue';
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
