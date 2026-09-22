import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { AdvancedPivotDataTable } from './AdvancedPivotDataTable.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Country', type: 'discrete' },
    { id: 'category', label: 'Category', type: 'discrete' },
    { id: 'channel', label: 'Channel', type: 'discrete' },
    { id: 'month', label: 'Month', type: 'discrete' },
  ],
  measures: [{ id: 'revenue', label: 'Revenue', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', category: 'A', channel: 'web', month: 'Jan', revenue: 100 },
  { country: 'FR', category: 'B', channel: 'web', month: 'Feb', revenue: 50 },
  { country: 'US', category: 'A', channel: 'store', month: 'Jan', revenue: 200 },
  { country: 'US', category: 'B', channel: 'store', month: 'Feb', revenue: 100 },
];

const newStore = () => createDashboardStore({ model, data });

describe('AdvancedPivotDataTable (vue)', () => {
  it('renders subtotals, heat metadata and sparkline summaries', () => {
    const w = mount(AdvancedPivotDataTable, {
      props: {
        store: newStore(),
        rows: ['country', 'category'],
        columns: ['channel'],
        measures: ['revenue'],
        includeSubtotals: true,
        heatmap: true,
        sparklineDimension: 'month',
        caption: 'Advanced pivot',
      },
    });

    expect(w.text()).toContain('Advanced pivot');
    expect(w.text()).toContain('Country');
    expect(w.text()).toContain('Category');
    expect(w.text()).toContain('web · Revenue');
    expect(w.text()).toContain('FR subtotal');
    expect(w.text()).toContain('A');
    expect(w.text()).toContain('150 heat 50% sparkline Jan 100, Feb 50');
    expect(w.text()).toContain('0 heat 0% sparkline');
  });

  it('hides descendants of collapsed subtotal paths', () => {
    const w = mount(AdvancedPivotDataTable, {
      props: {
        store: newStore(),
        rows: ['country', 'category'],
        measures: ['revenue'],
        includeSubtotals: true,
        collapsedRowPaths: ['FR'],
      },
    });

    expect(w.text()).toContain('FR subtotal');
    expect(w.text()).not.toContain('FR A');
    expect(w.text()).toContain('US subtotal');
    expect(w.text()).toContain('US A');
  });

  it('emits subtotal row toggles from DS row clicks', async () => {
    const onToggleRowPath = vi.fn();
    const w = mount(AdvancedPivotDataTable, {
      props: {
        store: newStore(),
        rows: ['country', 'category'],
        measures: ['revenue'],
        includeSubtotals: true,
        onToggleRowPath,
      },
    });

    await w.find('tbody tr').trigger('click');
    expect(onToggleRowPath).toHaveBeenCalledWith('FR', expect.objectContaining({ __kind: 'subtotal' }));
  });

  it('updates when the shared filter state changes', async () => {
    const store = newStore();
    const w = mount(AdvancedPivotDataTable, {
      props: { store, rows: ['country', 'category'], measures: ['revenue'] },
    });
    expect(w.text()).toContain('US A');

    store.setFilter('country', { kind: 'include', values: ['FR'] });
    await nextTick();

    expect(w.text()).not.toContain('US A');
    expect(w.text()).toContain('FR A');
  });
});
