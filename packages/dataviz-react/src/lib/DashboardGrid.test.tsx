import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { DashboardLayout } from '@sentropic/dataviz-core';
import { DashboardGrid } from './DashboardGrid.js';

const layout: DashboardLayout = {
  columns: 12,
  panels: [
    { id: 'kpis', x: 0, y: 0, w: 12, h: 1 },
    { id: 'trend', x: 0, y: 1, w: 8, h: 3 },
  ],
};

const panels = [
  { id: 'kpis', title: 'Revenue cards', description: 'KPI row' },
  { id: 'trend', title: 'Revenue trend' },
];

describe('DashboardGrid (react)', () => {
  it('renders layout panels with stable grid placement', () => {
    render(<DashboardGrid layout={layout} panels={panels} />);
    expect(screen.getByRole('list', { name: 'Dashboard layout' })).toBeTruthy();
    expect(screen.getByRole('listitem', { name: 'Revenue cards' }).getAttribute('style')).toContain(
      'grid-column: 1 / span 12',
    );
    expect(screen.getByText('KPI row')).toBeTruthy();
  });

  it('keeps edit controls hidden until editable mode is enabled', () => {
    render(<DashboardGrid layout={layout} panels={panels} />);
    expect(screen.queryByRole('button', { name: 'Move Revenue trend right' })).toBeNull();
  });

  it('emits a normalized layout when move and resize controls are used', () => {
    const onLayoutChange = vi.fn();
    render(<DashboardGrid layout={layout} panels={panels} editable onLayoutChange={onLayoutChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Move Revenue trend right' }));
    expect(onLayoutChange).toHaveBeenLastCalledWith({
      columns: 12,
      panels: [
        { id: 'kpis', x: 0, y: 0, w: 12, h: 1 },
        { id: 'trend', x: 1, y: 1, w: 8, h: 3 },
      ],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Widen Revenue trend' }));
    expect(onLayoutChange).toHaveBeenLastCalledWith({
      columns: 12,
      panels: [
        { id: 'kpis', x: 0, y: 0, w: 12, h: 1 },
        { id: 'trend', x: 1, y: 1, w: 9, h: 3 },
      ],
    });
  });
});
