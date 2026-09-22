/**
 * @sentropic/dataviz-core
 *
 * Framework-agnostic engine for the shared inter-view state of a BI dashboard:
 * data model, observable immutable store, cross-filter graph, aggregation and
 * bookmark serialisation. Zero framework / design-system dependencies.
 */

// Model
export type {
  Cell,
  Row,
  DimensionType,
  Aggregation,
  Dimension,
  Measure,
  DataModel,
} from './model.js';
export {
  isDimensionType,
  isAggregation,
  isDimension,
  isMeasure,
  isDataModel,
  validateModel,
  assertModel,
  findDimension,
  findMeasure,
} from './model.js';

// Fields / field pane
export type {
  FieldKind,
  FieldId,
  FieldPillTone,
  FieldDescriptor,
  FieldPaneNode,
  FieldPaneTree,
  FieldPaneOptions,
  FieldPillModel,
} from './fields.js';
export {
  fieldId,
  parseFieldId,
  listFields,
  buildFieldPaneTree,
  fieldToPill,
} from './fields.js';

// Descriptions
export { describeFilterSpec } from './describe.js';

// Pivot / matrix
export type {
  PivotConfig,
  PivotTableColumn,
  PivotTableRow,
  PivotTable,
} from './pivot.js';
export { buildPivotTable } from './pivot.js';

// KPI cards
export type {
  KpiCardConfig,
  KpiBuildOptions,
  KpiSparklinePoint,
  KpiCard,
} from './kpi.js';
export { buildKpiCards } from './kpi.js';

// Categorical/combo series
export type {
  CategoricalMark,
  CategoricalAxis,
  CategoricalMode,
  CategoricalMeasureInput,
  CategoricalSeriesConfig,
  CategoricalMeasure,
  CategoricalSeries,
  CategoricalSeriesModel,
  ParetoConfig,
  ParetoItem,
  ParetoModel,
  DivergingDirection,
  DivergingBarConfig,
  DivergingBarItem,
  DivergingBarModel,
} from './categorical.js';
export {
  buildCategoricalSeries,
  buildParetoModel,
  buildDivergingBarModel,
} from './categorical.js';

// Time series
export type {
  TimeSeriesConfig,
  TimeSeriesSeries,
  TimeSeriesModel,
} from './timeseries.js';
export { buildTimeSeriesModel } from './timeseries.js';

// Part-of-whole / flow
export type {
  PartWholeSort,
  PartWholeConfig,
  PartWholeItem,
  PartWholeModel,
  PartWholeHierarchyConfig,
  PartWholeNode,
  WaterfallConfig,
  WaterfallStep,
  WaterfallModel,
  FlowConfig,
  FlowNode,
  FlowLink,
  FlowModel,
  RadarConfig,
  RadarAxis,
  RadarPoint,
  RadarSeries,
  RadarModel,
  RoseConfig,
  RoseSector,
  RoseModel,
  MekkoConfig,
  MekkoSegment,
  MekkoColumn,
  MekkoModel,
  PackedBubbleConfig,
  PackedBubble,
  PackedBubbleModel,
} from './partOfWhole.js';
export {
  buildPartWholeModel,
  buildPartWholeHierarchy,
  buildWaterfallModel,
  buildFlowModel,
  buildRadarModel,
  buildRoseModel,
  buildMekkoModel,
  buildPackedBubbleModel,
} from './partOfWhole.js';

// Distribution / statistics
export type {
  HistogramConfig,
  HistogramBin,
  HistogramModel,
  BoxPlotConfig,
  BoxPlotGroup,
  BoxPlotModel,
  HeatmapConfig,
  HeatmapCell,
  HeatmapModel,
  BulletChartConfig,
  BulletChartDatum,
  BulletChartModel,
  GaugeChartTone,
  GaugeChartFormat,
  GaugeChartThreshold,
  GaugeChartConfig,
  GaugeChartModel,
} from './distribution.js';
export {
  buildHistogramModel,
  buildBoxPlotModel,
  buildHeatmapModel,
  buildBulletChartModel,
  buildGaugeChartModel,
} from './distribution.js';
export type { QueryFilterConfig } from './query.js';
export { buildQueryFilterSpec } from './query.js';
export type {
  DateHistogramInterval,
  DateHistogramConfig,
  DateHistogramBin,
  DateHistogramModel,
} from './dateHistogram.js';
export { buildDateHistogramModel } from './dateHistogram.js';

