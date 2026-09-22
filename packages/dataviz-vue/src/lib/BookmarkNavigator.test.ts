import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { createDashboardStore, type DashboardBookmark, type DataModel } from '@sentropic/dataviz-core';
import { BookmarkNavigator } from './BookmarkNavigator.js';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const newStore = () => createDashboardStore({ model, data: [] });

const bookmarks: DashboardBookmark[] = [
  {
    id: 'fr',
    label: 'France',
    state: { filters: { country: { kind: 'include', values: ['FR'] } } },
  },
  {
    id: 'us',
    label: 'Etats-Unis',
    state: { filters: { country: { kind: 'include', values: ['US'] } } },
  },
];

describe('BookmarkNavigator (vue)', () => {
  it('renders a labelled bookmark group and restores a clicked bookmark', async () => {
    const store = newStore();
    const w = mount(BookmarkNavigator, { props: { store, bookmarks, label: 'Signets' } });
    expect(w.find('[role="group"]').attributes('aria-label')).toBe('Signets');

    await w.find('button[aria-label="France"]').trigger('click');

    expect(store.getState().filters.country).toEqual({ kind: 'include', values: ['FR'] });
  });

  it('applies the next bookmark from the navigator controls', async () => {
    const store = newStore();
    const w = mount(BookmarkNavigator, { props: { store, bookmarks } });

    await w.find('button[aria-label="Suivant"]').trigger('click');

    expect(store.getState().filters.country).toEqual({ kind: 'include', values: ['US'] });
  });

  it('runs bookmark URL actions through the injected runtime', async () => {
    const store = newStore();
    const openUrl = vi.fn();
    const w = mount(BookmarkNavigator, {
      props: {
        store,
        bookmarks: [
          {
            id: 'external',
            label: 'Ouvrir rapport',
            actions: [{ kind: 'open-url', url: 'https://example.test/report', target: '_blank' }],
          },
        ],
        runtime: { openUrl },
      },
    });

    await w.find('button[aria-label="Ouvrir rapport"]').trigger('click');

    expect(openUrl).toHaveBeenCalledWith('https://example.test/report', '_blank');
  });
});
