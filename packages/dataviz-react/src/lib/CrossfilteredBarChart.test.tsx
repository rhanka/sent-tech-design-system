import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { CrossfilteredBarChart } from './CrossfilteredBarChart.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Pays', type: 'discrete' },
    { id: 'product', label: 'Produit', type: 'discrete' },
  ],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', product: 'A', sales: 10 },
  { country: 'FR', product: 'B', sales: 5 },
  { country: 'US', product: 'A', sales: 20 },
];

const newStore = () => createDashboardStore({ model, data });
const bars = (c: HTMLElement) => c.querySelectorAll('.st-barChart__bar').length;

describe('CrossfilteredBarChart (react)', () => {
  it('exposes the chart with its accessible label', () => {
    render(
      <CrossfilteredBarChart store={newStore()} viewId="byCountry" dimension="country" measure="sales" label="Ventes par pays" />,
    );
    expect(screen.getByRole('img', { name: 'Ventes par pays' })).toBeTruthy();
  });

  it('aggregates rows into one bar (and one selection chip) per distinct value', () => {
    const { container } = render(
      <CrossfilteredBarChart store={newStore()} viewId="byCountry" dimension="country" measure="sales" label="Ventes par pays" />,
    );
    expect(bars(container)).toBe(2);
    expect(screen.getByRole('button', { name: /^FR:/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^US:/ })).toBeTruthy();
  });

  it('toggles this view selection when a bar chip is clicked (brushing input)', () => {
    const store = newStore();
    render(
      <CrossfilteredBarChart store={store} viewId="byCountry" dimension="country" measure="sales" label="Ventes par pays" />,
    );
    act(() => {
      screen.getByRole('button', { name: /^FR:/ }).click();
    });
    expect(store.getState().selections.byCountry).toEqual(['FR']);
  });

  it('re-aggregates reactively as the shared filter state narrows the rows', () => {
    const store = newStore();
    const { container } = render(
      <CrossfilteredBarChart store={store} viewId="byCountry" dimension="country" measure="sales" label="Ventes par pays" />,
    );
    expect(bars(container)).toBe(2);
    act(() => {
      store.setFilter('country', { kind: 'include', values: ['FR'] });
    });
    expect(bars(container)).toBe(1);
    expect(screen.queryByRole('button', { name: /^US:/ })).toBeNull();
  });

  it('is output-only when selectable is false (no selection chips)', () => {
    render(
      <CrossfilteredBarChart store={newStore()} viewId="byCountry" dimension="country" measure="sales" label="Ventes par pays" selectable={false} />,
    );
    expect(screen.queryByRole('button', { name: /^FR:/ })).toBeNull();
  });

  it('allocates enough horizontal label margin for long category labels', () => {
    const longModel: DataModel = {
      dimensions: [{ id: 'maildomain', label: 'Domaine', type: 'discrete' }],
      measures: [{ id: 'calls', label: 'Appels', aggregation: 'sum' }],
    };
    const longRows: Row[] = [
      { maildomain: 'ca-norddefrance.fr', calls: 431_000 },
      { maildomain: 'o-lambret.fr', calls: 366_000 },
    ];
    const { container } = render(
      <CrossfilteredBarChart
        store={createDashboardStore({ model: longModel, data: longRows })}
        viewId="maildomains"
        dimension="maildomain"
        measure="calls"
        label="Appels par maildomain"
        orientation="horizontal"
        selectable={false}
        width={360}
      />,
    );

    const firstLabel = container.querySelector('.st-barChart__categoryLabel');
    expect(Number(firstLabel?.getAttribute('x'))).toBeGreaterThan(80);
  });

  it('renders no bars when the measure or dimension is unknown', () => {
    const { container: c1 } = render(
      <CrossfilteredBarChart store={newStore()} viewId="v" dimension="country" measure="nope" label="Vide" />,
    );
    expect(bars(c1)).toBe(0);
    const { container: c2 } = render(
      <CrossfilteredBarChart store={newStore()} viewId="v" dimension="nope" measure="sales" label="Vide" />,
    );
    expect(bars(c2)).toBe(0);
  });
});
