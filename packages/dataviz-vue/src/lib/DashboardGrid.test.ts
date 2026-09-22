import { mount } from '@vue/test-utils';
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

describe('DashboardGrid (vue)', () => {
  it('renders layout panels with stable grid placement', () => {
    const w = mount(DashboardGrid, { props: { layout, panels } });
    expect(w.find('[role="list"]').attributes('aria-label')).toBe('Dashboard layout');
    expect(w.find('[aria-label="Revenue cards"]').attributes('style')).toContain(
      'grid-column: 1 / span 12',
    );
    expect(w.text()).toContain('KPI row');
  });

  it('keeps edit controls hidden until editable mode is enabled', () => {
    const w = mount(DashboardGrid, { props: { layout, panels } });
    expect(w.find('button[aria-label="Move Revenue trend right"]').exists()).toBe(false);
  });

  it('emits a normalized layout when move and resize controls are used', async () => {
    const onLayoutChange = vi.fn();
    const w = mount(DashboardGrid, {
      props: { layout, panels, editable: true, onLayoutChange },
    });

    await w.find('button[aria-label="Move Revenue trend right"]').trigger('click');
    expect(onLayoutChange).toHaveBeenLastCalledWith({
      columns: 12,
      panels: [
        { id: 'kpis', x: 0, y: 0, w: 12, h: 1 },
        { id: 'trend', x: 1, y: 1, w: 8, h: 3 },
      ],
    });

    await w.find('button[aria-label="Widen Revenue trend"]').trigger('click');
    expect(onLayoutChange).toHaveBeenLastCalledWith({
      columns: 12,
      panels: [
        { id: 'kpis', x: 0, y: 0, w: 12, h: 1 },
        { id: 'trend', x: 1, y: 1, w: 9, h: 3 },
      ],
    });
  });
});
