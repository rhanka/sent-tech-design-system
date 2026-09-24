import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import {
  AreaChart,
  DashboardFilterBar,
  DateHistogramChart,
  DateRangeFilter,
  DonutChart,
  HeatmapChart,
  KpiCardGroup,
  QueryBar,
  RecordsTable,
  ScatterPlot,
  SelectionLegend,
  TreemapChart,
  createDashboard,
  dateRangeToSpec,
  toSignalStore,
} from '../dist/index.js';

/** Every store-driven adapter the package exports, with its `stComponentName`. */
const components = [
  ['QueryBar', QueryBar],
  ['DateHistogramChart', DateHistogramChart],
  ['AreaChart', AreaChart],
  ['DonutChart', DonutChart],
  ['HeatmapChart', HeatmapChart],
  ['ScatterPlot', ScatterPlot],
  ['TreemapChart', TreemapChart],
  ['DashboardFilterBar', DashboardFilterBar],
  ['DateRangeFilter', DateRangeFilter],
  ['RecordsTable', RecordsTable],
  ['KpiCardGroup', KpiCardGroup],
  ['SelectionLegend', SelectionLegend],
] as const;

describe('Angular public surface', () => {
  it('exports standalone wrapper components', () => {
    for (const [name, component] of components) {
      expect(typeof component, name).toBe('function');
      expect((component as { stComponentName?: string }).stComponentName, name).toBe(name);
    }
  });

  it('exports signal helpers', () => {
    expect(typeof toSignalStore).toBe('function');
    expect(typeof createDashboard).toBe('function');
  });

  it('exports the pure helpers that ship with an adapter', () => {
    expect(typeof dateRangeToSpec).toBe('function');
    expect(dateRangeToSpec({ start: null, end: null })).toBeNull();
  });
});
