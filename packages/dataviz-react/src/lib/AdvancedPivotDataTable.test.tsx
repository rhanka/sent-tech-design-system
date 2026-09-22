import { act, fireEvent, render, screen } from '@testing-library/react';
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

describe('AdvancedPivotDataTable (react)', () => {
  it('renders subtotals, heat metadata and sparkline summaries', () => {
    const { container } = render(
      <AdvancedPivotDataTable
        store={newStore()}
        rows={['country', 'category']}
        columns={['channel']}
        measures={['revenue']}
        includeSubtotals
        heatmap
        sparklineDimension="month"
        caption="Advanced pivot"
      />,
    );

    expect(screen.getByText('Advanced pivot')).toBeTruthy();
    expect(screen.getByText('Country')).toBeTruthy();
    expect(screen.getByText('Category')).toBeTruthy();
    expect(screen.getByText('web · Revenue')).toBeTruthy();
    expect(container.textContent).toContain('FR subtotal');
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('150 heat 50% sparkline Jan 100, Feb 50');
    expect(container.textContent).toContain('0 heat 0% sparkline');
  });

  it('hides descendants of collapsed subtotal paths', () => {
    const { container } = render(
      <AdvancedPivotDataTable
        store={newStore()}
        rows={['country', 'category']}
        measures={['revenue']}
        includeSubtotals
        collapsedRowPaths={['FR']}
      />,
    );

    expect(container.textContent).toContain('FR subtotal');
    expect(container.textContent).not.toContain('FR A');
    expect(container.textContent).toContain('US subtotal');
    expect(container.textContent).toContain('US A');
  });

  it('emits subtotal row toggles from DS row clicks', () => {
    const onToggleRowPath = vi.fn();
    render(
      <AdvancedPivotDataTable
        store={newStore()}
        rows={['country', 'category']}
        measures={['revenue']}
        includeSubtotals
        onToggleRowPath={onToggleRowPath}
      />,
    );

    fireEvent.click(screen.getByText('FR subtotal').closest('tr')!);
    expect(onToggleRowPath).toHaveBeenCalledWith('FR', expect.objectContaining({ __kind: 'subtotal' }));
  });

  it('updates when the shared filter state changes', () => {
    const store = newStore();
    const { container } = render(
      <AdvancedPivotDataTable store={store} rows={['country', 'category']} measures={['revenue']} />,
    );
    expect(container.textContent).toContain('US A');

    act(() => {
      store.setFilter('country', { kind: 'include', values: ['FR'] });
    });

    expect(container.textContent).not.toContain('US A');
    expect(container.textContent).toContain('FR A');
  });
});
