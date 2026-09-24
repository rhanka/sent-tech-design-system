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
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { diff, flatten, flattenHtml, textSignature } from './normalize.js';
import {
  activeFilters,
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
    expectedMarkupDiffs: 28,
    expectedSignatureDiffs: 1,
    attribution: 'DS: components-angular vs components-react HeatmapChart',
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
    expectedSignatureDiffs: 1,
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
    expectedMarkupDiffs: 8,
    expectedSignatureDiffs: 5,
    attribution: 'DS SelectionChip icon path + DS Inline takes no ARIA input',
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

function renderAngular(component: Type<unknown>, template: string, store: unknown): Element {
  class Host {
    readonly store = store;
    readonly filterControls = filterControls;
    readonly exportConfig = exportConfig;
    readonly activeFilters = activeFilters;
    readonly dsHeatmapData = dsHeatmapData;
    readonly dsTreemapData = dsTreemapData;
    readonly noop = () => {};
  }
  Component({ standalone: true, imports: [component], template })(Host);
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture.nativeElement as Element;
}

describe('dataviz-angular ↔ dataviz-react rendered-markup parity', () => {
  for (const testCase of cases) {
    it(`${testCase.name}: ${testCase.expectedMarkupDiffs} markup / ${testCase.expectedSignatureDiffs} signature differing entries`, () => {
      const ngStore = newStore();
      const reStore = newStore();
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
        const controlNg = flatten(renderAngular(testCase.control.ng, testCase.control.template, ngStore));
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

      expect(signatureDiffs.length, signatureDiffs.join('\n')).toBe(testCase.expectedSignatureDiffs);
      expect(markupDiffs.length, markupDiffs.slice(0, 4).join('\n')).toBe(testCase.expectedMarkupDiffs);
    });
  }

  it('attributes the residue to the DS components and writes PARITY.md', () => {
    // The adapter passes identical inputs, so its diff count must be exactly the
    // bare DS components' diff count: nothing is added by the adapter.
    const heatmap = table.find((row) => row.name === 'HeatmapChart');
    const treemap = table.find((row) => row.name === 'TreemapChart');
    expect(heatmap?.markup).toBe(heatmap?.control);
    expect(treemap?.markup).toBe(treemap?.control);

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
