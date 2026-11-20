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
import * as emitted from "../.react-emit/src/index.js";
import * as emittedCategoricalData from "../.react-emit/src/lib/categoricalData.js";
import * as emittedDistributionData from "../.react-emit/src/lib/distributionData.js";
import * as emittedPartOfWholeData from "../.react-emit/src/lib/partOfWholeData.js";
import * as emittedAdvancedPivotData from "../.react-emit/src/lib/advancedPivotData.js";
import * as emittedAnalyticsDsData from "../.react-emit/src/lib/analyticsDsData.js";
import * as emittedChartExport from "../.react-emit/src/lib/chart-export.js";
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
  });
});
