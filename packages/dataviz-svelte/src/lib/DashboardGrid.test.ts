import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type { DashboardLayout } from '@sentropic/dataviz-core';
import DashboardGrid from './DashboardGrid.svelte';

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

describe('DashboardGrid', () => {
  it('renders layout panels with stable grid placement', () => {
    render(DashboardGrid, { props: { layout, panels } });

    const list = screen.getByRole('list', { name: 'Dashboard layout' });
    expect(list.getAttribute('style')).toContain('repeat(12, minmax(0, 1fr))');
    expect(screen.getByRole('listitem', { name: 'Revenue cards' }).getAttribute('style')).toContain(
      'grid-column: 1 / span 12',
    );
    expect(screen.getByText('KPI row')).toBeTruthy();
  });

  it('keeps edit controls hidden until editable mode is enabled', () => {
    render(DashboardGrid, { props: { layout, panels } });

    expect(screen.queryByRole('button', { name: 'Move Revenue trend right' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Resize Revenue trend' })).toBeNull();
  });

  it('emits a normalized layout when move and resize controls are used', async () => {
    const onLayoutChange = vi.fn();
    render(DashboardGrid, { props: { layout, panels, editable: true, onLayoutChange } });

    await fireEvent.click(screen.getByRole('button', { name: 'Move Revenue trend right' }));
    expect(onLayoutChange).toHaveBeenLastCalledWith({
      columns: 12,
      panels: [
        { id: 'kpis', x: 0, y: 0, w: 12, h: 1 },
        { id: 'trend', x: 1, y: 1, w: 8, h: 3 },
      ],
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Widen Revenue trend' }));
    expect(onLayoutChange).toHaveBeenLastCalledWith({
      columns: 12,
      panels: [
        { id: 'kpis', x: 0, y: 0, w: 12, h: 1 },
        { id: 'trend', x: 1, y: 1, w: 9, h: 3 },
      ],
    });
  });

  it('supports pointer drag on the move handle', async () => {
    const onLayoutChange = vi.fn();
    const { container } = render(DashboardGrid, {
      props: { layout, panels, editable: true, onLayoutChange, rowHeight: 100 },
    });
    const grid = container.querySelector('.dv-dashboard-grid') as HTMLElement;
    grid.getBoundingClientRect = () =>
      ({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 1200,
        bottom: 600,
        width: 1200,
        height: 600,
        toJSON: () => {},
      }) as DOMRect;

    await fireEvent.pointerDown(screen.getByRole('button', { name: 'Drag Revenue trend' }), {
      pointerId: 1,
      clientX: 0,
      clientY: 0,
    });
    await fireEvent.pointerMove(window, { pointerId: 1, clientX: 200, clientY: 100 });
    await fireEvent.pointerUp(window, { pointerId: 1, clientX: 200, clientY: 100 });

    expect(onLayoutChange).toHaveBeenLastCalledWith({
      columns: 12,
      panels: [
        { id: 'kpis', x: 0, y: 0, w: 12, h: 1 },
        { id: 'trend', x: 2, y: 2, w: 8, h: 3 },
      ],
    });
  });
});
