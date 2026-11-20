// React leg only. Proves that the existing `dataviz-react` tests of this run
// exercise the modules EMITTED from the single JSX source, not their
// hand-written twins: the module-level switch of `vitest.react.config.ts`
// applies to importers inside `dataviz-react/src`, so the barrel resolves to
// the emission while this file can still reach the hand-written module.
import { describe, expect, it } from "vitest";
import * as barrel from "../../dataviz-react/src/index.js";
import * as handWrittenAdapter from "../../dataviz-react/src/adapter.js";
import * as handWrittenAreaChart from "../../dataviz-react/src/lib/AreaChart.js";
import * as handWrittenComboChart from "../../dataviz-react/src/lib/ComboChart.js";
import * as handWrittenCrossfilteredBarChart from "../../dataviz-react/src/lib/CrossfilteredBarChart.js";
import * as handWrittenDateHistogramChart from "../../dataviz-react/src/lib/DateHistogramChart.js";
import * as handWrittenDivergingBarChart from "../../dataviz-react/src/lib/DivergingBarChart.js";
import * as handWrittenDrill from "../../dataviz-react/src/lib/drill.js";
import * as handWrittenLollipopChart from "../../dataviz-react/src/lib/LollipopChart.js";
import * as handWrittenParetoChart from "../../dataviz-react/src/lib/ParetoChart.js";
import * as handWrittenStackedBarChart from "../../dataviz-react/src/lib/StackedBarChart.js";
import * as handWrittenStepLineChart from "../../dataviz-react/src/lib/StepLineChart.js";
import * as handWrittenTimeSeriesLineChart from "../../dataviz-react/src/lib/TimeSeriesLineChart.js";
import * as handWrittenCategoricalData from "../../dataviz-react/src/lib/categoricalData.js";
import * as handWrittenDistributionData from "../../dataviz-react/src/lib/distributionData.js";
import * as handWrittenPartOfWholeData from "../../dataviz-react/src/lib/partOfWholeData.js";
import * as handWrittenAdvancedPivotData from "../../dataviz-react/src/lib/advancedPivotData.js";
import * as handWrittenAnalyticsDsData from "../../dataviz-react/src/lib/analyticsDsData.js";
import * as handWrittenChartExport from "../../dataviz-react/src/lib/chart-export.js";
import * as handWrittenGeoMapLayers from "../../dataviz-react/src/lib/geoMapLayers.js";
import * as handWrittenUrlSync from "../../dataviz-react/src/lib/url-sync.js";
import * as handWrittenUseUrlSync from "../../dataviz-react/src/lib/useUrlSync.js";
import * as handWrittenAdvancedPivotDataTable from "../../dataviz-react/src/lib/AdvancedPivotDataTable.js";
import * as handWrittenAnalyticsClusterPlot from "../../dataviz-react/src/lib/AnalyticsClusterPlot.js";
import * as handWrittenAnimatedBubbleChart from "../../dataviz-react/src/lib/AnimatedBubbleChart.js";
import * as handWrittenAnomalySwimLaneChart from "../../dataviz-react/src/lib/AnomalySwimLaneChart.js";
import * as handWrittenArcDiagramChart from "../../dataviz-react/src/lib/ArcDiagramChart.js";
import * as handWrittenAreaRangeChart from "../../dataviz-react/src/lib/AreaRangeChart.js";
import * as handWrittenAreaSplineRangeChart from "../../dataviz-react/src/lib/AreaSplineRangeChart.js";
import * as handWrittenBellCurveChart from "../../dataviz-react/src/lib/BellCurveChart.js";
import * as handWrittenBookmarkNavigator from "../../dataviz-react/src/lib/BookmarkNavigator.js";
import * as handWrittenBoxPlotChart from "../../dataviz-react/src/lib/BoxPlotChart.js";
import * as handWrittenBulletChart from "../../dataviz-react/src/lib/BulletChart.js";
import * as handWrittenBumpChart from "../../dataviz-react/src/lib/BumpChart.js";
import * as handWrittenCalculationEditor from "../../dataviz-react/src/lib/CalculationEditor.js";
import * as handWrittenCalendarHeatmapChart from "../../dataviz-react/src/lib/CalendarHeatmapChart.js";
import * as handWrittenCandlestickChart from "../../dataviz-react/src/lib/CandlestickChart.js";
import * as handWrittenExportMenu from "../../dataviz-react/src/lib/ExportMenu.js";
import * as handWrittenChartExportComponent from "../../dataviz-react/src/lib/ChartExport.js";
import * as handWrittenChordChart from "../../dataviz-react/src/lib/ChordChart.js";
import * as handWrittenChoroplethMap from "../../dataviz-react/src/lib/ChoroplethMap.js";
import * as handWrittenColumnPyramidChart from "../../dataviz-react/src/lib/ColumnPyramidChart.js";
import * as handWrittenColumnRangeChart from "../../dataviz-react/src/lib/ColumnRangeChart.js";
import * as handWrittenContourChart from "../../dataviz-react/src/lib/ContourChart.js";
import * as handWrittenCorrelationMatrix from "../../dataviz-react/src/lib/CorrelationMatrix.js";
import * as handWrittenDashboardActiveFilters from "../../dataviz-react/src/lib/DashboardActiveFilters.js";
import * as handWrittenDashboardFilterBar from "../../dataviz-react/src/lib/DashboardFilterBar.js";
import * as handWrittenDashboardGrid from "../../dataviz-react/src/lib/DashboardGrid.js";
import * as handWrittenDateRangeFilter from "../../dataviz-react/src/lib/DateRangeFilter.js";
import * as handWrittenDecompositionTreeChart from "../../dataviz-react/src/lib/DecompositionTreeChart.js";
import * as handWrittenDensity2DChart from "../../dataviz-react/src/lib/Density2DChart.js";
import * as handWrittenDependencyWheelChart from "../../dataviz-react/src/lib/DependencyWheelChart.js";
import * as handWrittenDonutChart from "../../dataviz-react/src/lib/DonutChart.js";
import * as handWrittenDrillBarChart from "../../dataviz-react/src/lib/DrillBarChart.js";
import * as handWrittenDrillBreadcrumb from "../../dataviz-react/src/lib/DrillBreadcrumb.js";
import * as handWrittenTreemapChart from "../../dataviz-react/src/lib/TreemapChart.js";
import * as handWrittenDrillChart from "../../dataviz-react/src/lib/DrillChart.js";
import * as handWrittenDumbbellChart from "../../dataviz-react/src/lib/DumbbellChart.js";
import * as handWrittenErrorBarsChart from "../../dataviz-react/src/lib/ErrorBarsChart.js";
import * as handWrittenEventFeedPanel from "../../dataviz-react/src/lib/EventFeedPanel.js";
import * as handWrittenFieldPane from "../../dataviz-react/src/lib/FieldPane.js";
import * as handWrittenFlamegraphChart from "../../dataviz-react/src/lib/FlamegraphChart.js";
import * as handWrittenForceGraph from "../../dataviz-react/src/lib/ForceGraph.js";
import * as handWrittenForecastLineChart from "../../dataviz-react/src/lib/ForecastLineChart.js";
import * as handWrittenFormatPanel from "../../dataviz-react/src/lib/FormatPanel.js";
import * as handWrittenFunnelChart from "../../dataviz-react/src/lib/FunnelChart.js";
import * as handWrittenGanttChart from "../../dataviz-react/src/lib/GanttChart.js";
import * as handWrittenGaugeChart from "../../dataviz-react/src/lib/GaugeChart.js";
import * as handWrittenGeoClusterMap from "../../dataviz-react/src/lib/GeoClusterMap.js";
import * as handWrittenGeoDensityMap from "../../dataviz-react/src/lib/GeoDensityMap.js";
import * as handWrittenGeoFlowMap from "../../dataviz-react/src/lib/GeoFlowMap.js";
import * as handWrittenGeoHexbinMap from "../../dataviz-react/src/lib/GeoHexbinMap.js";
import * as handWrittenGeoJsonMap from "../../dataviz-react/src/lib/GeoJsonMap.js";
import * as handWrittenGeoPointMap from "../../dataviz-react/src/lib/GeoPointMap.js";
import * as handWrittenHLCChart from "../../dataviz-react/src/lib/HLCChart.js";
import * as handWrittenHeatmapChart from "../../dataviz-react/src/lib/HeatmapChart.js";
import * as handWrittenHeikinAshiChart from "../../dataviz-react/src/lib/HeikinAshiChart.js";
import * as handWrittenHistogramChart from "../../dataviz-react/src/lib/HistogramChart.js";
import * as handWrittenHollowCandlestickChart from "../../dataviz-react/src/lib/HollowCandlestickChart.js";
import * as handWrittenItemChart from "../../dataviz-react/src/lib/ItemChart.js";
import * as handWrittenKpiCardGroup from "../../dataviz-react/src/lib/KpiCardGroup.js";
import * as handWrittenMekkoChart from "../../dataviz-react/src/lib/MekkoChart.js";
import * as handWrittenOHLCChart from "../../dataviz-react/src/lib/OHLCChart.js";
import * as handWrittenObjectLayers from "../../dataviz-react/src/lib/ObjectLayers.js";
import * as handWrittenOrganizationChart from "../../dataviz-react/src/lib/OrganizationChart.js";
import * as handWrittenPackedBubbleChart from "../../dataviz-react/src/lib/PackedBubbleChart.js";
import * as handWrittenPalettePicker from "../../dataviz-react/src/lib/PalettePicker.js";
import * as handWrittenParallelCoordinatesChart from "../../dataviz-react/src/lib/ParallelCoordinatesChart.js";
import * as handWrittenPercentileBandChart from "../../dataviz-react/src/lib/PercentileBandChart.js";
import * as handWrittenPivotDataTable from "../../dataviz-react/src/lib/PivotDataTable.js";
import * as handWrittenPointAndFigureChart from "../../dataviz-react/src/lib/PointAndFigureChart.js";
import * as handWrittenPolygonChart from "../../dataviz-react/src/lib/PolygonChart.js";
import * as handWrittenQueryBar from "../../dataviz-react/src/lib/QueryBar.js";
import * as handWrittenRadarChart from "../../dataviz-react/src/lib/RadarChart.js";
import * as handWrittenRangeSliderFilter from "../../dataviz-react/src/lib/RangeSliderFilter.js";
import * as handWrittenRecordsTable from "../../dataviz-react/src/lib/RecordsTable.js";
import * as handWrittenReferenceLineChart from "../../dataviz-react/src/lib/ReferenceLineChart.js";
import * as handWrittenRelativeDateFilter from "../../dataviz-react/src/lib/RelativeDateFilter.js";
import * as handWrittenRenkoChart from "../../dataviz-react/src/lib/RenkoChart.js";
import * as handWrittenRibbonChart from "../../dataviz-react/src/lib/RibbonChart.js";
import * as handWrittenRoseChart from "../../dataviz-react/src/lib/RoseChart.js";
import * as handWrittenSankeyChart from "../../dataviz-react/src/lib/SankeyChart.js";
import * as handWrittenScatterPlot from "../../dataviz-react/src/lib/ScatterPlot.js";
import * as handWrittenScatterPlotMatrix from "../../dataviz-react/src/lib/ScatterPlotMatrix.js";
import * as handWrittenScoreCard from "../../dataviz-react/src/lib/ScoreCard.js";
import * as handWrittenSelectionLegend from "../../dataviz-react/src/lib/SelectionLegend.js";
import * as handWrittenSmallMultiples from "../../dataviz-react/src/lib/SmallMultiples.js";
import * as handWrittenSolidGaugeChart from "../../dataviz-react/src/lib/SolidGaugeChart.js";
import * as handWrittenSparkline from "../../dataviz-react/src/lib/Sparkline.js";
import * as handWrittenStateTimelineChart from "../../dataviz-react/src/lib/StateTimelineChart.js";
import * as handWrittenStatusHistoryChart from "../../dataviz-react/src/lib/StatusHistoryChart.js";
import * as handWrittenStreamgraphChart from "../../dataviz-react/src/lib/StreamgraphChart.js";
import * as handWrittenSunburstChart from "../../dataviz-react/src/lib/SunburstChart.js";
import * as handWrittenTileMapChart from "../../dataviz-react/src/lib/TileMapChart.js";
import * as handWrittenTimelineChart from "../../dataviz-react/src/lib/TimelineChart.js";
import * as handWrittenTopNFilter from "../../dataviz-react/src/lib/TopNFilter.js";
import * as handWrittenTraceWaterfallChart from "../../dataviz-react/src/lib/TraceWaterfallChart.js";
import * as handWrittenTreegraphChart from "../../dataviz-react/src/lib/TreegraphChart.js";
import * as handWrittenTrendLineChart from "../../dataviz-react/src/lib/TrendLineChart.js";
import * as handWrittenValueSlicer from "../../dataviz-react/src/lib/ValueSlicer.js";
import * as handWrittenVariablePieChart from "../../dataviz-react/src/lib/VariablePieChart.js";
import * as handWrittenVectorFieldChart from "../../dataviz-react/src/lib/VectorFieldChart.js";
import * as handWrittenVennChart from "../../dataviz-react/src/lib/VennChart.js";
import * as handWrittenViolinChart from "../../dataviz-react/src/lib/ViolinChart.js";
import * as handWrittenWaffleChart from "../../dataviz-react/src/lib/WaffleChart.js";
import * as handWrittenWaterfallChart from "../../dataviz-react/src/lib/WaterfallChart.js";
import * as emitted from "../.react-emit/src/index.js";
import * as emittedCategoricalData from "../.react-emit/src/lib/categoricalData.js";
import * as emittedDistributionData from "../.react-emit/src/lib/distributionData.js";
import * as emittedPartOfWholeData from "../.react-emit/src/lib/partOfWholeData.js";
import * as emittedAdvancedPivotData from "../.react-emit/src/lib/advancedPivotData.js";
import * as emittedAnalyticsDsData from "../.react-emit/src/lib/analyticsDsData.js";
import * as emittedChartExport from "../.react-emit/src/lib/chart-export.js";
import * as emittedChartExportComponent from "../.react-emit/src/lib/ChartExport.js";
import * as emittedGeoMapLayers from "../.react-emit/src/lib/geoMapLayers.js";

