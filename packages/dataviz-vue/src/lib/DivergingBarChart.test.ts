import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { DivergingBarChart } from './DivergingBarChart.js';

const model: DataModel = {
  dimensions: [{ id: 'region', label: 'Region', type: 'discrete' }],
  measures: [{ id: 'delta', label: 'Delta', aggregation: 'sum' }],
};

const data: Row[] = [
  { region: 'North', delta: 12 },
  { region: 'South', delta: -8 },
  { region: 'West', delta: 0 },
  { region: 'North', delta: 3 },
];

const newStore = () => createDashboardStore({ model, data });
const base = { viewId: 'delta', category: 'region', measure: 'delta', label: 'Delta par region' };

describe('DivergingBarChart (vue)', () => {
  it('renders a design-system divergent bar chart from cross-filtered rows', () => {
    const w = mount(DivergingBarChart, { props: { store: newStore(), ...base } });

    expect(w.find('[role="img"]').attributes('aria-label')).toBe('Delta par region');
    expect(w.findAll('.st-divergentBarChart__bar')).toHaveLength(3);
    expect(w.find('.st-divergentBarChart__bar--positive').exists()).toBe(true);
    expect(w.find('.st-divergentBarChart__bar--negative').exists()).toBe(true);
    expect(w.find('.st-divergentBarChart__bar--neutral').exists()).toBe(true);
    expect(w.text()).toContain('North: 15');
  });

  it('rebuilds from this view cross-filter scope when filters change', async () => {
    const store = newStore();
    const w = mount(DivergingBarChart, { props: { store, ...base } });

    expect(w.findAll('.st-divergentBarChart__bar')).toHaveLength(3);
    store.setFilter('region', { kind: 'include', values: ['South'] });
    await nextTick();

    expect(w.findAll('.st-divergentBarChart__bar')).toHaveLength(1);
    expect(w.find('.st-divergentBarChart__bar--negative').exists()).toBe(true);
    expect(w.text()).toContain('South: -8');
    expect(w.text()).not.toContain('North: 15');
  });

  it('renders no bars when fields are unknown', () => {
    const w = mount(DivergingBarChart, {
      props: { store: newStore(), viewId: 'delta', category: 'missing', measure: 'delta', label: 'Vide' },
    });

    expect(w.find('[role="img"]').attributes('aria-label')).toBe('Vide');
    expect(w.findAll('.st-divergentBarChart__bar')).toHaveLength(0);
  });
});