// Advanced pivot / matrix
export type {
  AdvancedPivotConfig,
  AdvancedPivotSparklinePoint,
  AdvancedPivotCell,
  AdvancedPivotRow,
  AdvancedPivotTable,
} from './pivotAdvanced.js';
export { buildAdvancedPivotTable } from './pivotAdvanced.js';

// Analytic overlays
export type {
  ReferenceLineConfig,
  ReferenceLineModel,
  PercentileBandConfig,
  PercentileBandModel,
  TrendLineConfig,
  TrendPoint,
  TrendLineModel,
  ForecastConfig,
  ForecastModel,
  ErrorBarsConfig,
  ErrorBarItem,
  ErrorBarsModel,
  AnalyticsClusterConfig,
  AnalyticsCluster,
  AnalyticsClusterModel,
} from './analytics.js';
export {
  buildReferenceLineModel,
  buildPercentileBandModel,
  buildTrendLineModel,
  buildForecastModel,
  buildErrorBarsModel,
  buildAnalyticsClusterModel,
} from './analytics.js';

// Scatter plot model
export type { ScatterDatum, ScatterConfig, ScatterModel, ScatterTone } from './scatter.js';
export { buildScatterModel } from './scatter.js';

// Animated bubble chart (Gapminder-style)
export type { BubbleDatum, BubbleFrame } from './animatedBubble.js';
export { distinctSorted, buildBubbleFrame } from './animatedBubble.js';

// Candlestick chart model
export type { CandlestickDatum, CandlestickConfig } from './candlestick.js';
export { buildCandlestickData } from './candlestick.js';

// OHLC chart model
export type { OhlcDatum, OhlcConfig } from './ohlc.js';
export { buildOhlcData } from './ohlc.js';

// Gantt chart model
export type { GanttDatum, GanttConfig } from './gantt.js';
export { buildGanttData } from './gantt.js';

// Timeline chart model
export type { TimelineTone, TimelineDatum, TimelineConfig } from './timeline.js';
export { buildTimelineData } from './timeline.js';

// Streamgraph chart model
export type { StreamgraphTone, StreamgraphSeriesValue, StreamgraphDatum, StreamgraphConfig } from './streamgraph.js';
export { buildStreamgraphData } from './streamgraph.js';

// Tile map chart model
export type { TileMapTile, TileMapConfig } from './tilemap.js';
export { buildTileMapData } from './tilemap.js';

// Violin chart model
export type { ViolinDatum, ViolinConfig, ViolinModel, ViolinTone } from './violin.js';
export { buildViolinModel } from './violin.js';

// Bump chart model
export type { BumpSeries, BumpConfig, BumpModel, BumpTone } from './bump.js';
export { buildBumpModel } from './bump.js';

// Parallel coordinates chart model
export type {
  ParallelAxisDef,
  ParallelCoordinatesConfig,
  ParallelCoordinatesModel,
  ParallelTone,
} from './parallelCoordinates.js';
export { buildParallelCoordinatesModel } from './parallelCoordinates.js';

// Geographic models
export type {
  GeoCoordinate,
  GeoPointConfig,
  GeoPoint,
  GeoPointModel,
  ChoroplethClassification,
  ChoroplethConfig,
  ChoroplethRegion,
  ChoroplethModel,
  GeoFlowConfig,
  GeoFlowLink,
  GeoFlowModel,
  GeoHexbinConfig,
  GeoHexbin,
  GeoHexbinModel,
  GeoClusterConfig,
  GeoCluster,
  GeoClusterModel,
  GeoDensityConfig,
  GeoBounds,
  GeoDensityCell,
  GeoDensityModel,
  GeoJsonGeometryType,
  GeoJsonGeometry,
  GeoJsonLayerConfig,
  GeoJsonFeature,
  GeoJsonLayerModel,
} from './geo.js';
export {
  classify,
  buildGeoPointModel,
  buildChoroplethModel,
  buildGeoFlowModel,
  buildGeoHexbinModel,
  buildGeoClusterModel,
  buildGeoDensityModel,
  buildGeoJsonLayerModel,
} from './geo.js';