const switched = [
  "useDashboard",
  "drillLevel",
  "onDrillSelect",
  "drillDepth",
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
  "serializeSvg",
  "svgStringToBlob",
  "svgStringToPngBlob",
  "downloadBlob",
  "downloadSvg",
  "downloadPng",
  "printElement",
  "stateToQuery",
  "queryToState",
  "applyStateToStore",
  "readStateFromUrl",
  "writeStateToUrl",
  "readLocationSearch",
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
  "rowsToCsv",
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
  "dateRangeToSpec",
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
  "WebFrame",
  "DataImage",
  "ObjectLayerPanel",
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
  "numericDomain",
  "rangeBoundsToSpec",
  "RecordsTable",
  "ReferenceLineChart",
  "RelativeDateFilter",
  "relativeRangeToSpec",
  "DEFAULT_RELATIVE_PRESETS",
  "RenkoChart",
  "RibbonChart",
  "RoseChart",
  "SankeyChart",
  "ScatterPlot",
  "ScatterPlotMatrix",
  "ScoreCard",
  "SelectionLegend",
  "SmallMultiples",
  "SolidGaugeChart",
  "Sparkline",
  "StateTimelineChart",
  "StatusHistoryChart",
  "StreamgraphChart",
  "SunburstChart",
  "TileMapChart",
  "TimelineChart",
  "TopNFilter",
  "TraceWaterfallChart",
  "TreegraphChart",
  "TrendLineChart",
  "ValueSlicer",
  "VariablePieChart",
  "VectorFieldChart",
  "VennChart",
  "ViolinChart",
  "WaffleChart",
  "WaterfallChart",
] as const;

