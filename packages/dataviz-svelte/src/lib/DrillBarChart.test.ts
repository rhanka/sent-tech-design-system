import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import DrillBarChart from './DrillBarChart.svelte';

const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Région', type: 'discrete' },
    { id: 'city', label: 'Ville', type: 'discrete' },
  ],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { region: 'Nord', city: 'Lille', sales: 10 },
  { region: 'Nord', city: 'Lille', sales: 5 },
  { region: 'Nord', city: 'Rouen', sales: 7 },
  { region: 'Sud', city: 'Nice', sales: 20 },
];

const newStore = () => createDashboardStore({ model, data });
const base = { viewId: 'd', hierarchy: ['region', 'city'], measure: 'sales', label: 'Ventes' };

describe('DrillBarChart', () => {
  it('groups by the first hierarchy level initially', () => {
    const { getByRole } = render(DrillBarChart, { props: { store: newStore(), ...base } });
    expect(getByRole('button', { name: /^Nord:/ })).toBeTruthy();
    expect(getByRole('button', { name: /^Sud:/ })).toBeTruthy();
  });

  it('drills down on bar click: filters the clicked value and pushes the next level', () => {
    const store = newStore();
    const { getByRole } = render(DrillBarChart, { props: { store, ...base } });
    getByRole('button', { name: /^Nord:/ }).click();
    expect(store.getState().drill.d).toEqual(['city']);
    expect(store.getState().filters.region).toEqual({ kind: 'include', values: ['Nord'] });
  });

  it('shows the cities of the drilled value after drilling', async () => {
    const store = newStore();
    const { getByRole, queryByRole } = render(DrillBarChart, { props: { store, ...base } });
    getByRole('button', { name: /^Nord:/ }).click();
    await tick();
    expect(getByRole('button', { name: /^Lille:/ })).toBeTruthy();
    expect(getByRole('button', { name: /^Rouen:/ })).toBeTruthy();
    expect(queryByRole('button', { name: /^Nice:/ })).toBeNull();
  });

  it('toggles selection at the deepest level instead of drilling', async () => {
    const store = newStore();
    const { getByRole } = render(DrillBarChart, { props: { store, ...base } });
    getByRole('button', { name: /^Nord:/ }).click();
    await tick();
    getByRole('button', { name: /^Lille:/ }).click();
    expect(store.getState().selections.d).toEqual(['Lille']);
    expect(store.getState().drill.d).toEqual(['city']);
  });
});
