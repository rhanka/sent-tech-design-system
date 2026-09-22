import { fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import AdvancedPivotDataTable from './AdvancedPivotDataTable.svelte';

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

describe('AdvancedPivotDataTable (svelte)', () => {
  it('renders subtotals, heat metadata and sparkline summaries', () => {
    const { container, getByText } = render(AdvancedPivotDataTable, {
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

    expect(getByText('Advanced pivot')).toBeTruthy();
    expect(getByText('Country')).toBeTruthy();
    expect(getByText('Category')).toBeTruthy();
    expect(getByText('web · Revenue')).toBeTruthy();
    expect(container.textContent).toContain('FR subtotal');
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('150 heat 50% sparkline Jan 100, Feb 50');
    expect(container.textContent).toContain('0 heat 0% sparkline');
  });

  it('hides descendants of collapsed subtotal paths', () => {
    const { container } = render(AdvancedPivotDataTable, {
      props: {
        store: newStore(),
        rows: ['country', 'category'],
        measures: ['revenue'],
        includeSubtotals: true,
        collapsedRowPaths: ['FR'],
      },
    });

    expect(container.textContent).toContain('FR subtotal');
    expect(container.textContent).not.toContain('FR A');
    expect(container.textContent).toContain('US subtotal');
    expect(container.textContent).toContain('US A');
  });

  it('emits subtotal row toggles from DS row clicks', async () => {
    const onToggleRowPath = vi.fn();
    const { getByText } = render(AdvancedPivotDataTable, {
      props: {
        store: newStore(),
        rows: ['country', 'category'],
        measures: ['revenue'],
        includeSubtotals: true,
        onToggleRowPath,
      },
    });

    await fireEvent.click(getByText('FR subtotal').closest('tr')!);
    expect(onToggleRowPath).toHaveBeenCalledWith('FR', expect.objectContaining({ __kind: 'subtotal' }));
  });

  it('updates when the shared filter state changes', async () => {
    const store = newStore();
    const { container } = render(AdvancedPivotDataTable, {
      props: { store, rows: ['country', 'category'], measures: ['revenue'] },
    });
    expect(container.textContent).toContain('US A');

    store.setFilter('country', { kind: 'include', values: ['FR'] });
    await tick();

    expect(container.textContent).not.toContain('US A');
    expect(container.textContent).toContain('FR A');
  });
});
