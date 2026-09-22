import { render, screen } from '@testing-library/react';
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

describe('SmallMultiples (react)', () => {
  it('renders the facet group with its aria-label', () => {
    render(<SmallMultiples store={newStore()} {...base} />);
    expect(screen.getByRole('group', { name: 'Ventes par produit' })).toBeTruthy();
  });

  it('renders one facet chart per distinct facetBy value, labelled by facet', () => {
    render(<SmallMultiples store={newStore()} {...base} />);
    const charts = screen.getAllByRole('img');
    expect(charts).toHaveLength(2);
    expect(charts.map((c) => c.getAttribute('aria-label'))).toEqual([
      'Ventes par produit — Nord',
      'Ventes par produit — Sud',
    ]);
  });

  it('shares one value domain across facets (the Nord facet shows the global max 20)', () => {
    const { container } = render(<SmallMultiples store={newStore()} {...base} />);
    const charts = container.querySelectorAll('.st-barChart');
    expect(charts).toHaveLength(2);
    const nordTicks = Array.from(charts[0].querySelectorAll('.st-barChart__tickLabel')).map((t) =>
      t.textContent?.trim(),
    );
    expect(nordTicks).toContain('20');
  });

  it('renders no facets when the facet dimension is unknown', () => {
    const { container } = render(<SmallMultiples store={newStore()} {...base} facetBy="nope" />);
    expect(container.querySelectorAll('.st-barChart')).toHaveLength(0);
  });
});
