/**
 * Angular ↔ React rendered-markup parity for the dataviz adapters.
 *
 *   npm run build && npm run parity:dataviz-angular
 *
 * Each case renders the Angular adapter through TestBed (jsdom) and the React
 * adapter through `renderToStaticMarkup`, from the same fixture and the same
 * props, then compares the two renders entry by entry (see ./normalize.ts for the
 * normalisation and its allowlist) and, separately, their user- and
 * AT-visible content signature.
 *
 * For the cases whose residual difference is claimed to live in the design-system
 * packages, the same comparison is run on the BARE DS components with identical
 * inputs: the claim is asserted, not asserted-by-prose — the adapter diff count
 * must equal the bare DS diff count.
 *
 * The table it prints is the source of the parity figures quoted in the PR body
 * and in packages/dataviz-angular/PATTERN.md.
 */
import { Component, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { appendFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { diff, flatten, flattenHtml, textSignature } from './normalize.js';
import {
  buildArcDiagramData,
  buildColumnRangeData,
  buildDependencyWheelData,
  buildOhlcData,
  buildRenkoData,
  buildTimelineData,
} from '@sentropic/dataviz-core';
import {
  buildSafeMekkoModel,
  toMarimekkoData,
} from '../../packages/dataviz-angular/dist/lib/partOfWholeData.js';
import {
  activeFilters,
  hierarchy,
  newWideStore,
  wideModel,
  wideRows,
  dsHeatmapData,
  dsTreemapData,
  exportConfig,
  filterControls,
  newStore,
  dsVectorFieldData,
  dsWindBarbData,
  dsForceGraph,
  dsSparklineData,
  dsStepLinePoints,
  dsDivergingBarData,
  dsDivergingBarDomain,
  dsComboCategories,
  dsComboBars,
  dsComboLines,
  vennAreas,
} from './fixture.js';

import * as NG from '../../packages/dataviz-angular/dist/index.js';
import * as RE from '../../packages/dataviz-react/dist/index.js';
import * as NGDS from '../../packages/components-angular/dist/index.js';
import * as REDS from '../../packages/components-react/dist/index.js';

type Props = Record<string, unknown>;

type Case = {
  name: string;
  ng: Type<unknown>;
  template: string;
  re: ComponentType<Props>;
  props: Props;
  /** Give the store a selection before rendering (SelectionLegend). */
  select?: boolean;
  /** This adapter takes no store (DashboardFilterBar is stateless). */
  storeless?: boolean;
  /**
   * Give the store an `include` filter before rendering (DashboardActiveFilters,
   * ValueSlicer): otherwise the case would compare two renders with nothing to
   * show a filter chip or a checked box.
   */
  presetFilter?: { dimension: string; values: string[] };
  /** Expected markup diffs; anything else is a regression. */
  expectedMarkupDiffs: number;
  /** Expected content-signature diffs. */
  expectedSignatureDiffs: number;
  /** Where a non-zero markup diff comes from. */
  attribution: string;
  /** Which fixture to mount: the lot 1 one by default, 'wide' for lot 2. */
  fixture?: 'wide';
  /**
   * Bare DS control: same inputs, no adapter. `controlData` in the Angular
   * template is `props.data`, or `ngData` when the DS component takes several
   * inputs instead of one `data` array (ForceGraph: nodes + edges).
   */
  control?: { ng: Type<unknown>; template: string; re: ComponentType<Props>; props: Props; ngData?: unknown };
};

const cases: Case[] = [
  {
    name: 'AreaChart',
    ng: NG.AreaChart as Type<unknown>,
    template: `<st-dataviz-area-chart [store]="store" viewId="revenue" category="service" measure="amount" label="Revenue by service" class="lot1-area"></st-dataviz-area-chart>`,
    re: RE.AreaChart as ComponentType<Props>,
    props: { viewId: 'revenue', category: 'service', measure: 'amount', label: 'Revenue by service', className: 'lot1-area' },
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'DonutChart',
    ng: NG.DonutChart as Type<unknown>,
    template: `<st-dataviz-donut-chart [store]="store" viewId="revenue" category="service" measure="amount" label="Revenue share"></st-dataviz-donut-chart>`,
    re: RE.DonutChart as ComponentType<Props>,
    props: { viewId: 'revenue', category: 'service', measure: 'amount', label: 'Revenue share' },
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'HeatmapChart',
    ng: NG.HeatmapChart as Type<unknown>,
    template: `<st-dataviz-heatmap-chart [store]="store" viewId="revenue" x="service" y="region" measure="amount" label="Revenue heatmap"></st-dataviz-heatmap-chart>`,
    re: RE.HeatmapChart as ComponentType<Props>,
    props: { viewId: 'revenue', x: 'service', y: 'region', measure: 'amount', label: 'Revenue heatmap' },
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: "—",
    control: {
      ng: NGDS.HeatmapChart as Type<unknown>,
      template: `<st-heatmap-chart [data]="dsHeatmapData" [legend]="true" label="Revenue heatmap"></st-heatmap-chart>`,
      re: REDS.HeatmapChart as ComponentType<Props>,
      props: { data: dsHeatmapData, legend: true, label: 'Revenue heatmap' },
    },
  },
  {
    name: 'ScatterPlot',
    ng: NG.ScatterPlot as Type<unknown>,
    template: `<st-dataviz-scatter-plot [store]="store" viewId="revenue" x="amount" y="latency" label="Amount vs latency"></st-dataviz-scatter-plot>`,
    re: RE.ScatterPlot as ComponentType<Props>,
    props: { viewId: 'revenue', x: 'amount', y: 'latency', label: 'Amount vs latency' },
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'TreemapChart',
    ng: NG.TreemapChart as Type<unknown>,
    template: `<st-dataviz-treemap-chart [store]="store" viewId="revenue" [hierarchy]="['region','service']" measure="amount" label="Revenue treemap"></st-dataviz-treemap-chart>`,
    re: RE.TreemapChart as ComponentType<Props>,
    props: { viewId: 'revenue', hierarchy: ['region', 'service'], measure: 'amount', label: 'Revenue treemap' },
    expectedMarkupDiffs: 76,
    expectedSignatureDiffs: 0,
    attribution: 'DS: components-angular vs components-react TreemapChart',
    control: {
      ng: NGDS.TreemapChart as Type<unknown>,
      template: `<st-treemap-chart [data]="dsTreemapData" [showLabels]="true" [legend]="true" label="Revenue treemap"></st-treemap-chart>`,
      re: REDS.TreemapChart as ComponentType<Props>,
      props: { data: dsTreemapData, showLabels: true, legend: true, label: 'Revenue treemap' },
    },
  },
  {
    name: 'KpiCardGroup',
    ng: NG.KpiCardGroup as Type<unknown>,
    template: `<st-dataviz-kpi-card-group [store]="store" viewId="revenue" [configs]="[{ id: 'total', measure: 'amount', label: 'Total amount' }]" class="kpis"></st-dataviz-kpi-card-group>`,
    re: RE.KpiCardGroup as ComponentType<Props>,
    props: { viewId: 'revenue', configs: [{ id: 'total', measure: 'amount', label: 'Total amount' }], className: 'kpis' },
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'RecordsTable',
    ng: NG.RecordsTable as Type<unknown>,
    template: `<st-dataviz-records-table [store]="store" viewId="table" caption="Records" class="lot1-table"></st-dataviz-records-table>`,
    re: RE.RecordsTable as ComponentType<Props>,
    props: { viewId: 'table', caption: 'Records', className: 'lot1-table' },
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'SelectionLegend',
    ng: NG.SelectionLegend as Type<unknown>,
    template: `<st-dataviz-selection-legend [store]="store" [labels]="{ revenue: 'Service' }"></st-dataviz-selection-legend>`,
    re: RE.SelectionLegend as ComponentType<Props>,
    props: { labels: { revenue: 'Service' } },
    select: true,
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
    control: {
      ng: NGDS.SelectionChip as Type<unknown>,
      template: `<st-selection-chip label="Service" [count]="1" [onClear]="noop"></st-selection-chip>`,
      re: REDS.SelectionChip as ComponentType<Props>,
      props: { label: 'Service', count: 1, onClear: () => {} },
    },
  },
  {
    name: 'DateRangeFilter',
    ng: NG.DateRangeFilter as Type<unknown>,
    template: `<st-dataviz-date-range-filter [store]="store" dimension="ts"></st-dataviz-date-range-filter>`,
    re: RE.DateRangeFilter as ComponentType<Props>,
    props: { dimension: 'ts' },
    expectedMarkupDiffs: 1,
    expectedSignatureDiffs: 0,
    attribution: 'React serialises value="" on the readonly input; Angular sets the property',
  },
  {
    name: 'DashboardFilterBar',
    ng: NG.DashboardFilterBar as Type<unknown>,
    template: `<st-dataviz-dashboard-filter-bar [controls]="filterControls" [export]="exportConfig" [chips]="true" [activeFilters]="activeFilters"></st-dataviz-dashboard-filter-bar>`,
    re: RE.DashboardFilterBar as ComponentType<Props>,
    props: { controls: filterControls, export: exportConfig, chips: true, activeFilters },
    storeless: true,
    expectedMarkupDiffs: 106,
    expectedSignatureDiffs: 0,
    attribution: 'DS: Search/Select/MultiSelect/DatePicker internal DOM',
    control: {
      ng: NGDS.Search as Type<unknown>,
      template: `<st-search label="Query" placeholder="Search rows"></st-search>`,
      re: REDS.Search as ComponentType<Props>,
      props: { label: 'Query', placeholder: 'Search rows' },
    },
  },
  {
    name: 'ChoroplethMap',
    ng: NG.ChoroplethMap as Type<unknown>,
    template: `<st-dataviz-choropleth-map [store]="store" viewId="v" region="region" measure="amount" geometry="shape" label="L" class="probe"></st-dataviz-choropleth-map>`,
    re: RE.ChoroplethMap as ComponentType<Props>,
    props: { viewId: 'v', region: 'region', measure: 'amount', geometry: 'shape', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'GeoClusterMap',
    ng: NG.GeoClusterMap as Type<unknown>,
    template: `<st-dataviz-geo-cluster-map [store]="store" viewId="v" latitude="lat" longitude="lon" label="L" class="probe"></st-dataviz-geo-cluster-map>`,
    re: RE.GeoClusterMap as ComponentType<Props>,
    props: { viewId: 'v', latitude: 'lat', longitude: 'lon', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'GeoDensityMap',
    ng: NG.GeoDensityMap as Type<unknown>,
    template: `<st-dataviz-geo-density-map [store]="store" viewId="v" latitude="lat" longitude="lon" label="L" class="probe"></st-dataviz-geo-density-map>`,
    re: RE.GeoDensityMap as ComponentType<Props>,
    props: { viewId: 'v', latitude: 'lat', longitude: 'lon', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'GeoFlowMap',
    ng: NG.GeoFlowMap as Type<unknown>,
    template: `<st-dataviz-geo-flow-map [store]="store" viewId="v" sourceLatitude="lat" sourceLongitude="lon" targetLatitude="dstLat" targetLongitude="dstLon" label="L" class="probe"></st-dataviz-geo-flow-map>`,
    re: RE.GeoFlowMap as ComponentType<Props>,
    props: { viewId: 'v', sourceLatitude: 'lat', sourceLongitude: 'lon', targetLatitude: 'dstLat', targetLongitude: 'dstLon', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'GeoHexbinMap',
    ng: NG.GeoHexbinMap as Type<unknown>,
    template: `<st-dataviz-geo-hexbin-map [store]="store" viewId="v" latitude="lat" longitude="lon" label="L" class="probe"></st-dataviz-geo-hexbin-map>`,
    re: RE.GeoHexbinMap as ComponentType<Props>,
    props: { viewId: 'v', latitude: 'lat', longitude: 'lon', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'GeoJsonMap',
    ng: NG.GeoJsonMap as Type<unknown>,
    template: `<st-dataviz-geo-json-map [store]="store" viewId="v" geometry="shape" label="L" class="probe"></st-dataviz-geo-json-map>`,
    re: RE.GeoJsonMap as ComponentType<Props>,
    props: { viewId: 'v', geometry: 'shape', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'GeoPointMap',
    ng: NG.GeoPointMap as Type<unknown>,
    template: `<st-dataviz-geo-point-map [store]="store" viewId="v" latitude="lat" longitude="lon" label="L" class="probe"></st-dataviz-geo-point-map>`,
    re: RE.GeoPointMap as ComponentType<Props>,
    props: { viewId: 'v', latitude: 'lat', longitude: 'lon', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'CandlestickChart',
    ng: NG.CandlestickChart as Type<unknown>,
    template: `<st-dataviz-candlestick-chart [store]="store" viewId="v" label_field="region" open="open" high="high" low="low" close="close" label="L" class="probe"></st-dataviz-candlestick-chart>`,
    re: RE.CandlestickChart as ComponentType<Props>,
    props: { viewId: 'v', label_field: 'region', open: 'open', high: 'high', low: 'low', close: 'close', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'HeikinAshiChart',
    ng: NG.HeikinAshiChart as Type<unknown>,
    template: `<st-dataviz-heikin-ashi-chart [store]="store" viewId="v" label_field="region" open="open" high="high" low="low" close="close" label="L" class="probe"></st-dataviz-heikin-ashi-chart>`,
    re: RE.HeikinAshiChart as ComponentType<Props>,
    props: { viewId: 'v', label_field: 'region', open: 'open', high: 'high', low: 'low', close: 'close', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'HollowCandlestickChart',
    ng: NG.HollowCandlestickChart as Type<unknown>,
    template: `<st-dataviz-hollow-candlestick-chart [store]="store" viewId="v" label_field="region" open="open" high="high" low="low" close="close" label="L" class="probe"></st-dataviz-hollow-candlestick-chart>`,
    re: RE.HollowCandlestickChart as ComponentType<Props>,
    props: { viewId: 'v', label_field: 'region', open: 'open', high: 'high', low: 'low', close: 'close', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'OHLCChart',
    ng: NG.OHLCChart as Type<unknown>,
    template: `<st-dataviz-ohlc-chart [store]="store" viewId="v" label_field="region" open="open" high="high" low="low" close="close" label="L" class="probe"></st-dataviz-ohlc-chart>`,
    re: RE.OHLCChart as ComponentType<Props>,
    props: { viewId: 'v', label_field: 'region', open: 'open', high: 'high', low: 'low', close: 'close', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: "DS: Angular emits data-chart-index on each bar, React does not",
    control: {
      ng: NGDS.OHLCChart as Type<unknown>,
      template: `<st-ohlc-chart [data]="controlData" label="L"></st-ohlc-chart>`,
      re: REDS.OHLCChart as ComponentType<Props>,
      props: { data: buildOhlcData(wideModel, wideRows, { label: 'region', open: 'open', high: 'high', low: 'low', close: 'close' }), label: 'L' },
    },
  },
  {
    name: 'HLCChart',
    ng: NG.HLCChart as Type<unknown>,
    template: `<st-dataviz-hlc-chart [store]="store" viewId="v" label_field="region" high="high" low="low" close="close" label="L" class="probe"></st-dataviz-hlc-chart>`,
    re: RE.HLCChart as ComponentType<Props>,
    props: { viewId: 'v', label_field: 'region', high: 'high', low: 'low', close: 'close', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'RenkoChart',
    ng: NG.RenkoChart as Type<unknown>,
    template: `<st-dataviz-renko-chart [store]="store" viewId="v" date="ts" close="close" label="L" class="probe"></st-dataviz-renko-chart>`,
    re: RE.RenkoChart as ComponentType<Props>,
    props: { viewId: 'v', date: 'ts', close: 'close', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: "DS: Angular always renders the tooltip, React renders it only on hover",
    control: {
      ng: NGDS.RenkoChart as Type<unknown>,
      template: `<st-renko-chart [data]="controlData" label="L"></st-renko-chart>`,
      re: REDS.RenkoChart as ComponentType<Props>,
      props: { data: buildRenkoData(wideModel, wideRows, { date: 'ts', close: 'close' }), label: 'L' },
    },
  },
  {
    name: 'AreaRangeChart',
    ng: NG.AreaRangeChart as Type<unknown>,
    template: `<st-dataviz-area-range-chart [store]="store" viewId="v" x_field="region" low="low" high="high" label="L" class="probe"></st-dataviz-area-range-chart>`,
    re: RE.AreaRangeChart as ComponentType<Props>,
    props: { viewId: 'v', x_field: 'region', low: 'low', high: 'high', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'AreaSplineRangeChart',
    ng: NG.AreaSplineRangeChart as Type<unknown>,
    template: `<st-dataviz-area-spline-range-chart [store]="store" viewId="v" x_field="region" low="low" high="high" label="L" class="probe"></st-dataviz-area-spline-range-chart>`,
    re: RE.AreaSplineRangeChart as ComponentType<Props>,
    props: { viewId: 'v', x_field: 'region', low: 'low', high: 'high', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'ColumnRangeChart',
    ng: NG.ColumnRangeChart as Type<unknown>,
    template: `<st-dataviz-column-range-chart [store]="store" viewId="v" category="region" low="low" high="high" label="L" class="probe"></st-dataviz-column-range-chart>`,
    re: RE.ColumnRangeChart as ComponentType<Props>,
    props: { viewId: 'v', category: 'region', low: 'low', high: 'high', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'DumbbellChart',
    ng: NG.DumbbellChart as Type<unknown>,
    template: `<st-dataviz-dumbbell-chart [store]="store" viewId="v" category="region" low="low" high="high" label="L" class="probe"></st-dataviz-dumbbell-chart>`,
    re: RE.DumbbellChart as ComponentType<Props>,
    props: { viewId: 'v', category: 'region', low: 'low', high: 'high', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 3,
    expectedSignatureDiffs: 0,
    attribution: "DS: Angular emits data-chart-index on each row, React does not",
    control: {
      ng: NGDS.DumbbellChart as Type<unknown>,
      template: `<st-dumbbell-chart [data]="controlData" label="L"></st-dumbbell-chart>`,
      re: REDS.DumbbellChart as ComponentType<Props>,
      props: { data: buildColumnRangeData(wideModel, wideRows, { category: 'region', low: 'low', high: 'high' }), label: 'L' },
    },
  },
  {
    name: 'RoseChart',
    ng: NG.RoseChart as Type<unknown>,
    template: `<st-dataviz-rose-chart [store]="store" viewId="v" category="region" measure="amount" label="L" class="probe"></st-dataviz-rose-chart>`,
    re: RE.RoseChart as ComponentType<Props>,
    props: { viewId: 'v', category: 'region', measure: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'SunburstChart',
    ng: NG.SunburstChart as Type<unknown>,
    template: `<st-dataviz-sunburst-chart [store]="store" viewId="v" [hierarchy]="hierarchy" measure="amount" label="L" class="probe"></st-dataviz-sunburst-chart>`,
    re: RE.SunburstChart as ComponentType<Props>,
    props: { viewId: 'v', hierarchy: hierarchy, measure: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'PackedBubbleChart',
    ng: NG.PackedBubbleChart as Type<unknown>,
    template: `<st-dataviz-packed-bubble-chart [store]="store" viewId="v" category="region" measure="amount" label="L" class="probe"></st-dataviz-packed-bubble-chart>`,
    re: RE.PackedBubbleChart as ComponentType<Props>,
    props: { viewId: 'v', category: 'region', measure: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'FunnelChart',
    ng: NG.FunnelChart as Type<unknown>,
    template: `<st-dataviz-funnel-chart [store]="store" viewId="v" category="region" measure="amount" label="L" class="probe"></st-dataviz-funnel-chart>`,
    re: RE.FunnelChart as ComponentType<Props>,
    props: { viewId: 'v', category: 'region', measure: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'MekkoChart',
    ng: NG.MekkoChart as Type<unknown>,
    template: `<st-dataviz-mekko-chart [store]="store" viewId="v" category="region" series="service" measure="amount" label="L" class="probe"></st-dataviz-mekko-chart>`,
    re: RE.MekkoChart as ComponentType<Props>,
    props: { viewId: 'v', category: 'region', series: 'service', measure: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 3,
    expectedSignatureDiffs: 0,
    attribution: "DS: components-react sets the cell label colour with an inline style, Angular with a fill attribute",
    control: {
      ng: NGDS.MarimekkoChart as Type<unknown>,
      template: `<st-marimekko-chart [data]="controlData" label="L"></st-marimekko-chart>`,
      re: REDS.MarimekkoChart as ComponentType<Props>,
      props: { data: toMarimekkoData(buildSafeMekkoModel(wideModel, wideRows, { category: 'region', series: 'service', measure: 'amount' })), label: 'L' },
    },
  },
  {
    name: 'SankeyChart',
    ng: NG.SankeyChart as Type<unknown>,
    template: `<st-dataviz-sankey-chart [store]="store" viewId="v" source="region" target="service" measure="amount" label="L" class="probe"></st-dataviz-sankey-chart>`,
    re: RE.SankeyChart as ComponentType<Props>,
    props: { viewId: 'v', source: 'region', target: 'service', measure: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'WaffleChart',
    ng: NG.WaffleChart as Type<unknown>,
    template: `<st-dataviz-waffle-chart [store]="store" viewId="v" label_field="region" value="amount" label="L" class="probe"></st-dataviz-waffle-chart>`,
    re: RE.WaffleChart as ComponentType<Props>,
    props: { viewId: 'v', label_field: 'region', value: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'WaterfallChart',
    ng: NG.WaterfallChart as Type<unknown>,
    template: `<st-dataviz-waterfall-chart [store]="store" viewId="v" category="region" measure="amount" label="L" class="probe"></st-dataviz-waterfall-chart>`,
    re: RE.WaterfallChart as ComponentType<Props>,
    props: { viewId: 'v', category: 'region', measure: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'VariablePieChart',
    ng: NG.VariablePieChart as Type<unknown>,
    template: `<st-dataviz-variable-pie-chart [store]="store" viewId="v" label_field="region" value="amount" z="close" label="L" class="probe"></st-dataviz-variable-pie-chart>`,
    re: RE.VariablePieChart as ComponentType<Props>,
    props: { viewId: 'v', label_field: 'region', value: 'amount', z: 'close', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'ColumnPyramidChart',
    ng: NG.ColumnPyramidChart as Type<unknown>,
    template: `<st-dataviz-column-pyramid-chart [store]="store" viewId="v" category="region" value="amount" label="L" class="probe"></st-dataviz-column-pyramid-chart>`,
    re: RE.ColumnPyramidChart as ComponentType<Props>,
    props: { viewId: 'v', category: 'region', value: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'TreegraphChart',
    ng: NG.TreegraphChart as Type<unknown>,
    template: `<st-dataviz-treegraph-chart [store]="store" viewId="v" id_field="region" parent_field="service" label_field="service" label="L" class="probe"></st-dataviz-treegraph-chart>`,
    re: RE.TreegraphChart as ComponentType<Props>,
    props: { viewId: 'v', id_field: 'region', parent_field: 'service', label_field: 'service', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'OrganizationChart',
    ng: NG.OrganizationChart as Type<unknown>,
    template: `<st-dataviz-organization-chart [store]="store" viewId="v" id_field="region" parent_field="service" label_field="service" label="L" class="probe"></st-dataviz-organization-chart>`,
    re: RE.OrganizationChart as ComponentType<Props>,
    props: { viewId: 'v', id_field: 'region', parent_field: 'service', label_field: 'service', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'DecompositionTreeChart',
    ng: NG.DecompositionTreeChart as Type<unknown>,
    template: `<st-dataviz-decomposition-tree-chart [store]="store" viewId="v" measure="amount" [levels]="hierarchy" label="L" class="probe"></st-dataviz-decomposition-tree-chart>`,
    re: RE.DecompositionTreeChart as ComponentType<Props>,
    props: { viewId: 'v', measure: 'amount', levels: hierarchy, label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'ArcDiagramChart',
    ng: NG.ArcDiagramChart as Type<unknown>,
    template: `<st-dataviz-arc-diagram-chart [store]="store" viewId="v" source="region" target="service" weight="amount" label="L" class="probe"></st-dataviz-arc-diagram-chart>`,
    re: RE.ArcDiagramChart as ComponentType<Props>,
    props: { viewId: 'v', source: 'region', target: 'service', weight: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
    control: {
      ng: NGDS.ArcDiagramChart as Type<unknown>,
      template: `<st-arc-diagram-chart [data]="controlData" label="L"></st-arc-diagram-chart>`,
      re: REDS.ArcDiagramChart as ComponentType<Props>,
      props: { data: buildArcDiagramData(wideModel, wideRows, { source: 'region', target: 'service', weight: 'amount' }), label: 'L' },
    },
  },
  {
    name: 'DependencyWheelChart',
    ng: NG.DependencyWheelChart as Type<unknown>,
    template: `<st-dataviz-dependency-wheel-chart [store]="store" viewId="v" source="region" target="service" weight="amount" label="L" class="probe"></st-dataviz-dependency-wheel-chart>`,
    re: RE.DependencyWheelChart as ComponentType<Props>,
    props: { viewId: 'v', source: 'region', target: 'service', weight: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
    control: {
      ng: NGDS.DependencyWheelChart as Type<unknown>,
      template: `<st-dependency-wheel-chart [data]="controlData" label="L"></st-dependency-wheel-chart>`,
      re: REDS.DependencyWheelChart as ComponentType<Props>,
      props: { data: buildDependencyWheelData(wideModel, wideRows, { source: 'region', target: 'service', weight: 'amount' }), label: 'L' },
    },
  },
  {
    name: 'GaugeChart',
    ng: NG.GaugeChart as Type<unknown>,
    template: `<st-dataviz-gauge-chart [store]="store" viewId="v" value="amount" label="L" class="probe"></st-dataviz-gauge-chart>`,
    re: RE.GaugeChart as ComponentType<Props>,
    props: { viewId: 'v', value: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'SolidGaugeChart',
    ng: NG.SolidGaugeChart as Type<unknown>,
    template: `<st-dataviz-solid-gauge-chart [store]="store" viewId="v" value="amount" label="L" class="probe"></st-dataviz-solid-gauge-chart>`,
    re: RE.SolidGaugeChart as ComponentType<Props>,
    props: { viewId: 'v', value: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'ViolinChart',
    ng: NG.ViolinChart as Type<unknown>,
    template: `<st-dataviz-violin-chart [store]="store" viewId="v" groupBy="region" measure="amount" label="L" class="probe"></st-dataviz-violin-chart>`,
    re: RE.ViolinChart as ComponentType<Props>,
    props: { viewId: 'v', groupBy: 'region', measure: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'BellCurveChart',
    ng: NG.BellCurveChart as Type<unknown>,
    template: `<st-dataviz-bell-curve-chart [store]="store" viewId="v" measure="amount" label="L" class="probe"></st-dataviz-bell-curve-chart>`,
    re: RE.BellCurveChart as ComponentType<Props>,
    props: { viewId: 'v', measure: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'Density2DChart',
    ng: NG.Density2DChart as Type<unknown>,
    template: `<st-dataviz-density2-d-chart [store]="store" viewId="v" x="amount" y="close" label="L" class="probe"></st-dataviz-density2-d-chart>`,
    re: RE.Density2DChart as ComponentType<Props>,
    props: { viewId: 'v', x: 'amount', y: 'close', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'ContourChart',
    ng: NG.ContourChart as Type<unknown>,
    template: `<st-dataviz-contour-chart [store]="store" viewId="v" x="amount" y="close" value="high" label="L" class="probe"></st-dataviz-contour-chart>`,
    re: RE.ContourChart as ComponentType<Props>,
    props: { viewId: 'v', x: 'amount', y: 'close', value: 'high', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'StateTimelineChart',
    ng: NG.StateTimelineChart as Type<unknown>,
    template: `<st-dataviz-state-timeline-chart [store]="store" viewId="v" series="region" start="ts" end="ts" state="service" label="L" class="probe"></st-dataviz-state-timeline-chart>`,
    re: RE.StateTimelineChart as ComponentType<Props>,
    props: { viewId: 'v', series: 'region', start: 'ts', end: 'ts', state: 'service', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'StatusHistoryChart',
    ng: NG.StatusHistoryChart as Type<unknown>,
    template: `<st-dataviz-status-history-chart [store]="store" viewId="v" series="region" at="ts" value="amount" label="L" class="probe"></st-dataviz-status-history-chart>`,
    re: RE.StatusHistoryChart as ComponentType<Props>,
    props: { viewId: 'v', series: 'region', at: 'ts', value: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'TimelineChart',
    ng: NG.TimelineChart as Type<unknown>,
    template: `<st-dataviz-timeline-chart [store]="store" viewId="v" label_field="region" position="ts" label="L" class="probe"></st-dataviz-timeline-chart>`,
    re: RE.TimelineChart as ComponentType<Props>,
    props: { viewId: 'v', label_field: 'region', position: 'ts', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 59,
    expectedSignatureDiffs: 12,
    attribution: "DS: the two frameworks draw a different timeline (connector+marker vs tick+tickLabel)",
    control: {
      ng: NGDS.TimelineChart as Type<unknown>,
      template: `<st-timeline-chart [data]="controlData" label="L"></st-timeline-chart>`,
      re: REDS.TimelineChart as ComponentType<Props>,
      props: { data: buildTimelineData(wideModel, wideRows, { label: 'region', position: 'ts' }), label: 'L' },
    },
  },
  {
    name: 'GanttChart',
    ng: NG.GanttChart as Type<unknown>,
    template: `<st-dataviz-gantt-chart [store]="store" viewId="v" task="region" start="ts" end="ts" label="L" class="probe"></st-dataviz-gantt-chart>`,
    re: RE.GanttChart as ComponentType<Props>,
    props: { viewId: 'v', task: 'region', start: 'ts', end: 'ts', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'FlamegraphChart',
    ng: NG.FlamegraphChart as Type<unknown>,
    template: `<st-dataviz-flamegraph-chart [store]="store" viewId="v" id="region" parentId="service" name="shape" value="amount" label="L" class="probe"></st-dataviz-flamegraph-chart>`,
    re: RE.FlamegraphChart as ComponentType<Props>,
    props: { viewId: 'v', id: 'region', parentId: 'service', name: 'shape', value: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'StreamgraphChart',
    ng: NG.StreamgraphChart as Type<unknown>,
    template: `<st-dataviz-streamgraph-chart [store]="store" viewId="v" category="region" series="service" measure="amount" label="L" class="probe"></st-dataviz-streamgraph-chart>`,
    re: RE.StreamgraphChart as ComponentType<Props>,
    props: { viewId: 'v', category: 'region', series: 'service', measure: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'BumpChart',
    ng: NG.BumpChart as Type<unknown>,
    template: `<st-dataviz-bump-chart [store]="store" viewId="v" series="region" category="service" measure="amount" label="L" class="probe"></st-dataviz-bump-chart>`,
    re: RE.BumpChart as ComponentType<Props>,
    props: { viewId: 'v', series: 'region', category: 'service', measure: 'amount', label: 'L', className: 'probe' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'BoxPlotChart',
    ng: NG.BoxPlotChart as Type<unknown>,
    template: `<st-dataviz-box-plot-chart [store]="store" viewId="v" value="amount" label="L" class="lot4"></st-dataviz-box-plot-chart>`,
    re: RE.BoxPlotChart as ComponentType<Props>,
    props: { viewId: 'v', value: 'amount', label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'BulletChart',
    ng: NG.BulletChart as Type<unknown>,
    template: `<st-dataviz-bullet-chart [store]="store" viewId="v" value="amount" target="close" label="L" class="lot4"></st-dataviz-bullet-chart>`,
    re: RE.BulletChart as ComponentType<Props>,
    props: { viewId: 'v', value: 'amount', target: 'close', label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'HistogramChart',
    ng: NG.HistogramChart as Type<unknown>,
    template: `<st-dataviz-histogram-chart [store]="store" viewId="v" value="amount" label="L" class="lot4"></st-dataviz-histogram-chart>`,
    re: RE.HistogramChart as ComponentType<Props>,
    props: { viewId: 'v', value: 'amount', label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'CorrelationMatrix',
    ng: NG.CorrelationMatrix as Type<unknown>,
    template: `<st-dataviz-correlation-matrix [store]="store" viewId="v" [measures]="['amount','close']" label="L" class="lot4"></st-dataviz-correlation-matrix>`,
    re: RE.CorrelationMatrix as ComponentType<Props>,
    props: { viewId: 'v', measures: ['amount', 'close'], label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'ParallelCoordinatesChart',
    ng: NG.ParallelCoordinatesChart as Type<unknown>,
    template: `<st-dataviz-parallel-coordinates-chart [store]="store" viewId="v" [measures]="['amount','close']" label="L" class="lot4"></st-dataviz-parallel-coordinates-chart>`,
    re: RE.ParallelCoordinatesChart as ComponentType<Props>,
    props: { viewId: 'v', measures: ['amount', 'close'], label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'AnalyticsClusterPlot',
    ng: NG.AnalyticsClusterPlot as Type<unknown>,
    template: `<st-dataviz-analytics-cluster-plot [store]="store" viewId="v" [fields]="['amount','close']" [k]="1" label="L" class="lot4"></st-dataviz-analytics-cluster-plot>`,
    re: RE.AnalyticsClusterPlot as ComponentType<Props>,
    props: { viewId: 'v', fields: ['amount', 'close'], k: 1, label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'ForecastLineChart',
    ng: NG.ForecastLineChart as Type<unknown>,
    template: `<st-dataviz-forecast-line-chart [store]="store" viewId="v" x="amount" y="close" [periods]="1" label="L" class="lot4"></st-dataviz-forecast-line-chart>`,
    re: RE.ForecastLineChart as ComponentType<Props>,
    props: { viewId: 'v', x: 'amount', y: 'close', periods: 1, label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'ItemChart',
    ng: NG.ItemChart as Type<unknown>,
    template: `<st-dataviz-item-chart [store]="store" viewId="v" label_field="region" value="amount" label="L" class="lot4"></st-dataviz-item-chart>`,
    re: RE.ItemChart as ComponentType<Props>,
    props: { viewId: 'v', label_field: 'region', value: 'amount', label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'PolygonChart',
    ng: NG.PolygonChart as Type<unknown>,
    template: `<st-dataviz-polygon-chart [store]="store" viewId="v" x="amount" y="close" label="L" class="lot4"></st-dataviz-polygon-chart>`,
    re: RE.PolygonChart as ComponentType<Props>,
    props: { viewId: 'v', x: 'amount', y: 'close', label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'TileMapChart',
    ng: NG.TileMapChart as Type<unknown>,
    template: `<st-dataviz-tile-map-chart [store]="store" viewId="v" label_field="region" col="lat" row="lon" value="amount" label="L" class="lot4"></st-dataviz-tile-map-chart>`,
    re: RE.TileMapChart as ComponentType<Props>,
    props: { viewId: 'v', label_field: 'region', col: 'lat', row: 'lon', value: 'amount', label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'VectorFieldChart',
    ng: NG.VectorFieldChart as Type<unknown>,
    template: `<st-dataviz-vector-field-chart [store]="store" viewId="v" x="amount" y="close" length="low" direction="high" label="L" class="lot4"></st-dataviz-vector-field-chart>`,
    re: RE.VectorFieldChart as ComponentType<Props>,
    props: { viewId: 'v', x: 'amount', y: 'close', length: 'low', direction: 'high', label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 3,
    expectedSignatureDiffs: 0,
    attribution: 'DS: Angular emits data-chart-key on each arrow group, React does not',
    control: {
      ng: NGDS.VectorFieldChart as Type<unknown>,
      template: `<st-vector-field-chart [data]="controlData" label="L"></st-vector-field-chart>`,
      re: REDS.VectorFieldChart as ComponentType<Props>,
      props: { data: dsVectorFieldData, label: 'L' },
    },
  },
  {
    name: 'WindBarbChart',
    ng: NG.WindBarbChart as Type<unknown>,
    template: `<st-dataviz-wind-barb-chart [store]="store" viewId="v" at="ts" speed="amount" direction="close" label="L" class="lot4"></st-dataviz-wind-barb-chart>`,
    re: RE.WindBarbChart as ComponentType<Props>,
    props: { viewId: 'v', at: 'ts', speed: 'amount', direction: 'close', label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 3,
    expectedSignatureDiffs: 0,
    attribution: 'DS: Angular emits data-chart-key on each barb group, React does not',
    control: {
      ng: NGDS.WindBarbChart as Type<unknown>,
      template: `<st-wind-barb-chart [data]="controlData" label="L"></st-wind-barb-chart>`,
      re: REDS.WindBarbChart as ComponentType<Props>,
      props: { data: dsWindBarbData, label: 'L' },
    },
  },
  {
    name: 'WordCloudChart',
    ng: NG.WordCloudChart as Type<unknown>,
    template: `<st-dataviz-word-cloud-chart [store]="store" viewId="v" word_field="region" weight="amount" label="L" class="lot4"></st-dataviz-word-cloud-chart>`,
    re: RE.WordCloudChart as ComponentType<Props>,
    props: { viewId: 'v', word_field: 'region', weight: 'amount', label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'PointAndFigureChart',
    ng: NG.PointAndFigureChart as Type<unknown>,
    template: `<st-dataviz-point-and-figure-chart [store]="store" viewId="v" date="ts" close="amount" label="L" class="lot4"></st-dataviz-point-and-figure-chart>`,
    re: RE.PointAndFigureChart as ComponentType<Props>,
    props: { viewId: 'v', date: 'ts', close: 'amount', label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'AnomalySwimLaneChart',
    ng: NG.AnomalySwimLaneChart as Type<unknown>,
    template: `<st-dataviz-anomaly-swim-lane-chart [store]="store" viewId="v" job="region" at="ts" score="amount" label="L" class="lot4"></st-dataviz-anomaly-swim-lane-chart>`,
    re: RE.AnomalySwimLaneChart as ComponentType<Props>,
    props: { viewId: 'v', job: 'region', at: 'ts', score: 'amount', label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'TraceWaterfallChart',
    ng: NG.TraceWaterfallChart as Type<unknown>,
    template: `<st-dataviz-trace-waterfall-chart [store]="store" viewId="v" spanId="service" parentSpanId="region" service="region" start="ts" duration="amount" label="L" class="lot4"></st-dataviz-trace-waterfall-chart>`,
    re: RE.TraceWaterfallChart as ComponentType<Props>,
    props: { viewId: 'v', spanId: 'service', parentSpanId: 'region', service: 'region', start: 'ts', duration: 'amount', label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'EventFeedPanel',
    ng: NG.EventFeedPanel as Type<unknown>,
    template: `<st-dataviz-event-feed-panel [store]="store" viewId="v" at="ts" type="region" severity="service" message="shape" label="L" class="lot4"></st-dataviz-event-feed-panel>`,
    re: RE.EventFeedPanel as ComponentType<Props>,
    props: { viewId: 'v', at: 'ts', type: 'region', severity: 'service', message: 'shape', label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'ForceGraph',
    ng: NG.ForceGraph as Type<unknown>,
    template: `<st-dataviz-force-graph [store]="store" viewId="v" source="region" target="service" label="L" class="lot4"></st-dataviz-force-graph>`,
    re: RE.ForceGraph as ComponentType<Props>,
    props: { viewId: 'v', source: 'region', target: 'service', label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 42,
    expectedSignatureDiffs: 8,
    attribution: 'DS: components-angular renders no edge hit path and no per-node aria-label/role/tabindex',
    control: {
      ng: NGDS.ForceGraph as Type<unknown>,
      template: `<st-force-graph [nodes]="controlData.nodes" [edges]="controlData.edges" label="L"></st-force-graph>`,
      re: REDS.ForceGraph as ComponentType<Props>,
      props: { nodes: dsForceGraph.nodes, edges: dsForceGraph.edges, label: 'L' },
      ngData: dsForceGraph,
    },
  },
  {
    name: 'RibbonChart',
    ng: NG.RibbonChart as Type<unknown>,
    template: `<st-dataviz-ribbon-chart [store]="store" viewId="v" category="region" period="service" value="amount" label="L" class="lot4"></st-dataviz-ribbon-chart>`,
    re: RE.RibbonChart as ComponentType<Props>,
    props: { viewId: 'v', category: 'region', period: 'service', value: 'amount', label: 'L', className: 'lot4' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'Sparkline',
    ng: NG.Sparkline as Type<unknown>,
    template: `<st-dataviz-sparkline [store]="store" viewId="v" dimension="region" measure="amount" label="Amount trend" class="lot5-spark"></st-dataviz-sparkline>`,
    re: RE.Sparkline as ComponentType<Props>,
    props: { viewId: 'v', dimension: 'region', measure: 'amount', label: 'Amount trend', className: 'lot5-spark' },
    fixture: 'wide',
    expectedMarkupDiffs: 2,
    expectedSignatureDiffs: 0,
    attribution: 'DS: components-angular renders the Sparkline root as a div, components-react as a span',
    control: {
      ng: NGDS.Sparkline as Type<unknown>,
      template: `<st-sparkline [data]="controlData" label="Amount trend"></st-sparkline>`,
      re: REDS.Sparkline as ComponentType<Props>,
      props: { data: dsSparklineData, label: 'Amount trend' },
    },
  },
  {
    name: 'ScoreCard',
    ng: NG.ScoreCard as Type<unknown>,
    template: `<st-dataviz-score-card [store]="store" viewId="v" measure="amount" label="Total amount"></st-dataviz-score-card>`,
    re: RE.ScoreCard as ComponentType<Props>,
    props: { viewId: 'v', measure: 'amount', label: 'Total amount' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'LollipopChart',
    ng: NG.LollipopChart as Type<unknown>,
    template: `<st-dataviz-lollipop-chart [store]="store" viewId="v" category="region" measure="amount" label="Amount by region"></st-dataviz-lollipop-chart>`,
    re: RE.LollipopChart as ComponentType<Props>,
    props: { viewId: 'v', category: 'region', measure: 'amount', label: 'Amount by region' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'StepLineChart',
    ng: NG.StepLineChart as Type<unknown>,
    template: `<st-dataviz-step-line-chart [store]="store" viewId="v" category="region" measure="amount" label="Amount by region"></st-dataviz-step-line-chart>`,
    re: RE.StepLineChart as ComponentType<Props>,
    props: { viewId: 'v', category: 'region', measure: 'amount', label: 'Amount by region' },
    fixture: 'wide',
    expectedMarkupDiffs: 1,
    expectedSignatureDiffs: 0,
    attribution: 'DS: components-react writes the step path with H/V shorthand and sets stroke-width/linecap on it, components-angular writes L segments and sets neither',
    control: {
      ng: NGDS.StepLineChart as Type<unknown>,
      template: `<st-step-line-chart [data]="controlData" label="Amount by region"></st-step-line-chart>`,
      re: REDS.StepLineChart as ComponentType<Props>,
      props: { data: dsStepLinePoints, label: 'Amount by region' },
    },
  },
  {
    name: 'CalendarHeatmapChart',
    ng: NG.CalendarHeatmapChart as Type<unknown>,
    template: `<st-dataviz-calendar-heatmap-chart [store]="store" viewId="v" date="day" measure="amount" label="Amount per day"></st-dataviz-calendar-heatmap-chart>`,
    re: RE.CalendarHeatmapChart as ComponentType<Props>,
    props: { viewId: 'v', date: 'day', measure: 'amount', label: 'Amount per day' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'ChordChart',
    ng: NG.ChordChart as Type<unknown>,
    template: `<st-dataviz-chord-chart [store]="store" viewId="v" source="region" target="service" measure="amount" label="Region to service"></st-dataviz-chord-chart>`,
    re: RE.ChordChart as ComponentType<Props>,
    props: { viewId: 'v', source: 'region', target: 'service', measure: 'amount', label: 'Region to service' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'DivergingBarChart',
    ng: NG.DivergingBarChart as Type<unknown>,
    template: `<st-dataviz-diverging-bar-chart [store]="store" viewId="v" category="region" measure="amount" label="Amount by region"></st-dataviz-diverging-bar-chart>`,
    re: RE.DivergingBarChart as ComponentType<Props>,
    props: { viewId: 'v', category: 'region', measure: 'amount', label: 'Amount by region' },
    fixture: 'wide',
    expectedMarkupDiffs: 2,
    expectedSignatureDiffs: 0,
    attribution: 'DS: components-react repeats the tone class on each bar (st-divergentBarChart__bar--positive twice), components-angular writes it once',
    control: {
      ng: NGDS.DivergentBarChart as Type<unknown>,
      template: `<st-divergent-bar-chart [data]="controlData" label="Amount by region" [domain]="[0, 17]" [showLegend]="true"></st-divergent-bar-chart>`,
      re: REDS.DivergentBarChart as ComponentType<Props>,
      props: { data: dsDivergingBarData, label: 'Amount by region', domain: dsDivergingBarDomain, showLegend: true },
    },
  },
  {
    name: 'ParetoChart',
    ng: NG.ParetoChart as Type<unknown>,
    template: `<st-dataviz-pareto-chart [store]="store" viewId="v" category="region" measure="amount" label="Amount by region"></st-dataviz-pareto-chart>`,
    re: RE.ParetoChart as ComponentType<Props>,
    props: { viewId: 'v', category: 'region', measure: 'amount', label: 'Amount by region' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  // Lot 7: hand-written adapters the port generator refuses because a binding
  // reads a prop the descriptor cannot express (see
  // tools/dataviz-angular-port/README.md for the refusal of each one).
  {
    name: 'ErrorBarsChart',
    ng: NG.ErrorBarsChart as Type<unknown>,
    template: `<st-dataviz-error-bars-chart [store]="store" viewId="v" category="region" value="amount" label="Amount by region" class="lot7"></st-dataviz-error-bars-chart>`,
    re: RE.ErrorBarsChart as ComponentType<Props>,
    props: { viewId: 'v', category: 'region', value: 'amount', label: 'Amount by region', className: 'lot7' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'PercentileBandChart',
    ng: NG.PercentileBandChart as Type<unknown>,
    template: `<st-dataviz-percentile-band-chart [store]="store" viewId="v" value="amount" [lower]="0.25" [upper]="0.75" label="Amount percentiles" class="lot7"></st-dataviz-percentile-band-chart>`,
    re: RE.PercentileBandChart as ComponentType<Props>,
    props: { viewId: 'v', value: 'amount', lower: 0.25, upper: 0.75, label: 'Amount percentiles', className: 'lot7' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'ReferenceLineChart',
    ng: NG.ReferenceLineChart as Type<unknown>,
    template: `<st-dataviz-reference-line-chart [store]="store" viewId="v" measure="amount" label="Amount reference" class="lot7"></st-dataviz-reference-line-chart>`,
    re: RE.ReferenceLineChart as ComponentType<Props>,
    props: { viewId: 'v', measure: 'amount', label: 'Amount reference', className: 'lot7' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'TrendLineChart',
    ng: NG.TrendLineChart as Type<unknown>,
    template: `<st-dataviz-trend-line-chart [store]="store" viewId="v" x="amount" y="close" label="Amount vs close trend" class="lot7"></st-dataviz-trend-line-chart>`,
    re: RE.TrendLineChart as ComponentType<Props>,
    props: { viewId: 'v', x: 'amount', y: 'close', label: 'Amount vs close trend', className: 'lot7' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'ComboChart',
    ng: NG.ComboChart as Type<unknown>,
    template: `<st-dataviz-combo-chart [store]="store" viewId="v" category="region" [measures]="['amount', { id: 'close', mark: 'line' }]" label="Amount and close by region" class="lot7"></st-dataviz-combo-chart>`,
    re: RE.ComboChart as ComponentType<Props>,
    props: {
      viewId: 'v',
      category: 'region',
      measures: ['amount', { id: 'close', mark: 'line' }],
      label: 'Amount and close by region',
      className: 'lot7',
    },
    fixture: 'wide',
    expectedMarkupDiffs: 2,
    expectedSignatureDiffs: 0,
    attribution: 'DS: components-angular ComboChart marks each legend swatch aria-hidden, components-react ComboChart does not',
    control: {
      ng: NGDS.ComboChart as Type<unknown>,
      template: `<st-combo-chart [categories]="['eu', 'us']" [bars]="[{ label: 'Amount', data: [17, 5] }]" [lines]="[{ label: 'Close', data: [106, 102] }]" [legend]="true" label="Amount and close by region"></st-combo-chart>`,
      re: REDS.ComboChart as ComponentType<Props>,
      props: {
        categories: dsComboCategories,
        bars: dsComboBars,
        lines: dsComboLines,
        legend: true,
        label: 'Amount and close by region',
      },
    },
  },
  {
    name: 'PivotDataTable',
    ng: NG.PivotDataTable as Type<unknown>,
    template: `<st-dataviz-pivot-data-table [store]="store" viewId="v" [rows]="['region']" [measures]="['amount']" caption="Amount by region" class="lot7"></st-dataviz-pivot-data-table>`,
    re: RE.PivotDataTable as ComponentType<Props>,
    props: { viewId: 'v', rows: ['region'], measures: ['amount'], caption: 'Amount by region', className: 'lot7' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  // Lot 8: hand-written adapters from the "no `void <state>.value` marker"
  // refusal class (see tools/dataviz-angular-port/README.md for the refusal of
  // each one).
  {
    name: 'CrossfilteredBarChart',
    ng: NG.CrossfilteredBarChart as Type<unknown>,
    template: `<st-dataviz-crossfiltered-bar-chart [store]="store" viewId="v" dimension="service" measure="amount" label="Amount by service" class="lot8"></st-dataviz-crossfiltered-bar-chart>`,
    re: RE.CrossfilteredBarChart as ComponentType<Props>,
    props: { viewId: 'v', dimension: 'service', measure: 'amount', label: 'Amount by service', className: 'lot8' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'DrillBarChart',
    ng: NG.DrillBarChart as Type<unknown>,
    template: `<st-dataviz-drill-bar-chart [store]="store" viewId="v" [hierarchy]="hierarchy" measure="amount" label="Amount by region" class="lot8"></st-dataviz-drill-bar-chart>`,
    re: RE.DrillBarChart as ComponentType<Props>,
    props: { viewId: 'v', hierarchy, measure: 'amount', label: 'Amount by region', className: 'lot8' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'DrillBreadcrumb',
    ng: NG.DrillBreadcrumb as Type<unknown>,
    template: `<st-dataviz-drill-breadcrumb [store]="store" viewId="v" [hierarchy]="hierarchy" class="lot8"></st-dataviz-drill-breadcrumb>`,
    re: RE.DrillBreadcrumb as ComponentType<Props>,
    props: { viewId: 'v', hierarchy, className: 'lot8' },
    fixture: 'wide',
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'DashboardActiveFilters',
    ng: NG.DashboardActiveFilters as Type<unknown>,
    template: `<st-dataviz-dashboard-active-filters [store]="store" class="lot8"></st-dataviz-dashboard-active-filters>`,
    re: RE.DashboardActiveFilters as ComponentType<Props>,
    props: { className: 'lot8' },
    fixture: 'wide',
    presetFilter: { dimension: 'region', values: ['eu'] },
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'ValueSlicer',
    ng: NG.ValueSlicer as Type<unknown>,
    template: `<st-dataviz-value-slicer [store]="store" dimension="region" class="lot8"></st-dataviz-value-slicer>`,
    re: RE.ValueSlicer as ComponentType<Props>,
    props: { dimension: 'region', className: 'lot8' },
    fixture: 'wide',
    presetFilter: { dimension: 'region', values: ['eu'] },
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
  {
    name: 'VennChart',
    ng: NG.VennChart as Type<unknown>,
    template: `<st-dataviz-venn-chart [areas]="vennAreas" label="Overlap" class="lot8"></st-dataviz-venn-chart>`,
    re: RE.VennChart as ComponentType<Props>,
    props: { areas: vennAreas, label: 'Overlap', className: 'lot8' },
    storeless: true,
    expectedMarkupDiffs: 0,
    expectedSignatureDiffs: 0,
    attribution: '—',
  },
];

type Row = {
  name: string;
  entries: number;
  markup: number;
  signature: number;
  control: number | null;
  attribution: string;
};

const table: Row[] = [];

/** The accessible data-list items of one render, in order. */
type DataList = { name: string; angular: string[]; react: string[] };
const dataLists: DataList[] = [];

function parseHtml(html: string): Element {
  const host = document.createElement('div');
  host.innerHTML = html;
  return host;
}

/**
 * The items of the shared `ChartDataList`, found by the `aria-label` it carries
 * rather than by position in the flattened tree. Empty when the render has no
 * such list (`EventFeedPanel` and `ForceGraph` render none — see PATTERN.md).
 */
function dataListItems(root: Element): string[] {
  const list = root.querySelector('[aria-label^="Data values"]');
  if (list === null) return [];
  return Array.from(list.querySelectorAll('li')).map((li) => (li.textContent ?? '').replace(/\s+/g, ' ').trim());
}

/**
 * The cases whose design-system component renders no `Data values for …` list at
 * all, in EITHER framework. They are named rather than skipped, because the
 * identity assertion below compares two lists and an empty one compares to an
 * empty one: without this set, a case that stopped rendering its list would pass
 * silently. `ScoreCard` and `Sparkline` are lot 5's two list-less cases — the DS
 * KpiCard and Sparkline carry their accessible name on the root element instead,
 * and their own mount tests in packages/dataviz-angular assert it.
 */
const NO_DATA_LIST = new Set([
  'DashboardActiveFilters',
  'DashboardFilterBar',
  'DateRangeFilter',
  'DrillBreadcrumb',
  'EventFeedPanel',
  'ForceGraph',
  'KpiCardGroup',
  'PivotDataTable',
  'RecordsTable',
  'ScoreCard',
  'SelectionLegend',
  'Sparkline',
  'ValueSlicer',
]);

function renderAngular(component: Type<unknown>, template: string, store: unknown, controlData?: unknown): Element {
  class Host {
    readonly store = store;
    readonly filterControls = filterControls;
    readonly exportConfig = exportConfig;
    readonly activeFilters = activeFilters;
    readonly dsHeatmapData = dsHeatmapData;
    readonly dsTreemapData = dsTreemapData;
    readonly noop = () => {};
    readonly hierarchy = hierarchy;
    readonly controlData = controlData;
    readonly vennAreas = vennAreas;
  }
  Component({ standalone: true, imports: [component], template })(Host);
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture.nativeElement as Element;
}

describe('dataviz-angular ↔ dataviz-react rendered-markup parity', () => {
  for (const testCase of cases) {
    it(`${testCase.name}: ${testCase.expectedMarkupDiffs} markup / ${testCase.expectedSignatureDiffs} signature differing entries`, () => {
      const make = testCase.fixture === 'wide' ? newWideStore : newStore;
      const ngStore = make();
      const reStore = make();
      if (testCase.select) {
        ngStore.toggleSelection('revenue', 'checkout');
        reStore.toggleSelection('revenue', 'checkout');
      }
      if (testCase.presetFilter) {
        const { dimension, values } = testCase.presetFilter;
        ngStore.setFilter(dimension, { kind: 'include', values });
        reStore.setFilter(dimension, { kind: 'include', values });
      }

      const ngRoot = renderAngular(testCase.ng, testCase.template, ngStore);
      const ngEntries = flatten(ngRoot);
      const reactProps: Props = { ...testCase.props };
      if (!testCase.storeless) reactProps.store = reStore;
      const reHtml = renderToStaticMarkup(createElement(testCase.re, reactProps));
      const reEntries = flattenHtml(reHtml);

      const markupDiffs = diff(ngEntries, reEntries);
      const signatureDiffs = diff(textSignature(ngEntries), textSignature(reEntries));
      dataLists.push({ name: testCase.name, angular: dataListItems(ngRoot), react: dataListItems(parseHtml(reHtml)) });

      let controlDiffs: number | null = null;
      if (testCase.control) {
        const controlNg = flatten(
          renderAngular(testCase.control.ng, testCase.control.template, ngStore, testCase.control.ngData ?? testCase.control.props.data),
        );
        const controlRe = flattenHtml(
          renderToStaticMarkup(createElement(testCase.control.re, testCase.control.props)),
        );
        controlDiffs = diff(controlNg, controlRe).length;
      }

      table.push({
        name: testCase.name,
        entries: Math.max(ngEntries.length, reEntries.length),
        markup: markupDiffs.length,
        signature: signatureDiffs.length,
        control: controlDiffs,
        attribution: testCase.attribution,
      });

      // PARITY_DUMP=<file> appends every differing entry, which is how a residue
      // gets classified before it is either fixed or attributed.
      if (process.env.PARITY_DUMP && (markupDiffs.length || signatureDiffs.length)) {
        appendFileSync(
          process.env.PARITY_DUMP,
          '##### ' + testCase.name + ' markup=' + markupDiffs.length + ' signature=' + signatureDiffs.length +
            '\n' + markupDiffs.slice(0, 10).join('\n') + '\n--- signature ---\n' +
            signatureDiffs.slice(0, 10).join('\n') + '\n',
        );
      }
      // PARITY_RECORD=1 measures and writes the table without asserting, to
      // seed the expected counts of a new lot. Never use it as the gate.
      if (process.env.PARITY_RECORD) return;
      expect(signatureDiffs.length, signatureDiffs.join('\n')).toBe(testCase.expectedSignatureDiffs);
      expect(markupDiffs.length, markupDiffs.slice(0, 4).join('\n')).toBe(testCase.expectedMarkupDiffs);
    });
  }

  /**
   * WHY THIS TEST EXISTS, AND WHAT THE COUNTS ABOVE CANNOT MEASURE.
   * `diff()` compares the two flattened lists POSITION BY POSITION. As soon as one
   * framework emits elements the other does not, everything after that point is
   * shifted and counted as a difference whatever it contains: the count SATURATES
   * and stops measuring anything downstream of the structural divergence.
   *
   * `TimelineChart` is the case that proves it. React emits five `tickLabel` text
   * nodes Angular does not, so its signature list is shifted from index 1 on.
   * Aligning Angular's data list on React's `${position}: ${label}` spelling —
   * Angular used to print the label alone, dropping the position a reader needs —
   * moved NO count at all: 59 markup / 12 signature before and after, the whole
   * suite green either way. A repair that nothing measures is a repair that can be
   * silently undone.
   *
   * So the data list is measured on its own here, located by its `aria-label`
   * instead of by position. Reverting `TimelineChart.dataValueItems` to
   * `${label}` / `${label}: ${description}` turns THIS test red while 59/12 and
   * every other count stay exactly where they are.
   *
   * Both sides empty is an equality too, and a truthful one: `EventFeedPanel` and
   * `ForceGraph` render no such list in either framework (PATTERN.md records that
   * as DS debt), so they assert an absence rather than abstain.
   */
  it('the accessible data list is identical, independently of markup position', () => {
    expect(dataLists).toHaveLength(cases.length);
    const findings = dataLists
      .filter((entry) => entry.angular.join('\u0000') !== entry.react.join('\u0000'))
      .map((entry) => `${entry.name}:\n  angular: ${JSON.stringify(entry.angular)}\n  react:   ${JSON.stringify(entry.react)}`);
    expect(findings, findings.join('\n')).toEqual([]);
    // The assertion must have something to compare: a selector that silently
    // stopped matching would make every case an empty-vs-empty pass. The floor is
    // measured (73 of the 82 cases render a list); the test below is its sharp
    // form, case by case.
    const withList = dataLists.filter((entry) => entry.angular.length > 0).length;
    expect(withList, 'data lists actually found').toBeGreaterThan(70);
  });

  /**
   * The floor above is global: it survives one case falling silent. This one does
   * not. Every case either compares a NON-EMPTY list on both sides, or is named in
   * `NO_DATA_LIST` — and the two groups must cover the table exactly, so neither
   * can grow without being written down. Emptying an adapter's derivation (for
   * instance returning `[]` from `ParetoChart.recompute`) turns this red while the
   * markup and signature counts of that case stay at 0, because both renders lose
   * the same entries.
   */
  it('every case either compares a non-empty data list or is named as having none', () => {
    const silent = dataLists
      .filter((entry) => !NO_DATA_LIST.has(entry.name) && (entry.angular.length === 0 || entry.react.length === 0))
      .map((entry) => `${entry.name}: angular ${entry.angular.length} items, react ${entry.react.length} items`);
    expect(silent, 'these cases compare no data list and are not named as list-less:\n' + silent.join('\n')).toEqual(
      [],
    );

    const spurious = dataLists
      .filter((entry) => NO_DATA_LIST.has(entry.name) && (entry.angular.length > 0 || entry.react.length > 0))
      .map((entry) => `${entry.name}: angular ${entry.angular.length} items, react ${entry.react.length} items`);
    expect(spurious, 'these cases are named as list-less but render a list:\n' + spurious.join('\n')).toEqual([]);

    // Exact partition: nothing is outside the two groups.
    const withList = dataLists.filter((entry) => entry.angular.length > 0).length;
    expect(withList + NO_DATA_LIST.size, 'list-bearing + named list-less cases').toBe(cases.length);
  });

  it('attributes the residue to the DS components and writes PARITY.md', () => {
    // The adapter passes identical inputs, so its diff count must be exactly the
    // bare DS components' diff count: nothing is added by the adapter.
    const heatmap = table.find((row) => row.name === 'HeatmapChart');
    const treemap = table.find((row) => row.name === 'TreemapChart');
    if (!process.env.PARITY_RECORD) {
      // Every case whose residue is attributed to the design system must show the
      // SAME diff count as the bare DS component with identical inputs. Where the
      // two differ, the adapter is adding something of its own.
      const attributed = [
        'HeatmapChart', 'TreemapChart', 'OHLCChart', 'RenkoChart', 'DumbbellChart', 'SelectionLegend',
        'MekkoChart', 'TimelineChart',
        // Repaired in this lot: both sides are 0 now, and keeping them here
        // asserts the bare DS control STAYS at 0.
        'ArcDiagramChart', 'DependencyWheelChart',
        'VectorFieldChart', 'WindBarbChart', 'ForceGraph',
        // Lot 5: all three residues are DS-level, and the control proves it.
        'Sparkline', 'StepLineChart', 'DivergingBarChart',
        // Lot 7: the ComboChart legend swatch residue is DS-level too.
        'ComboChart',
      ];
      for (const name of attributed) {
        const row = table.find((entry) => entry.name === name);
        expect(row, name).toBeDefined();
        expect(row?.markup, name + ' vs its bare DS control').toBe(row?.control);
      }
    }

    const order = new Map(cases.map((c, i) => [c.name, i]));
    const rows = [...table].sort((a, b) => (order.get(a.name) ?? 0) - (order.get(b.name) ?? 0));
    expect(rows).toHaveLength(cases.length);

    const markdown = [
      '<!-- Generated by `npm run parity:dataviz-angular`. Do not edit by hand. -->',
      '# dataviz-angular ↔ dataviz-react rendered-markup parity',
      '',
      'Counts depend on `tools/dataviz-angular-parity/normalize.ts`; re-run the',
      'command to re-derive them.',
      '',
      '| Adapter | entries | markup diffs | signature diffs | bare DS diffs | attribution |',
      '| --- | --- | --- | --- | --- | --- |',
      ...rows.map(
        (r) =>
          `| \`${r.name}\` | ${r.entries} | ${r.markup === 0 ? '**0**' : r.markup} | ${r.signature === 0 ? '**0**' : r.signature} | ${r.control ?? '—'} | ${r.attribution} |`,
      ),
      '',
      `exact-markup matches: **${rows.filter((r) => r.markup === 0).length}/${rows.length}** · ` +
        `exact-signature matches: **${rows.filter((r) => r.signature === 0).length}/${rows.length}**`,
      '',
    ].join('\n');

    writeFileSync(resolve('tools/dataviz-angular-parity/PARITY.md'), markdown);
    console.log(`\n${markdown}`);
  });
});