// Format / axes
export type {
  FormatAxisScale,
  FormatMarkerShape,
  FormatAxisConfig,
  FormatLegendConfig,
  FormatMarkerConfig,
  FormatPanelConfig,
  FormatAxis,
  FormatLegend,
  FormatMarker,
  FormatPanelState,
  FormatAxisPatch,
  FormatLegendPatch,
  FormatMarkerPatch,
} from './format.js';
export {
  createFormatPanelState,
  updateAxisFormat,
  updateLegendFormat,
  updateMarkerFormat,
} from './format.js';

// Annotations
export type {
  AnnotationCoordinate,
  AnnotationMarker,
  AnnotationAnchor,
  AnnotationAxis,
  AnnotationPoint,
  PointAnnotation,
  LabelAnnotation,
  LineAnnotation,
  RegionAnnotation,
  ShapeAnnotation,
  ChartAnnotation,
} from './annotations.js';
export {
  isChartAnnotation,
  pointAnnotation,
  labelAnnotation,
  lineAnnotation,
  regionAnnotation,
  shapeAnnotation,
  annotation,
  serializeAnnotations,
  deserializeAnnotations,
} from './annotations.js';

// Value formatting (Intl)
export type {
  FormatValueStyle,
  FormatValueNotation,
  FormatValueDateStyle,
  FormatValueOptions,
} from './format-value.js';
export { formatValue, makeFormatter, FORMAT_VALUE_FALLBACK } from './format-value.js';

// Color scales (categorical / sequential / diverging, OKLab interpolation, no hardcoded colors)
export type { RGB } from './color.js';
export {
  parseHex,
  toHex,
  mix,
  sampleScale,
  buildSequentialScale,
  buildDivergingScale,
  buildCategoricalScale,
  colorAt,
  makeColorScale,
} from './color.js';

// Calculations / expressions
export type {
  CalculationVariable,
  CalculatedFieldKind,
  CalculatedFieldConfig,
  CalculationSuggestionKind,
  CalculationSuggestion,
  CalculationBinConfig,
  CalculationGroup,
  CalculationGroupConfig,
  CalculationSetConfig,
  TableCalculationKind,
} from './calculations.js';
export {
  evaluateCalculationExpression,
  applyCalculatedFields,
  extendModelWithCalculatedFields,
  suggestCalculationTokens,
  applyCalculationBins,
  applyCalculationGroups,
  applyCalculationSet,
  calculateTableValues,
} from './calculations.js';

// Dashboard objects / layers
export type {
  DashboardObjectLayerKind,
  WebFrameLoading,
  WebFrameReferrerPolicy,
  WebFrameSandboxToken,
  WebFrameConfig,
  ResolvedWebFrame,
  DataImageConfig,
  ResolvedDataImage,
  DashboardObjectLayer,
  ObjectLayerTreeNode,
  ObjectLayerTree,
  ObjectLayerPanelState,
} from './objects.js';
export {
  isObjectLayerVisible,
  buildObjectLayerTree,
  createObjectLayerPanelState,
  selectObjectLayer,
  setObjectLayerVisibility,
  toggleObjectLayerVisibility,
  resolveWebFrame,
  resolveDataImage,
} from './objects.js';

// Store
export type {
  FilterSpec,
  FilterState,
  SelectionState,
  DrillState,
  DashboardState,
  DashboardStoreConfig,
  DashboardStore,
} from './store.js';
export { createDashboardStore, specToPredicate, applyFilters, isFilterSpec } from './store.js';

