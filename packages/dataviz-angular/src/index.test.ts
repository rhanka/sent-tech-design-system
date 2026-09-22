import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { DateHistogramChart, QueryBar, createDashboard, toSignalStore } from '../dist/index.js';

describe('Angular public surface', () => {
  it('exports standalone wrapper components', () => {
    expect(typeof QueryBar).toBe('function');
    expect(QueryBar.stComponentName).toBe('QueryBar');
    expect(typeof DateHistogramChart).toBe('function');
    expect(DateHistogramChart.stComponentName).toBe('DateHistogramChart');
  });

  it('exports signal helpers', () => {
    expect(typeof toSignalStore).toBe('function');
    expect(typeof createDashboard).toBe('function');
  });
});
