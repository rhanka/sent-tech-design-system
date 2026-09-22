import { describe, it, expect } from 'vitest';
import {
  buildBulletChartModel,
  type DataModel,
  type Row,
  buildBoxPlotModel,
  buildGaugeChartModel,
  buildHeatmapModel,
  buildHistogramModel,
} from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'segment', label: 'Segment', type: 'discrete' },
    { id: 'day', label: 'Day', type: 'discrete' },
    { id: 'slot', label: 'Slot', type: 'discrete' },
  ],
  measures: [{ id: 'revenue', label: 'Revenue', aggregation: 'sum' }],
};

describe('distribution builders', () => {
  it('builds fixed-width histogram bins over numeric values', () => {
    const rows: Row[] = [
      { revenue: 0 },
      { revenue: 10 },
      { revenue: 20 },
      { revenue: 30 },
      { revenue: 40 },
    ];

    expect(buildHistogramModel(model, rows, { value: 'revenue', bins: 4 })).toEqual({
      valueId: 'revenue',
      domain: [0, 40],
      bins: [
        { index: 0, x0: 0, x1: 10, count: 1 },
        { index: 1, x0: 10, x1: 20, count: 1 },
        { index: 2, x0: 20, x1: 30, count: 1 },
        { index: 3, x0: 30, x1: 40, count: 2 },
      ],
    });
  });

  it('builds grouped box plot stats with Tukey outliers', () => {
    const rows: Row[] = [
      { segment: 'Enterprise', revenue: 10 },
      { segment: 'Enterprise', revenue: 20 },
      { segment: 'Enterprise', revenue: 30 },
      { segment: 'Enterprise', revenue: 40 },
      { segment: 'Enterprise', revenue: 100 },
      { segment: 'SMB', revenue: 5 },
      { segment: 'SMB', revenue: 15 },
      { segment: 'SMB', revenue: 25 },
    ];

    expect(buildBoxPlotModel(model, rows, { value: 'revenue', group: 'segment' })).toEqual({
      valueId: 'revenue',
      groups: [
        {
          key: 'Enterprise',
          label: 'Enterprise',
          count: 5,
          min: 10,
          q1: 20,
          median: 30,
          q3: 40,
          max: 100,
          outliers: [100],
        },
        {
          key: 'SMB',
          label: 'SMB',
          count: 3,
          min: 5,
          q1: 10,
          median: 15,
          q3: 20,
          max: 25,
          outliers: [],
        },
      ],
    });
  });

  it('builds a complete categorical heatmap matrix', () => {
    const rows: Row[] = [
      { day: 'Mon', slot: 'AM', revenue: 10 },
      { day: 'Tue', slot: 'AM', revenue: 20 },
      { day: 'Mon', slot: 'PM', revenue: 5 },
    ];

    expect(buildHeatmapModel(model, rows, { x: 'day', y: 'slot', measure: 'revenue' })).toEqual({
      xKeys: ['Mon', 'Tue'],
      yKeys: ['AM', 'PM'],
      cells: [
        { xKey: 'Mon', yKey: 'AM', value: 10 },
        { xKey: 'Tue', yKey: 'AM', value: 20 },
        { xKey: 'Mon', yKey: 'PM', value: 5 },
        { xKey: 'Tue', yKey: 'PM', value: 0 },
      ],
    });
  });

  it('builds a DS-ready bullet chart model from aggregate measures', () => {
    const rows: Row[] = [
      { segment: 'Enterprise', revenue: 10, target: 30 },
      { segment: 'Enterprise', revenue: 20, target: 30 },
      { segment: 'SMB', revenue: 5, target: 10 },
    ];
    const bulletModel: DataModel = {
      dimensions: [{ id: 'segment', label: 'Segment', type: 'discrete' }],
      measures: [
        { id: 'revenue', label: 'Revenue', aggregation: 'sum' },
        { id: 'target', label: 'Target', aggregation: 'max' },
      ],
    };

    expect(
      buildBulletChartModel(bulletModel, rows, {
        label: 'Revenue vs target',
        value: 'revenue',
        target: 'target',
        category: 'segment',
        ranges: [10, 25, 40],
      }),
    ).toEqual({
      label: 'Revenue vs target',
      valueId: 'revenue',
      targetId: 'target',
      data: [
        { key: 'Enterprise', label: 'Enterprise', value: 30, target: 30, ranges: [10, 25, 40] },
        { key: 'SMB', label: 'SMB', value: 5, target: 10, ranges: [10, 25, 40] },
      ],
    });
  });

  it('builds a DS-ready gauge model with clamped aggregate value and sorted thresholds', () => {
    const rows: Row[] = [{ revenue: 20 }, { revenue: 40 }, { revenue: 60 }];

    expect(
      buildGaugeChartModel(model, rows, {
        label: 'Quota',
        value: 'revenue',
        min: 0,
        max: 100,
        thresholds: [
          { value: 80, tone: 'success' },
          { value: 50, tone: 'warning' },
        ],
        unit: '$',
      }),
    ).toEqual({
      label: 'Quota',
      valueId: 'revenue',
      value: 120,
      displayValue: 100,
      min: 0,
      max: 100,
      thresholds: [
        { value: 50, tone: 'warning' },
        { value: 80, tone: 'success' },
      ],
      format: 'number',
      unit: '$',
    });
  });

  it('validates fields before computing distribution models', () => {
    expect(() => buildHistogramModel(model, [], { value: 'ghost' })).toThrow(
      /Unknown histogram value field: ghost/,
    );
    expect(() => buildHistogramModel(model, [], { value: 'revenue', bins: 0 })).toThrow(
      /Histogram bins must be a positive integer/,
    );
    expect(() => buildBoxPlotModel(model, [], { value: 'revenue', group: 'ghost' })).toThrow(
      /Unknown box plot group dimension: ghost/,
    );
    expect(() =>
      buildHeatmapModel(model, [], { x: 'day', y: 'ghost', measure: 'revenue' }),
    ).toThrow(/Unknown heatmap y dimension: ghost/);
    expect(() => buildBulletChartModel(model, [], { value: 'revenue', target: 'ghost' })).toThrow(
      /Unknown bullet target measure: ghost/,
    );
    expect(() => buildGaugeChartModel(model, [], { value: 'ghost' })).toThrow(
      /Unknown gauge value measure: ghost/,
    );
    expect(() => buildGaugeChartModel(model, [], { value: 'revenue', min: 10, max: 0 })).toThrow(
      /Gauge domain must be finite and ordered/,
    );
    expect(() =>
      buildGaugeChartModel(model, [], {
        value: 'revenue',
        thresholds: [{ value: Number.NaN, tone: 'warning' }],
      }),
    ).toThrow(/Gauge threshold values must be finite/);
  });
});
