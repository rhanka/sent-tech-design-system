import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel } from '@sentropic/dataviz-core';
import DashboardActiveFilters from './DashboardActiveFilters.svelte';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Pays', type: 'discrete' },
    { id: 'price', label: 'Prix', type: 'continuous' },
  ],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const newStore = () => createDashboardStore({ model, data: [] });

describe('DashboardActiveFilters', () => {
  it('exposes the filter group with its aria-label', () => {
    const store = newStore();
    render(DashboardActiveFilters, { props: { store, label: 'Filtres actifs' } });
    expect(screen.getByRole('group', { name: 'Filtres actifs' })).toBeTruthy();
  });

  it('renders one pill per active filter, labelled by the dimension', () => {
    const store = newStore();
    store.setFilter('country', { kind: 'include', values: ['France', 'Italie'] });
    render(DashboardActiveFilters, { props: { store } });
    expect(screen.getByText('Pays')).toBeTruthy();
    expect(screen.getByText('France, Italie')).toBeTruthy();
  });

  it('clears a single filter via its pill remove button', () => {
    const store = newStore();
    store.setFilter('country', { kind: 'include', values: ['France'] });
    render(DashboardActiveFilters, { props: { store } });
    const remove = screen.getByRole('button', { name: 'Retirer le filtre Pays' });
    remove.click();
    expect(store.getState().filters.country).toBeUndefined();
  });

  it('clears every filter — but preserves selections — via the clear-all button', () => {
    const store = newStore();
    store.setFilter('country', { kind: 'include', values: ['France'] });
    store.setFilter('price', { kind: 'range', min: 10 });
    store.toggleSelection('byCountry', 'FR');
    render(DashboardActiveFilters, { props: { store } });
    screen.getByRole('button', { name: 'Tout effacer' }).click();
    expect(Object.keys(store.getState().filters)).toHaveLength(0);
    expect(store.getState().selections.byCountry).toEqual(['FR']);
  });

  it('shows no clear-all button when there are no filters', () => {
    const store = newStore();
    render(DashboardActiveFilters, { props: { store } });
    expect(screen.queryByRole('button', { name: 'Tout effacer' })).toBeNull();
  });

  it('reacts to a filter set after mount', async () => {
    const store = newStore();
    render(DashboardActiveFilters, { props: { store } });
    expect(screen.queryByText('≥ 5')).toBeNull();
    store.setFilter('price', { kind: 'range', min: 5 });
    await tick();
    expect(screen.getByText('≥ 5')).toBeTruthy();
    expect(screen.getByText('Prix')).toBeTruthy();
  });
});
