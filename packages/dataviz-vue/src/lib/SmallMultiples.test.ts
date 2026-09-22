import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { SmallMultiples } from './SmallMultiples.js';

const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Région', type: 'discrete' },
    { id: 'product', label: 'Produit', type: 'discrete' },
  ],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { region: 'Nord', product: 'A', sales: 10 },
  { region: 'Nord', product: 'B', sales: 5 },
  { region: 'Sud', product: 'A', sales: 20 },
];

const newStore = () => createDashboardStore({ model, data });
const base = { viewId: 'sm', facetBy: 'region', dimension: 'product', measure: 'sales', label: 'Ventes par produit' };

describe('SmallMultiples (vue)', () => {
  it('renders the facet group with its aria-label', () => {
    const w = mount(SmallMultiples, { props: { store: newStore(), ...base } });
    expect(w.find('[role="group"]').attributes('aria-label')).toBe('Ventes par produit');
  });

  it('renders one facet chart per distinct facetBy value, labelled by facet', () => {
    const w = mount(SmallMultiples, { props: { store: newStore(), ...base } });
    const charts = w.findAll('.st-barChart__visual');
    expect(charts).toHaveLength(2);
    expect(charts.map((c) => c.attributes('aria-label'))).toEqual([
      'Ventes par produit — Nord',
      'Ventes par produit — Sud',
    ]);
  });

  it('shares one value domain across facets (the Nord facet shows the global max 20)', () => {
    const w = mount(SmallMultiples, { props: { store: newStore(), ...base } });
    const charts = w.findAll('.st-barChart');
    expect(charts).toHaveLength(2);
    const nordTicks = charts[0].findAll('.st-barChart__tickLabel').map((t) => t.text().trim());
    expect(nordTicks).toContain('20');
  });

  it('renders no facets when the facet dimension is unknown', () => {
    const w = mount(SmallMultiples, { props: { store: newStore(), ...base, facetBy: 'nope' } });
    expect(w.findAll('.st-barChart')).toHaveLength(0);
  });
});