// Bookmarks / actions
export type {
  DashboardActionRuntime,
  DashboardBookmark,
  DashboardAction,
} from './actions.js';
export {
  resolveDashboardBookmarkState,
  applyDashboardBookmark,
  runDashboardAction,
} from './actions.js';

// Crossfilter
export type { CrossfilterView, CrossfilterGraph } from './crossfilter.js';
export type { CrossfilterSelectionMode } from './crossfilter.js';
export { sourcesFor, applyCrossfilter, rangeSelectionKey } from './crossfilter.js';

// Aggregate
export {
  groupBy,
  aggregate,
  aggregateValues,
  extractNumbers,
  groupAggregate,
} from './aggregate.js';

// Serialize
export {
  serializeFilters,
  deserializeFilters,
  serializeDrill,
  deserializeDrill,
  serializeState,
  deserializeState,
} from './serialize.js';

// Hover channel (ephemeral cross-panel crosshair state — not serialised)
export type { HoverChannel } from './hover.js';
export { createHoverChannel, hoverKeyOf } from './hover.js';

// Conditional formatting (serialisable rule engine; presentation-free)
export type {
  ConditionalComparator,
  ConditionalIntent,
  ComparatorCondition,
  RankCondition,
  ConditionalCondition,
  ConditionalRule,
  ConditionalFormat,
  ConditionalDecoration,
} from './conditional-format.js';
export {
  isConditionalRule,
  isConditionalFormat,
  evaluateConditionalFormat,
  applyConditionalFormat,
  rule,
  rankRule,
} from './conditional-format.js';

// Dashboard layout (serialisable grid panel layout; presentation-free)
export type { PanelLayout, DashboardLayout, LayoutState } from './layout.js';
export {
  isPanelLayout,
  isDashboardLayout,
  createLayout,
  addPanel,
  removePanel,
  movePanel,
  resizePanel,
  normalizeLayout,
  serializeLayout,
  deserializeLayout,
  createLayoutState,
} from './layout.js';

// Range chart models (AreaRange / AreaSplineRange / ColumnRange / Dumbbell)
export type { AreaRangeDatum, AreaRangeConfig, ColumnRangeDatum, ColumnRangeConfig } from './range.js';
export { buildAreaRangeData, buildColumnRangeData } from './range.js';

// Variable pie chart model
export type { VariablePieTone, VariablePieDatum, VariablePieConfig } from './variablePie.js';
export { buildVariablePieData } from './variablePie.js';

// Item chart model
export type { ItemChartTone, ItemChartDatum, ItemChartConfig } from './itemChart.js';
export { buildItemChartData } from './itemChart.js';

// Column pyramid chart model
export type { ColumnPyramidTone, ColumnPyramidDatum, ColumnPyramidConfig } from './columnPyramid.js';
export { buildColumnPyramidData } from './columnPyramid.js';

// Arc diagram chart model
export type { ArcDiagramLink, ArcDiagramConfig } from './arcDiagram.js';
export { buildArcDiagramData } from './arcDiagram.js';

// Force-directed graph model
export type { ForceGraphToneCore, ForceGraphNodeCore, ForceGraphEdgeCore, ForceGraphDataResult, ForceGraphConfig } from './forceGraph.js';
export { buildForceGraphData } from './forceGraph.js';

// Dependency wheel chart model
export type { DependencyWheelLink, DependencyWheelConfig } from './dependencyWheel.js';
export { buildDependencyWheelData } from './dependencyWheel.js';

// HLC (high-low-close) chart model
export type { HlcDatum, HlcConfig } from './hlc.js';
export { buildHlcData } from './hlc.js';

// Correlation matrix model
export type { CorrelationDatum, CorrelationConfig } from './correlation.js';
export { buildCorrelationMatrix } from './correlation.js';

// Scatter plot matrix (SPLOM) model
export type { ScatterMatrixConfig, ScatterMatrixCell, ScatterMatrixModel } from './scatterMatrix.js';
export { buildScatterMatrix } from './scatterMatrix.js';

