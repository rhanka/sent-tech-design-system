import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel } from '@sentropic/dataviz-core';
import { SelectionLegend } from './SelectionLegend.js';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const newStore = () => createDashboardStore({ model, data: [] });

describe('SelectionLegend (vue)', () => {
  it('renders nothing while there are no selections', () => {
    const w = mount(SelectionLegend, { props: { store: newStore() } });
    expect(w.find('[role="group"]').exists()).toBe(false);
  });

  it('renders one chip per view with a count and a friendly label', () => {
    const store = newStore();
    store.toggleSelection('byCountry', 'FR');
    store.toggleSelection('byCountry', 'US');
    const w = mount(SelectionLegend, { props: { store, labels: { byCountry: 'Carte' } } });
    expect(w.find('[role="group"]').attributes('aria-label')).toBe('Sélections actives');
    expect(w.text()).toContain('Carte');
    expect(w.text()).toContain('(2)');
  });

  it('falls back to the view id when no label is supplied', () => {
    const store = newStore();
    store.toggleSelection('byCountry', 'FR');
    const w = mount(SelectionLegend, { props: { store } });
    expect(w.text()).toContain('byCountry');
  });

  it('clears a view selection via the chip clear button', async () => {
    const store = newStore();
    store.toggleSelection('byCountry', 'FR');
    const w = mount(SelectionLegend, { props: { store, labels: { byCountry: 'Carte' } } });
    await w.find('button[aria-label="Effacer Carte"]').trigger('click');
    expect(store.getState().selections.byCountry).toBeUndefined();
  });

  it('appears reactively when a selection is made after mount', async () => {
    const store = newStore();
    const w = mount(SelectionLegend, { props: { store } });
    expect(w.find('[role="group"]').exists()).toBe(false);
    store.toggleSelection('byCountry', 'FR');
    await nextTick();
    expect(w.find('[role="group"]').exists()).toBe(true);
  });
});
