import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel } from '@sentropic/dataviz-core';
import { DashboardActiveFilters } from './DashboardActiveFilters.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Pays', type: 'discrete' },
    { id: 'price', label: 'Prix', type: 'continuous' },
  ],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const newStore = () => createDashboardStore({ model, data: [] });

describe('DashboardActiveFilters (vue)', () => {
  it('exposes the filter group with its aria-label', () => {
    const w = mount(DashboardActiveFilters, { props: { store: newStore(), label: 'Filtres actifs' } });
    const group = w.find('.st-filterBar[role="group"]');
    expect(group.exists()).toBe(true);
    expect(group.attributes('aria-label')).toBe('Filtres actifs');
  });

  it('renders one pill per active filter, labelled by the dimension', () => {
    const store = newStore();
    store.setFilter('country', { kind: 'include', values: ['France', 'Italie'] });
    const w = mount(DashboardActiveFilters, { props: { store } });
    expect(w.findAll('.st-filterPill')).toHaveLength(1);
    expect(w.text()).toContain('Pays');
    expect(w.text()).toContain('France, Italie');
  });

  it('clears a single filter via its pill remove button', async () => {
    const store = newStore();
    store.setFilter('country', { kind: 'include', values: ['France'] });
    const w = mount(DashboardActiveFilters, { props: { store } });
    await w.find('button[aria-label="Retirer le filtre Pays"]').trigger('click');
    expect(store.getState().filters.country).toBeUndefined();
  });

  it('clears every filter — but preserves selections — via the clear-all button', async () => {
    const store = newStore();
    store.setFilter('country', { kind: 'include', values: ['France'] });
    store.setFilter('price', { kind: 'range', min: 10 });
    store.toggleSelection('byCountry', 'FR');
    const w = mount(DashboardActiveFilters, { props: { store } });
    await w.find('button.st-filterBar__clearAll').trigger('click');
    expect(Object.keys(store.getState().filters)).toHaveLength(0);
    expect(store.getState().selections.byCountry).toEqual(['FR']);
  });

  it('shows no clear-all button when there are no filters', () => {
    const w = mount(DashboardActiveFilters, { props: { store: newStore() } });
    expect(w.find('button.st-filterBar__clearAll').exists()).toBe(false);
  });

  it('reacts to a filter set after mount', async () => {
    const store = newStore();
    const w = mount(DashboardActiveFilters, { props: { store } });
    expect(w.text()).not.toContain('≥ 5');
    store.setFilter('price', { kind: 'range', min: 5 });
    await nextTick();
    expect(w.text()).toContain('Prix');
    expect(w.text()).toContain('≥ 5');
  });
});