const handWritten: Record<(typeof switched)[number], unknown> = {
  useDashboard: handWrittenAdapter.useDashboard,
  drillLevel: handWrittenDrill.drillLevel,
  onDrillSelect: handWrittenDrill.onDrillSelect,
  drillDepth: handWrittenDrill.drillDepth,
  AreaChart: handWrittenAreaChart.AreaChart,
  ComboChart: handWrittenComboChart.ComboChart,
  LollipopChart: handWrittenLollipopChart.LollipopChart,
  StackedBarChart: handWrittenStackedBarChart.StackedBarChart,
  StepLineChart: handWrittenStepLineChart.StepLineChart,
  CrossfilteredBarChart: handWrittenCrossfilteredBarChart.CrossfilteredBarChart,
  TimeSeriesLineChart: handWrittenTimeSeriesLineChart.TimeSeriesLineChart,
  DivergingBarChart: handWrittenDivergingBarChart.DivergingBarChart,
  ParetoChart: handWrittenParetoChart.ParetoChart,
  DateHistogramChart: handWrittenDateHistogramChart.DateHistogramChart,
  serializeSvg: handWrittenChartExport.serializeSvg,
  svgStringToBlob: handWrittenChartExport.svgStringToBlob,
  svgStringToPngBlob: handWrittenChartExport.svgStringToPngBlob,
  downloadBlob: handWrittenChartExport.downloadBlob,
  downloadSvg: handWrittenChartExport.downloadSvg,
  downloadPng: handWrittenChartExport.downloadPng,
  printElement: handWrittenChartExport.printElement,
  stateToQuery: handWrittenUrlSync.stateToQuery,
  queryToState: handWrittenUrlSync.queryToState,
  applyStateToStore: handWrittenUrlSync.applyStateToStore,
  readStateFromUrl: handWrittenUrlSync.readStateFromUrl,
  writeStateToUrl: handWrittenUrlSync.writeStateToUrl,
  readLocationSearch: handWrittenUrlSync.readLocationSearch,
  useUrlSync: handWrittenUseUrlSync.useUrlSync,
  AdvancedPivotDataTable: handWrittenAdvancedPivotDataTable.AdvancedPivotDataTable,
  AnalyticsClusterPlot: handWrittenAnalyticsClusterPlot.AnalyticsClusterPlot,
  AnimatedBubbleChart: handWrittenAnimatedBubbleChart.AnimatedBubbleChart,
  AnomalySwimLaneChart: handWrittenAnomalySwimLaneChart.AnomalySwimLaneChart,
  ArcDiagramChart: handWrittenArcDiagramChart.ArcDiagramChart,
  AreaRangeChart: handWrittenAreaRangeChart.AreaRangeChart,
  AreaSplineRangeChart: handWrittenAreaSplineRangeChart.AreaSplineRangeChart,
  BellCurveChart: handWrittenBellCurveChart.BellCurveChart,
  BookmarkNavigator: handWrittenBookmarkNavigator.BookmarkNavigator,
  BoxPlotChart: handWrittenBoxPlotChart.BoxPlotChart,
  BulletChart: handWrittenBulletChart.BulletChart,
  BumpChart: handWrittenBumpChart.BumpChart,
  CalculationEditor: handWrittenCalculationEditor.CalculationEditor,
  CalendarHeatmapChart: handWrittenCalendarHeatmapChart.CalendarHeatmapChart,
  CandlestickChart: handWrittenCandlestickChart.CandlestickChart,
  ExportMenu: handWrittenExportMenu.ExportMenu,
  rowsToCsv: handWrittenExportMenu.rowsToCsv,
  ChartExport: handWrittenChartExportComponent.ChartExport,
  ChordChart: handWrittenChordChart.ChordChart,
  ChoroplethMap: handWrittenChoroplethMap.ChoroplethMap,
  ColumnPyramidChart: handWrittenColumnPyramidChart.ColumnPyramidChart,
  ColumnRangeChart: handWrittenColumnRangeChart.ColumnRangeChart,
  ContourChart: handWrittenContourChart.ContourChart,
  CorrelationMatrix: handWrittenCorrelationMatrix.CorrelationMatrix,
  DashboardActiveFilters: handWrittenDashboardActiveFilters.DashboardActiveFilters,
  DashboardFilterBar: handWrittenDashboardFilterBar.DashboardFilterBar,
  DashboardGrid: handWrittenDashboardGrid.DashboardGrid,
  DateRangeFilter: handWrittenDateRangeFilter.DateRangeFilter,
  dateRangeToSpec: handWrittenDateRangeFilter.dateRangeToSpec,
  DecompositionTreeChart: handWrittenDecompositionTreeChart.DecompositionTreeChart,
  Density2DChart: handWrittenDensity2DChart.Density2DChart,
  DependencyWheelChart: handWrittenDependencyWheelChart.DependencyWheelChart,
  DonutChart: handWrittenDonutChart.DonutChart,
  DrillBarChart: handWrittenDrillBarChart.DrillBarChart,
  DrillBreadcrumb: handWrittenDrillBreadcrumb.DrillBreadcrumb,
  TreemapChart: handWrittenTreemapChart.TreemapChart,
  DrillChart: handWrittenDrillChart.DrillChart,
  DumbbellChart: handWrittenDumbbellChart.DumbbellChart,
  ErrorBarsChart: handWrittenErrorBarsChart.ErrorBarsChart,
  EventFeedPanel: handWrittenEventFeedPanel.EventFeedPanel,
  FieldPane: handWrittenFieldPane.FieldPane,
  FlamegraphChart: handWrittenFlamegraphChart.FlamegraphChart,
  ForceGraph: handWrittenForceGraph.ForceGraph,
  ForecastLineChart: handWrittenForecastLineChart.ForecastLineChart,
  FormatPanel: handWrittenFormatPanel.FormatPanel,
  FunnelChart: handWrittenFunnelChart.FunnelChart,
  GanttChart: handWrittenGanttChart.GanttChart,
  GaugeChart: handWrittenGaugeChart.GaugeChart,
  GeoClusterMap: handWrittenGeoClusterMap.GeoClusterMap,
  GeoDensityMap: handWrittenGeoDensityMap.GeoDensityMap,
  GeoFlowMap: handWrittenGeoFlowMap.GeoFlowMap,
  GeoHexbinMap: handWrittenGeoHexbinMap.GeoHexbinMap,
  GeoJsonMap: handWrittenGeoJsonMap.GeoJsonMap,
  GeoPointMap: handWrittenGeoPointMap.GeoPointMap,
  HLCChart: handWrittenHLCChart.HLCChart,
  HeatmapChart: handWrittenHeatmapChart.HeatmapChart,
  HeikinAshiChart: handWrittenHeikinAshiChart.HeikinAshiChart,
  HistogramChart: handWrittenHistogramChart.HistogramChart,
  HollowCandlestickChart: handWrittenHollowCandlestickChart.HollowCandlestickChart,
  ItemChart: handWrittenItemChart.ItemChart,
  KpiCardGroup: handWrittenKpiCardGroup.KpiCardGroup,
  MekkoChart: handWrittenMekkoChart.MekkoChart,
  OHLCChart: handWrittenOHLCChart.OHLCChart,
  WebFrame: handWrittenObjectLayers.WebFrame,
  DataImage: handWrittenObjectLayers.DataImage,
  ObjectLayerPanel: handWrittenObjectLayers.ObjectLayerPanel,
  OrganizationChart: handWrittenOrganizationChart.OrganizationChart,
  PackedBubbleChart: handWrittenPackedBubbleChart.PackedBubbleChart,
  PalettePicker: handWrittenPalettePicker.PalettePicker,
  ParallelCoordinatesChart: handWrittenParallelCoordinatesChart.ParallelCoordinatesChart,
  PercentileBandChart: handWrittenPercentileBandChart.PercentileBandChart,
  PivotDataTable: handWrittenPivotDataTable.PivotDataTable,
  PointAndFigureChart: handWrittenPointAndFigureChart.PointAndFigureChart,
  PolygonChart: handWrittenPolygonChart.PolygonChart,
  QueryBar: handWrittenQueryBar.QueryBar,
  RadarChart: handWrittenRadarChart.RadarChart,
  RangeSliderFilter: handWrittenRangeSliderFilter.RangeSliderFilter,
  numericDomain: handWrittenRangeSliderFilter.numericDomain,
  rangeBoundsToSpec: handWrittenRangeSliderFilter.rangeBoundsToSpec,
  RecordsTable: handWrittenRecordsTable.RecordsTable,
  ReferenceLineChart: handWrittenReferenceLineChart.ReferenceLineChart,
  RelativeDateFilter: handWrittenRelativeDateFilter.RelativeDateFilter,
  relativeRangeToSpec: handWrittenRelativeDateFilter.relativeRangeToSpec,
  DEFAULT_RELATIVE_PRESETS: handWrittenRelativeDateFilter.DEFAULT_RELATIVE_PRESETS,
  RenkoChart: handWrittenRenkoChart.RenkoChart,
  RibbonChart: handWrittenRibbonChart.RibbonChart,
  RoseChart: handWrittenRoseChart.RoseChart,
  SankeyChart: handWrittenSankeyChart.SankeyChart,
  ScatterPlot: handWrittenScatterPlot.ScatterPlot,
  ScatterPlotMatrix: handWrittenScatterPlotMatrix.ScatterPlotMatrix,
  ScoreCard: handWrittenScoreCard.ScoreCard,
  SelectionLegend: handWrittenSelectionLegend.SelectionLegend,
  SmallMultiples: handWrittenSmallMultiples.SmallMultiples,
  SolidGaugeChart: handWrittenSolidGaugeChart.SolidGaugeChart,
  Sparkline: handWrittenSparkline.Sparkline,
  StateTimelineChart: handWrittenStateTimelineChart.StateTimelineChart,
  StatusHistoryChart: handWrittenStatusHistoryChart.StatusHistoryChart,
  StreamgraphChart: handWrittenStreamgraphChart.StreamgraphChart,
  SunburstChart: handWrittenSunburstChart.SunburstChart,
  TileMapChart: handWrittenTileMapChart.TileMapChart,
  TimelineChart: handWrittenTimelineChart.TimelineChart,
  TopNFilter: handWrittenTopNFilter.TopNFilter,
  TraceWaterfallChart: handWrittenTraceWaterfallChart.TraceWaterfallChart,
  TreegraphChart: handWrittenTreegraphChart.TreegraphChart,
  TrendLineChart: handWrittenTrendLineChart.TrendLineChart,
  ValueSlicer: handWrittenValueSlicer.ValueSlicer,
  VariablePieChart: handWrittenVariablePieChart.VariablePieChart,
  VectorFieldChart: handWrittenVectorFieldChart.VectorFieldChart,
  VennChart: handWrittenVennChart.VennChart,
  ViolinChart: handWrittenViolinChart.ViolinChart,
  WaffleChart: handWrittenWaffleChart.WaffleChart,
  WaterfallChart: handWrittenWaterfallChart.WaterfallChart,
};

