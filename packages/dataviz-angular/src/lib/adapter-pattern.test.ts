import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Structural guard for the adapter pattern documented in PATTERN.md.
 *
 * The rules it enforces are invisible to a behavioural test: replacing a
 * memoised field with a template-read getter keeps every rendering test green
 * while reintroducing per-change-detection recomputation. This reads the adapter
 * sources instead, the same way `components-angular/src/styles.test.ts` reads
 * the stylesheet.
 */
const LIB = resolve('src/lib');

type Adapter = { file: string; source: string };

const adapters: Adapter[] = readdirSync(LIB)
  .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'))
  .map((file) => ({ file, source: readFileSync(resolve(LIB, file), 'utf8') }))
  .filter((entry) => entry.source.includes('@Component('));

/** Getter declarations at class-member indentation, with their name. */
function getterNames(source: string): string[] {
  return [...source.matchAll(/^ {2}(?:private |protected |public )?get\s+([A-Za-z_$][\w$]*)\s*\(/gm)].map(
    (match) => match[1],
  );
}

function declaresHook(source: string, hook: string): boolean {
  return new RegExp(`^ {2}${hook}\\(\\): void \\{`, 'm').test(source);
}

function hookBody(source: string, hook: string): string {
  const start = source.search(new RegExp(`^ {2}${hook}\\(\\): void \\{`, 'm'));
  if (start < 0) return '';
  const end = source.indexOf('\n  }', start);
  return end < 0 ? source.slice(start) : source.slice(start, end);
}

describe('adapter pattern guard', () => {
  it('finds every standalone adapter in src/lib', () => {
    expect(adapters.map((a) => a.file).sort()).toEqual([
      'AdvancedPivotDataTable.ts',
      'AnalyticsClusterPlot.ts',
      'AnomalySwimLaneChart.ts',
      'ArcDiagramChart.ts',
      'AreaChart.ts',
      'AreaRangeChart.ts',
      'AreaSplineRangeChart.ts',
      'BellCurveChart.ts',
      'BoxPlotChart.ts',
      'BulletChart.ts',
      'BumpChart.ts',
      'CalendarHeatmapChart.ts',
      'CandlestickChart.ts',
      'ChordChart.ts',
      'ChoroplethMap.ts',
      'ColumnPyramidChart.ts',
      'ColumnRangeChart.ts',
      'ComboChart.ts',
      'ContourChart.ts',
      'CorrelationMatrix.ts',
      'CrossfilteredBarChart.ts',
      'DashboardActiveFilters.ts',
      'DashboardFilterBar.ts',
      'DateHistogramChart.ts',
      'DateRangeFilter.ts',
      'DecompositionTreeChart.ts',
      'Density2DChart.ts',
      'DependencyWheelChart.ts',
      'DivergingBarChart.ts',
      'DonutChart.ts',
      'DrillBarChart.ts',
      'DrillBreadcrumb.ts',
      'DrillChart.ts',
      'DumbbellChart.ts',
      'ErrorBarsChart.ts',
      'EventFeedPanel.ts',
      'ExportMenu.ts',
      'FieldPane.ts',
      'FlamegraphChart.ts',
      'ForceGraph.ts',
      'ForecastLineChart.ts',
      'FunnelChart.ts',
      'GanttChart.ts',
      'GaugeChart.ts',
      'GeoClusterMap.ts',
      'GeoDensityMap.ts',
      'GeoFlowMap.ts',
      'GeoHexbinMap.ts',
      'GeoJsonMap.ts',
      'GeoPointMap.ts',
      'HLCChart.ts',
      'HeatmapChart.ts',
      'HeikinAshiChart.ts',
      'HistogramChart.ts',
      'HollowCandlestickChart.ts',
      'ItemChart.ts',
      'KpiCardGroup.ts',
      'LollipopChart.ts',
      'MekkoChart.ts',
      'OHLCChart.ts',
      'OrganizationChart.ts',
      'PackedBubbleChart.ts',
      'PalettePicker.ts',
      'ParallelCoordinatesChart.ts',
      'ParetoChart.ts',
      'PercentileBandChart.ts',
      'PivotDataTable.ts',
      'PointAndFigureChart.ts',
      'PolygonChart.ts',
      'QueryBar.ts',
      'RadarChart.ts',
      'RangeSliderFilter.ts',
      'RecordsTable.ts',
      'ReferenceLineChart.ts',
      'RelativeDateFilter.ts',
      'RenkoChart.ts',
      'RibbonChart.ts',
      'RoseChart.ts',
      'SankeyChart.ts',
      'ScatterPlot.ts',
      'ScatterPlotMatrix.ts',
      'ScoreCard.ts',
      'SelectionLegend.ts',
      'SmallMultiples.ts',
      'SolidGaugeChart.ts',
      'Sparkline.ts',
      'StackedBarChart.ts',
      'StateTimelineChart.ts',
      'StatusHistoryChart.ts',
      'StepLineChart.ts',
      'StreamgraphChart.ts',
      'SunburstChart.ts',
      'TileMapChart.ts',
      'TimelineChart.ts',
      'TopNFilter.ts',
      'TraceWaterfallChart.ts',
      'TreegraphChart.ts',
      'TreemapChart.ts',
      'TrendLineChart.ts',
      'ValueSlicer.ts',
      'VariablePieChart.ts',
      'VectorFieldChart.ts',
      'VennChart.ts',
      'ViolinChart.ts',
      'WaffleChart.ts',
      'WaterfallChart.ts',
      'WindBarbChart.ts',
      'WordCloudChart.ts',
    ]);
  });

  it('covers every component the package exports', () => {
    const index = readFileSync(resolve('src/index.ts'), 'utf8');
    const exported = [...index.matchAll(/^export \{([^}]+)\} from '\.\/lib\/(\w+)\.js';$/gm)]
      .filter(([, names]) => (names as string).split(',').some((name) => /^\s*[A-Z]/.test(name)))
      .map(([, , file]) => `${file}.ts`);

    expect(new Set(exported)).toEqual(new Set(adapters.map((a) => a.file)));
  });

  for (const { file, source } of adapters) {
    describe(file, () => {
      it('declares no getter other than the store accessor', () => {
        // A computed getter read from the template recomputes on every
        // change-detection pass; the derivation belongs in `recompute()`.
        expect(getterNames(source)).toEqual(source.includes('@NgInput({ required: true }) set store(') ? ['store'] : []);
      });

      it('recomputes in a private method called from both ngOnInit and ngOnChanges', () => {
        expect(declaresHook(source, 'ngOnInit'), 'ngOnInit').toBe(true);
        expect(declaresHook(source, 'ngOnChanges'), 'ngOnChanges').toBe(true);

        const called = /this\.([A-Za-z_$][\w$]*)\(\);/.exec(hookBody(source, 'ngOnInit'));
        expect(called, 'ngOnInit calls a derivation method').not.toBeNull();
        const method = called![1];
        // The derivation must be a private method, so no template can read it.
        expect(source).toMatch(new RegExp(`^ {2}private ${method}\\(\\): void \\{`, 'm'));
        expect(hookBody(source, 'ngOnChanges')).toContain(`this.${method}();`);
      });

      it('unsubscribes in ngOnDestroy when it subscribes to the store', () => {
        if (!source.includes('.subscribe(')) {
          expect(declaresHook(source, 'ngOnDestroy')).toBe(false);
          return;
        }
        expect(declaresHook(source, 'ngOnDestroy'), 'ngOnDestroy').toBe(true);
        const body = hookBody(source, 'ngOnDestroy');
        expect(body).toContain('this.unsubscribe();');
        expect(body).toContain('this.signals?.destroy();');
      });

      it('renders no literal style attribute and no hard-coded colour', () => {
        expect(source).not.toMatch(/\bstyle="/);
        expect(source).not.toMatch(/\[style[.\]]/);
        expect(source).not.toMatch(/\[ngStyle\]/);
        expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/);
      });
    });
  }
});
