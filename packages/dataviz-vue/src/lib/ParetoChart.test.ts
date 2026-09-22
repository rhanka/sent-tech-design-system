import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { ParetoChart } from './ParetoChart.js';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', sales: 10 },
  { country: 'US', sales: 20 },
  { country: 'CA', sales: 5 },
  { country: 'FR', sales: 5 },
];

const newStore = () => createDashboardStore({ model, data });
const base = { viewId: 'pareto', category: 'country', measure: 'sales', label: 'Pareto ventes' };

describe('ParetoChart (vue)', () => {
  it('renders a design-system Pareto chart from cross-filtered rows', () => {
    const w = mount(ParetoChart, { props: { store: newStore(), ...base } });

    expect(w.find('[role="img"]').attributes('aria-label')).toBe('Pareto ventes');
    expect(w.findAll('.st-paretoChart__bar')).toHaveLength(3);
    expect(w.findAll('.st-paretoChart__cumDot')).toHaveLength(3);
    expect(w.text()).toContain('US: 20');
  });

  it('rebuilds from this view cross-filter scope when filters change', async () => {
    const store = newStore();
    const w = mount(ParetoChart, { props: { store, ...base } });

    expect(w.findAll('.st-paretoChart__bar')).toHaveLength(3);
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    await nextTick();

    expect(w.findAll('.st-paretoChart__bar')).toHaveLength(1);
    expect(w.text()).toContain('FR: 15');
    expect(w.text()).not.toContain('US: 20');
  });

  it('renders no Pareto marks when fields are unknown', () => {
    const w = mount(ParetoChart, {
      props: { store: newStore(), viewId: 'pareto', category: 'country', measure: 'missing', label: 'Vide' },
    });

    expect(w.find('[role="img"]').attributes('aria-label')).toBe('Vide');
    expect(w.findAll('.st-paretoChart__bar')).toHaveLength(0);
  });
});
