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
  /** Expected markup diffs; anything else is a regression. */
  expectedMarkupDiffs: number;
  /** Expected content-signature diffs. */
  expectedSignatureDiffs: number;
  /** Where a non-zero markup diff comes from. */
  attribution: string;
  /** Which fixture to mount: the lot 1 one by default, 'wide' for lot 2. */
  fixture?: 'wide';
  /** Bare DS control: same inputs, no adapter. */
  control?: { ng: Type<unknown>; template: string; re: ComponentType<Props>; props: Props };
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

      const ngEntries = flatten(renderAngular(testCase.ng, testCase.template, ngStore));
      const reactProps: Props = { ...testCase.props };
      if (!testCase.storeless) reactProps.store = reStore;
      const reEntries = flattenHtml(renderToStaticMarkup(createElement(testCase.re, reactProps)));

      const markupDiffs = diff(ngEntries, reEntries);
      const signatureDiffs = diff(textSignature(ngEntries), textSignature(reEntries));

      let controlDiffs: number | null = null;
      if (testCase.control) {
        const controlNg = flatten(
          renderAngular(testCase.control.ng, testCase.control.template, ngStore, testCase.control.props.data),
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
        'MekkoChart', 'ArcDiagramChart', 'DependencyWheelChart', 'TimelineChart',
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
