/**
 * @sentropic/dataviz-react
 *
 * React adapter + dashboard components for @sentropic/dataviz-core, built on
 * @sentropic/design-system-react. The adapter wires the core's observable store
 * onto React (`useSyncExternalStore`); the components compose design-system
 * presentational pieces where available, with lightweight SVG fallbacks for
 * chart types not exposed by the design system.
 */

// Adapter + full core surface re-export (incl. the core's `describeFilterSpec`).
export * from './adapter.js';

// Dashboard components (state consumers built on the design system).
export { DashboardActiveFilters } from './lib/DashboardActiveFilters.js';
export type { DashboardActiveFiltersProps } from './lib/DashboardActiveFilters.js';
export { DashboardFilterBar } from './lib/DashboardFilterBar.js';
export type { DashboardFilterBarProps, ActiveFilter, FilterControl, ExportConfig } from './lib/DashboardFilterBar.js';
export { DashboardGrid } from './lib/DashboardGrid.js';
export type { DashboardGridPanel, DashboardGridProps } from './lib/DashboardGrid.js';
export { QueryBar } from './lib/QueryBar.js';
export type { QueryBarProps } from './lib/QueryBar.js';
export { BookmarkNavigator } from './lib/BookmarkNavigator.js';
export type { BookmarkNavigatorProps } from './lib/BookmarkNavigator.js';
export { CalculationEditor } from './lib/CalculationEditor.js';
export type { CalculationEditorProps } from './lib/CalculationEditor.js';
export { FormatPanel } from './lib/FormatPanel.js';
export type { FormatPanelProps } from './lib/FormatPanel.js';
export { WebFrame, DataImage, ObjectLayerPanel } from './lib/ObjectLayers.js';
export type { WebFrameProps, DataImageProps, ObjectLayerPanelProps } from './lib/ObjectLayers.js';
export { SelectionLegend } from './lib/SelectionLegend.js';
export type { SelectionLegendProps } from './lib/SelectionLegend.js';
export { CrossfilteredBarChart } from './lib/CrossfilteredBarChart.js';
export type { CrossfilteredBarChartProps } from './lib/CrossfilteredBarChart.js';
export { ParetoChart } from './lib/ParetoChart.js';
export type { ParetoChartProps } from './lib/ParetoChart.js';
export { DivergingBarChart } from './lib/DivergingBarChart.js';
export type { DivergingBarChartProps } from './lib/DivergingBarChart.js';
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
export { DonutChart } from './lib/DonutChart.js';
export type { DonutChartProps } from './lib/DonutChart.js';
export { FunnelChart } from './lib/FunnelChart.js';
export type { FunnelChartProps } from './lib/FunnelChart.js';
export { WaterfallChart } from './lib/WaterfallChart.js';
export type { WaterfallChartProps } from './lib/WaterfallChart.js';
export { MekkoChart } from './lib/MekkoChart.js';
export type { MekkoChartProps } from './lib/MekkoChart.js';
export { ChordChart } from './lib/ChordChart.js';
export type { ChordChartProps } from './lib/ChordChart.js';
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
export { HistogramChart } from './lib/HistogramChart.js';
export type { HistogramChartProps } from './lib/HistogramChart.js';
export { DateHistogramChart } from './lib/DateHistogramChart.js';
export type { DateHistogramChartProps, DateHistogramChartTone, DateHistogramLabelFormatter } from './lib/DateHistogramChart.js';
export { BoxPlotChart } from './lib/BoxPlotChart.js';
export type { BoxPlotChartProps } from './lib/BoxPlotChart.js';
export { HeatmapChart } from './lib/HeatmapChart.js';
export type { HeatmapChartProps } from './lib/HeatmapChart.js';
export { CalendarHeatmapChart } from './lib/CalendarHeatmapChart.js';
export type { CalendarHeatmapChartProps } from './lib/CalendarHeatmapChart.js';
export { BulletChart } from './lib/BulletChart.js';
export type { BulletChartProps } from './lib/BulletChart.js';
export { GaugeChart } from './lib/GaugeChart.js';
export type { GaugeChartProps } from './lib/GaugeChart.js';
export { ReferenceLineChart } from './lib/ReferenceLineChart.js';
export type { ReferenceLineChartProps } from './lib/ReferenceLineChart.js';
export { PercentileBandChart } from './lib/PercentileBandChart.js';
export type { PercentileBandChartProps } from './lib/PercentileBandChart.js';
export { TrendLineChart } from './lib/TrendLineChart.js';
export type { TrendLineChartProps } from './lib/TrendLineChart.js';
export { ForecastLineChart } from './lib/ForecastLineChart.js';
export type { ForecastLineChartProps } from './lib/ForecastLineChart.js';
export { ErrorBarsChart } from './lib/ErrorBarsChart.js';
export type { ErrorBarsChartProps } from './lib/ErrorBarsChart.js';
export { AnalyticsClusterPlot } from './lib/AnalyticsClusterPlot.js';
export type { AnalyticsClusterPlotProps } from './lib/AnalyticsClusterPlot.js';
export { ScatterPlot } from './lib/ScatterPlot.js';
export type { ScatterPlotProps } from './lib/ScatterPlot.js';
export { CandlestickChart } from './lib/CandlestickChart.js';
export type { CandlestickChartProps } from './lib/CandlestickChart.js';
export { StreamgraphChart } from './lib/StreamgraphChart.js';
export type { StreamgraphChartProps } from './lib/StreamgraphChart.js';
export { TileMapChart } from './lib/TileMapChart.js';
export type { TileMapChartProps } from './lib/TileMapChart.js';
export { OHLCChart } from './lib/OHLCChart.js';
export type { OHLCChartProps } from './lib/OHLCChart.js';
export { GanttChart } from './lib/GanttChart.js';
export type { GanttChartProps } from './lib/GanttChart.js';
export { TimelineChart } from './lib/TimelineChart.js';
export type { TimelineChartProps } from './lib/TimelineChart.js';
export { ViolinChart } from './lib/ViolinChart.js';
export type { ViolinChartProps } from './lib/ViolinChart.js';
export { BumpChart } from './lib/BumpChart.js';
export type { BumpChartProps } from './lib/BumpChart.js';
export { ParallelCoordinatesChart } from './lib/ParallelCoordinatesChart.js';
export type { ParallelCoordinatesChartProps } from './lib/ParallelCoordinatesChart.js';
export { AreaRangeChart } from './lib/AreaRangeChart.js';
export type { AreaRangeChartProps } from './lib/AreaRangeChart.js';
export { AreaSplineRangeChart } from './lib/AreaSplineRangeChart.js';
export type { AreaSplineRangeChartProps } from './lib/AreaSplineRangeChart.js';
export { ColumnRangeChart } from './lib/ColumnRangeChart.js';
export type { ColumnRangeChartProps } from './lib/ColumnRangeChart.js';
export { DumbbellChart } from './lib/DumbbellChart.js';
export type { DumbbellChartProps } from './lib/DumbbellChart.js';
export { VariablePieChart } from './lib/VariablePieChart.js';
export type { VariablePieChartProps } from './lib/VariablePieChart.js';
export { ItemChart } from './lib/ItemChart.js';
export type { ItemChartProps } from './lib/ItemChart.js';
export { ColumnPyramidChart } from './lib/ColumnPyramidChart.js';
export type { ColumnPyramidChartProps } from './lib/ColumnPyramidChart.js';
export { ArcDiagramChart } from './lib/ArcDiagramChart.js';
export type { ArcDiagramChartProps } from './lib/ArcDiagramChart.js';
export { ForceGraph } from './lib/ForceGraph.js';
export type { ForceGraphProps } from './lib/ForceGraph.js';
export { DependencyWheelChart } from './lib/DependencyWheelChart.js';
export type { DependencyWheelChartProps } from './lib/DependencyWheelChart.js';
export { HeikinAshiChart } from './lib/HeikinAshiChart.js';
export type { HeikinAshiChartProps } from './lib/HeikinAshiChart.js';
export { HollowCandlestickChart } from './lib/HollowCandlestickChart.js';
export type { HollowCandlestickChartProps } from './lib/HollowCandlestickChart.js';
export { HLCChart } from './lib/HLCChart.js';
export type { HLCChartProps } from './lib/HLCChart.js';
export { CorrelationMatrix } from './lib/CorrelationMatrix.js';
export type { CorrelationMatrixProps } from './lib/CorrelationMatrix.js';
export { ScatterPlotMatrix } from './lib/ScatterPlotMatrix.js';
export type { ScatterPlotMatrixProps } from './lib/ScatterPlotMatrix.js';
export { AnimatedBubbleChart } from './lib/AnimatedBubbleChart.js';
export type { AnimatedBubbleChartProps } from './lib/AnimatedBubbleChart.js';
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
export { AnomalySwimLaneChart } from './lib/AnomalySwimLaneChart.js';
export type { AnomalySwimLaneChartProps } from './lib/AnomalySwimLaneChart.js';
export { FlamegraphChart } from './lib/FlamegraphChart.js';
export type { FlamegraphChartProps } from './lib/FlamegraphChart.js';
export { Density2DChart } from './lib/Density2DChart.js';
export type { Density2DChartProps } from './lib/Density2DChart.js';
export { TraceWaterfallChart } from './lib/TraceWaterfallChart.js';
export type { TraceWaterfallChartProps } from './lib/TraceWaterfallChart.js';
export { DecompositionTreeChart } from './lib/DecompositionTreeChart.js';
export type { DecompositionTreeChartProps } from './lib/DecompositionTreeChart.js';
export { EventFeedPanel } from './lib/EventFeedPanel.js';
export type { EventFeedPanelProps } from './lib/EventFeedPanel.js';
export { VectorFieldChart } from './lib/VectorFieldChart.js';
export type { VectorFieldChartProps } from './lib/VectorFieldChart.js';
export { ContourChart } from './lib/ContourChart.js';
export type { ContourChartProps } from './lib/ContourChart.js';
export { WindBarbChart } from './lib/WindBarbChart.js';
export type { WindBarbChartProps } from './lib/WindBarbChart.js';
export { RenkoChart } from './lib/RenkoChart.js';
export type { RenkoChartProps } from './lib/RenkoChart.js';
export { PointAndFigureChart } from './lib/PointAndFigureChart.js';
export type { PointAndFigureChartProps } from './lib/PointAndFigureChart.js';
export { PalettePicker } from './lib/PalettePicker.js';
export type { PalettePickerProps } from './lib/PalettePicker.js';
export { BellCurveChart } from './lib/BellCurveChart.js';
export type { BellCurveChartProps } from './lib/BellCurveChart.js';
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
export { GeoPointMap } from './lib/GeoPointMap.js';
export type { GeoPointMapProps } from './lib/GeoPointMap.js';
export { ChoroplethMap } from './lib/ChoroplethMap.js';
export type { ChoroplethMapProps } from './lib/ChoroplethMap.js';
export { GeoFlowMap } from './lib/GeoFlowMap.js';
export type { GeoFlowMapProps } from './lib/GeoFlowMap.js';
export { GeoHexbinMap } from './lib/GeoHexbinMap.js';
export type { GeoHexbinMapProps } from './lib/GeoHexbinMap.js';
export { GeoClusterMap } from './lib/GeoClusterMap.js';
export type { GeoClusterMapProps } from './lib/GeoClusterMap.js';
export { GeoDensityMap } from './lib/GeoDensityMap.js';
export type { GeoDensityMapProps } from './lib/GeoDensityMap.js';
export { GeoJsonMap } from './lib/GeoJsonMap.js';
export type { GeoJsonMapProps } from './lib/GeoJsonMap.js';
export { SmallMultiples } from './lib/SmallMultiples.js';
export type { SmallMultiplesProps } from './lib/SmallMultiples.js';
export { FieldPane } from './lib/FieldPane.js';
export type { FieldPaneProps } from './lib/FieldPane.js';
export { PivotDataTable } from './lib/PivotDataTable.js';
export type { PivotDataTableProps } from './lib/PivotDataTable.js';
export { AdvancedPivotDataTable } from './lib/AdvancedPivotDataTable.js';
export type { AdvancedPivotDataTableProps } from './lib/AdvancedPivotDataTable.js';
export { KpiCardGroup } from './lib/KpiCardGroup.js';
export type { KpiCardGroupProps } from './lib/KpiCardGroup.js';
export { ScoreCard } from './lib/ScoreCard.js';
export type { ScoreCardProps } from './lib/ScoreCard.js';
export { RecordsTable } from './lib/RecordsTable.js';
export type { RecordsTableProps } from './lib/RecordsTable.js';
export { DrillBarChart } from './lib/DrillBarChart.js';
export type { DrillBarChartProps } from './lib/DrillBarChart.js';
export { DrillBreadcrumb } from './lib/DrillBreadcrumb.js';
export type { DrillBreadcrumbProps } from './lib/DrillBreadcrumb.js';
export { TopNFilter } from './lib/TopNFilter.js';
export type { TopNFilterProps } from './lib/TopNFilter.js';
export { ValueSlicer } from './lib/ValueSlicer.js';
export type { ValueSlicerProps } from './lib/ValueSlicer.js';
export { ExportMenu, rowsToCsv } from './lib/ExportMenu.js';
export type { ExportMenuProps } from './lib/ExportMenu.js';
export { DateRangeFilter, dateRangeToSpec } from './lib/DateRangeFilter.js';
export type { DateRangeFilterProps } from './lib/DateRangeFilter.js';
export {
  RelativeDateFilter,
  relativeRangeToSpec,
  DEFAULT_RELATIVE_PRESETS,
} from './lib/RelativeDateFilter.js';
export type { RelativeDateFilterProps, RelativeDatePreset } from './lib/RelativeDateFilter.js';
export { RangeSliderFilter, numericDomain, rangeBoundsToSpec } from './lib/RangeSliderFilter.js';
export type { RangeSliderFilterProps, NumericDomain } from './lib/RangeSliderFilter.js';
export { ChartExport } from './lib/ChartExport.js';
export type { ChartExportProps, ChartExportTarget } from './lib/ChartExport.js';
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
export { DrillChart } from './lib/DrillChart.js';
export type { DrillChartProps, DrillChartKind } from './lib/DrillChart.js';
export { drillLevel, onDrillSelect, drillDepth } from './lib/drill.js';
export type { DrillLevel, DrillDatum } from './lib/drill.js';