describe("dataviz React leg provenance", () => {
  for (const name of switched) {
    it(`the dataviz-react barrel serves the emitted ${name}`, () => {
      expect(emitted[name]).toBeTruthy();
      expect(barrel[name]).toBe(emitted[name]);
      expect(barrel[name]).not.toBe(handWritten[name]);
    });
  }

  it("constant exports match between emitted and barrel", () => {
    expect(emitted.DEFAULT_URL_SYNC_PARAM).toBe(handWrittenUrlSync.DEFAULT_URL_SYNC_PARAM);
    expect(barrel.DEFAULT_URL_SYNC_PARAM).toBe(emitted.DEFAULT_URL_SYNC_PARAM);
  });

  it("internal derivation helpers emit distinct module instances ready for React-leg switching", () => {
    expect(emittedCategoricalData.buildSafeCategoricalSeries).not.toBe(handWrittenCategoricalData.buildSafeCategoricalSeries);
    expect(emittedPartOfWholeData.buildSafePartWholeModel).not.toBe(handWrittenPartOfWholeData.buildSafePartWholeModel);
    expect(emittedDistributionData.buildHistogramData).not.toBe(handWrittenDistributionData.buildHistogramData);
    expect(emittedAdvancedPivotData.buildAdvancedPivotView).not.toBe(handWrittenAdvancedPivotData.buildAdvancedPivotView);
    expect(emittedAnalyticsDsData.buildClusterScatterData).not.toBe(handWrittenAnalyticsDsData.buildClusterScatterData);
    expect(emittedAnalyticsDsData.buildForecastLineData).not.toBe(handWrittenAnalyticsDsData.buildForecastLineData);
    expect(emittedChartExport.downloadPdf).not.toBe(handWrittenChartExport.downloadPdf);
    expect(emittedChartExport.resolveSvg).not.toBe(handWrittenChartExport.resolveSvg);
    expect(emittedGeoMapLayers.choroplethLayer).not.toBe(handWrittenGeoMapLayers.choroplethLayer);
    expect(emittedGeoMapLayers.pointsLayer).not.toBe(handWrittenGeoMapLayers.pointsLayer);
    expect(emittedChartExportComponent.DEFAULT_EXPORT_LABELS).not.toBe(handWrittenChartExportComponent.DEFAULT_EXPORT_LABELS);
    expect(emittedChartExportComponent.DEFAULT_EXPORT_LABELS).toEqual(handWrittenChartExportComponent.DEFAULT_EXPORT_LABELS);
  });
});
