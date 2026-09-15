import { describe, it, expect } from 'vitest';
import {
  type DataModel,
  type Row,
  buildFlowModel,
  buildMekkoModel,
  buildPartWholeHierarchy,
  buildPartWholeModel,
  buildPackedBubbleModel,
  buildRadarModel,
  buildRoseModel,
  buildWaterfallModel,
} from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Region', type: 'discrete' },
    { id: 'segment', label: 'Segment', type: 'discrete' },
    { id: 'stage', label: 'Stage', type: 'discrete' },
    { id: 'source', label: 'Source', type: 'discrete' },
    { id: 'target', label: 'Target', type: 'discrete' },
  ],
  measures: [{ id: 'revenue', label: 'Revenue', aggregation: 'sum' }],
};

const partData: Row[] = [
  { region: 'EU', segment: 'Enterprise', revenue: 100 },
  { region: 'NA', segment: 'Enterprise', revenue: 50 },
  { region: 'EU', segment: 'SMB', revenue: 50 },
  { region: 'APAC', segment: 'SMB', revenue: 100 },
];

describe('part-of-whole builders', () => {
  it('aggregates parts with percent and cumulative values', () => {
    expect(
      buildPartWholeModel(model, partData, {
        category: 'region',
        measure: 'revenue',
        sort: 'value-desc',
      }),
    ).toEqual({
      total: 300,
      items: [
        {
          key: 'EU',
          label: 'EU',
          value: 150,
          percent: 0.5,
          cumulativeValue: 150,
          cumulativePercent: 0.5,
        },
        {
          key: 'APAC',
          label: 'APAC',
          value: 100,
          percent: 1 / 3,
          cumulativeValue: 250,
          cumulativePercent: 250 / 300,
        },
        {
          key: 'NA',
          label: 'NA',
          value: 50,
          percent: 1 / 6,
          cumulativeValue: 300,
          cumulativePercent: 1,
        },
      ],
    });
  });

  it('builds a hierarchy for treemap and sunburst renderers', () => {
    expect(
      buildPartWholeHierarchy(model, partData, {
        hierarchy: ['region', 'segment'],
        measure: 'revenue',
      }),
    ).toEqual({
      key: 'root',
      label: 'Total',
      value: 300,
      children: [
        {
          key: 'EU',
          label: 'EU',
          value: 150,
          children: [
            { key: 'EU\u001fEnterprise', label: 'Enterprise', value: 100 },
            { key: 'EU\u001fSMB', label: 'SMB', value: 50 },
          ],
        },
        {
          key: 'NA',
          label: 'NA',
          value: 50,
          children: [{ key: 'NA\u001fEnterprise', label: 'Enterprise', value: 50 }],
        },
        {
          key: 'APAC',
          label: 'APAC',
          value: 100,
          children: [{ key: 'APAC\u001fSMB', label: 'SMB', value: 100 }],
        },
      ],
    });
  });

  it('builds cumulative waterfall steps with a final total', () => {
    const rows: Row[] = [
      { stage: 'New', revenue: 120 },
      { stage: 'Expansion', revenue: 40 },
      { stage: 'Churn', revenue: -30 },
    ];

    expect(buildWaterfallModel(model, rows, { category: 'stage', measure: 'revenue' })).toEqual({
      total: 130,
      steps: [
        { key: 'New', label: 'New', kind: 'delta', delta: 120, start: 0, end: 120 },
        { key: 'Expansion', label: 'Expansion', kind: 'delta', delta: 40, start: 120, end: 160 },
        { key: 'Churn', label: 'Churn', kind: 'delta', delta: -30, start: 160, end: 130 },
        { key: 'total', label: 'Total', kind: 'total', delta: 130, start: 0, end: 130 },
      ],
    });
  });

  it('aggregates flow links and first-seen nodes', () => {
    const rows: Row[] = [
      { source: 'Marketing', target: 'Sales', revenue: 100 },
      { source: 'Sales', target: 'Won', revenue: 80 },
      { source: 'Marketing', target: 'Sales', revenue: 50 },
      { source: 'Sales', target: 'Lost', revenue: 20 },
    ];

    expect(buildFlowModel(model, rows, { source: 'source', target: 'target', measure: 'revenue' })).toEqual({
      nodes: [
        { id: 'Marketing', label: 'Marketing' },
        { id: 'Sales', label: 'Sales' },
        { id: 'Won', label: 'Won' },
        { id: 'Lost', label: 'Lost' },
      ],
      links: [
        { id: 'Marketing\u001fSales', source: 'Marketing', target: 'Sales', value: 150 },
        { id: 'Sales\u001fWon', source: 'Sales', target: 'Won', value: 80 },
        { id: 'Sales\u001fLost', source: 'Sales', target: 'Lost', value: 20 },
      ],
    });
  });

  it('builds radar series from aggregate measure axes', () => {
    const radarModel: DataModel = {
      dimensions: [{ id: 'segment', label: 'Segment', type: 'discrete' }],
      measures: [
        { id: 'revenue', label: 'Revenue', aggregation: 'sum' },
        { id: 'margin', label: 'Margin', aggregation: 'avg' },
      ],
    };
    const rows: Row[] = [
      { segment: 'Enterprise', revenue: 100, margin: 0.4 },
      { segment: 'Enterprise', revenue: 50, margin: 0.2 },
      { segment: 'SMB', revenue: 25, margin: 0.1 },
    ];

    expect(buildRadarModel(radarModel, rows, { series: 'segment', axes: ['revenue', 'margin'] })).toEqual({
      axes: [
        { id: 'revenue', label: 'Revenue' },
        { id: 'margin', label: 'Margin' },
      ],
      series: [
        {
          key: 'Enterprise',
          label: 'Enterprise',
          points: [
            { axisId: 'revenue', label: 'Revenue', value: 150 },
            { axisId: 'margin', label: 'Margin', value: 0.30000000000000004 },
          ],
        },
        {
          key: 'SMB',
          label: 'SMB',
          points: [
            { axisId: 'revenue', label: 'Revenue', value: 25 },
            { axisId: 'margin', label: 'Margin', value: 0.1 },
          ],
        },
      ],
    });
  });

  it('builds rose sectors with deterministic angles and percentages', () => {
    expect(buildRoseModel(model, partData, { category: 'region', measure: 'revenue' })).toEqual({
      total: 300,
      sectors: [
        { key: 'EU', label: 'EU', value: 150, percent: 0.5, startAngle: 0, endAngle: 180 },
        { key: 'NA', label: 'NA', value: 50, percent: 1 / 6, startAngle: 180, endAngle: 240 },
        { key: 'APAC', label: 'APAC', value: 100, percent: 1 / 3, startAngle: 240, endAngle: 360 },
      ],
    });
  });

  it('builds Mekko columns with column widths and in-column segment percentages', () => {
    expect(
      buildMekkoModel(model, partData, {
        category: 'region',
        series: 'segment',
        measure: 'revenue',
      }),
    ).toEqual({
      total: 300,
      columns: [
        {
          key: 'EU',
          label: 'EU',
          value: 150,
          width: 0.5,
          start: 0,
          end: 0.5,
          segments: [
            { key: 'Enterprise', label: 'Enterprise', value: 100, percent: 100 / 150 },
            { key: 'SMB', label: 'SMB', value: 50, percent: 50 / 150 },
          ],
        },
        {
          key: 'NA',
          label: 'NA',
          value: 50,
          width: 1 / 6,
          start: 0.5,
          end: 0.5 + 1 / 6,
          segments: [
            { key: 'Enterprise', label: 'Enterprise', value: 50, percent: 1 },
          ],
        },
        {
          key: 'APAC',
          label: 'APAC',
          value: 100,
          width: 1 / 3,
          start: 0.5 + 1 / 6,
          end: 1,
          segments: [
            { key: 'SMB', label: 'SMB', value: 100, percent: 1 },
          ],
        },
      ],
    });
  });

  it('builds packed bubble values with deterministic radii', () => {
    expect(
      buildPackedBubbleModel(model, partData, {
        category: 'region',
        measure: 'revenue',
        sort: 'value-desc',
      }),
    ).toEqual({
      total: 300,
      bubbles: [
        { key: 'EU', label: 'EU', value: 150, percent: 0.5, radius: Math.sqrt(150 / Math.PI) },
        { key: 'APAC', label: 'APAC', value: 100, percent: 1 / 3, radius: Math.sqrt(100 / Math.PI) },
        { key: 'NA', label: 'NA', value: 50, percent: 1 / 6, radius: Math.sqrt(50 / Math.PI) },
      ],
    });
  });

  it('validates dimensions and measures before building models', () => {
    expect(() =>
      buildPartWholeModel(model, partData, { category: 'ghost', measure: 'revenue' }),
    ).toThrow(/Unknown part-whole category dimension: ghost/);
    expect(() =>
      buildPartWholeHierarchy(model, partData, { hierarchy: [], measure: 'revenue' }),
    ).toThrow(/Part-whole hierarchy requires at least one dimension/);
    expect(() =>
      buildWaterfallModel(model, partData, { category: 'region', measure: 'ghost' }),
    ).toThrow(/Unknown waterfall measure: ghost/);
    expect(() =>
      buildFlowModel(model, partData, { source: 'source', target: 'ghost', measure: 'revenue' }),
    ).toThrow(/Unknown flow target dimension: ghost/);
    expect(() => buildRadarModel(model, partData, { axes: [] })).toThrow(
      /Radar requires at least one measure axis/,
    );
    expect(() => buildRadarModel(model, partData, { axes: ['ghost'] })).toThrow(
      /Unknown radar axis measure: ghost/,
    );
    expect(() =>
      buildRoseModel(model, partData, { category: 'ghost', measure: 'revenue' }),
    ).toThrow(/Unknown rose category dimension: ghost/);
    expect(() =>
      buildMekkoModel(model, partData, { category: 'region', series: 'ghost', measure: 'revenue' }),
    ).toThrow(/Unknown Mekko series dimension: ghost/);
    expect(() =>
      buildPackedBubbleModel(model, partData, { category: 'region', measure: 'ghost' }),
    ).toThrow(/Unknown packed bubble measure: ghost/);
  });
});
