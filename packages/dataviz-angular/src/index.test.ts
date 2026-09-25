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
import * as surface from '../dist/index.js';

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

  /**
   * The table above names the twelve adapters of the first lot explicitly, which
   * is what pins their imports. It is not the whole surface, so this case sweeps
   * every export instead: any value carrying `stComponentName` must carry its own
   * export name, whoever wrote it. A wrong name in a hand-written lot used to be
   * invisible here. The floor keeps the filter from degenerating to nothing.
   */
  it('gives every exported adapter an stComponentName equal to its export name', () => {
    const adapters = Object.entries(surface as Record<string, unknown>).filter(
      ([, value]) => typeof value === 'function' && typeof (value as { stComponentName?: unknown }).stComponentName === 'string',
    );
    expect(adapters.length, 'exported adapters found').toBeGreaterThan(80);
    const mismatches = adapters
      .filter(([name, value]) => (value as { stComponentName?: string }).stComponentName !== name)
      .map(([name, value]) => `${name}: stComponentName = ${(value as { stComponentName?: string }).stComponentName}`);
    expect(mismatches, mismatches.join('\n')).toEqual([]);
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
