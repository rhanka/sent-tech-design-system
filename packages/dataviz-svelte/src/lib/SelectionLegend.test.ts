import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel } from '@sentropic/dataviz-core';
import SelectionLegend from './SelectionLegend.svelte';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const newStore = () => createDashboardStore({ model, data: [] });

describe('SelectionLegend', () => {
  it('renders nothing while there are no selections', () => {
    const store = newStore();
    const { container } = render(SelectionLegend, { props: { store } });
    expect(container.querySelector('[role="group"]')).toBeNull();
  });

  it('renders one chip per view with a selection count and a friendly label', () => {
    const store = newStore();
    store.toggleSelection('byCountry', 'FR');
    store.toggleSelection('byCountry', 'US');
    render(SelectionLegend, { props: { store, labels: { byCountry: 'Carte' } } });
    expect(screen.getByRole('group', { name: 'Sélections actives' })).toBeTruthy();
    expect(screen.getByText('Carte')).toBeTruthy();
    expect(screen.getByText('(2)')).toBeTruthy();
  });

  it('falls back to the view id when no label is supplied', () => {
    const store = newStore();
    store.toggleSelection('byCountry', 'FR');
    render(SelectionLegend, { props: { store } });
    expect(screen.getByText('byCountry')).toBeTruthy();
  });

  it('clears a view selection via the chip clear button', () => {
    const store = newStore();
    store.toggleSelection('byCountry', 'FR');
    render(SelectionLegend, { props: { store, labels: { byCountry: 'Carte' } } });
    screen.getByRole('button', { name: 'Effacer Carte' }).click();
    expect(store.getState().selections.byCountry).toBeUndefined();
  });

  it('appears reactively when a selection is made after mount', async () => {
    const store = newStore();
    const { container } = render(SelectionLegend, { props: { store } });
    expect(container.querySelector('[role="group"]')).toBeNull();
    store.toggleSelection('byCountry', 'FR');
    await tick();
    expect(container.querySelector('[role="group"]')).not.toBeNull();
  });
});