// State timeline model (observabilité — bandes d'états dans le temps)
export type { StateTimelineDatum, StateTimelineSegmentDatum, StateTimelineConfig } from './stateTimeline.js';
export { buildStateTimelineData } from './stateTimeline.js';

// Status history model (observabilité — buckets de statut ponctuels temps×entité)
export type { StatusHistoryDatum, StatusHistoryBucketDatum, StatusHistoryConfig } from './statusHistory.js';
export { buildStatusHistoryData } from './statusHistory.js';

// Ribbon chart model (rang empilé à rubans dans le temps)
export type { RibbonTone, RibbonDatum, RibbonConfig } from './ribbon.js';
export { buildRibbonData } from './ribbon.js';

// Anomaly swim lane model (heatmap temps×job, score continu)
export type { AnomalySwimLaneDatum, AnomalySwimLaneBucketDatum, AnomalySwimLaneConfig } from './anomalySwimLane.js';
export { buildAnomalySwimLaneData } from './anomalySwimLane.js';

// Flamegraph model (call stacks, hiérarchie récursive)
export type { FlamegraphNode, FlamegraphConfig } from './flamegraph.js';
export { buildFlamegraphData } from './flamegraph.js';

// Density 2D model (densité binned non-géo)
export type { Density2DPoint, Density2DConfig } from './density2d.js';
export { buildDensity2DData } from './density2d.js';

// Trace waterfall model (spans distribués imbriqués)
export type { TraceSpan, TraceWaterfallConfig } from './traceWaterfall.js';
export { buildTraceWaterfallData } from './traceWaterfall.js';

// Decomposition tree model (décomposition hiérarchique par niveaux)
export type {
  DecompositionTreeNode,
  DecompositionTreeLevel,
  DecompositionTreeData,
  DecompositionTreeConfig,
} from './decompositionTree.js';
export { buildDecompositionTreeData } from './decompositionTree.js';

// Event feed model (flux d'événements datés)
export type { EventFeedEvent, EventFeedConfig } from './eventFeed.js';
export { buildEventFeedData } from './eventFeed.js';

// Vector field model (champ de vecteurs x/y/length/direction)
export type { VectorFieldDatum, VectorFieldConfig } from './vectorField.js';
export { buildVectorFieldData } from './vectorField.js';

// Contour model (champ scalaire 2D → bandes de contour)
export type { ContourPoint, ContourConfig } from './contour.js';
export { buildContourData } from './contour.js';

// Wind barb model (barbules de vent : at/speed/direction)
export type { WindBarbDatum, WindBarbConfig } from './windBarb.js';
export { buildWindBarbData } from './windBarb.js';

// Renko model (briques de prix : date/close)
export type { RenkoPoint, RenkoConfig } from './renko.js';
export { buildRenkoData } from './renko.js';

// Point & figure model (colonnes X/O : date/close)
export type { PointAndFigurePoint, PointAndFigureConfig } from './pointAndFigure.js';
export { buildPointAndFigureData } from './pointAndFigure.js';

// Bell curve chart model
export type { BellCurveConfig } from './bellCurve.js';
export { buildBellCurveData } from './bellCurve.js';

// Hierarchy chart model (OrganizationChart / TreegraphChart)
export type { HierarchyTone, HierarchyNode, HierarchyConfig } from './hierarchy.js';
export { buildHierarchyData } from './hierarchy.js';

// Word cloud chart model
export type { WordCloudTone, WordCloudDatum, WordCloudConfig } from './wordCloud.js';
export { buildWordCloudData } from './wordCloud.js';

// Polygon chart model
export type { PolygonPoint, PolygonConfig } from './polygon.js';
export { buildPolygonData } from './polygon.js';

// Venn chart model
export type { VennArea, VennConfig } from './venn.js';
export { buildVennData } from './venn.js';

// Shared UI contract types (framework-agnostic, consumed by dataviz-{react,vue,svelte})
export type TimeRange = { from: string; to: string; relativeLabel?: string };
