import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect, vi } from 'vitest';
import { createDashboardStore, type DashboardBookmark, type DataModel } from '@sentropic/dataviz-core';
import BookmarkNavigator from './BookmarkNavigator.svelte';

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

describe('BookmarkNavigator (svelte)', () => {
  it('renders a labelled bookmark group and restores a clicked bookmark', () => {
    const store = newStore();
    render(BookmarkNavigator, { props: { store, bookmarks, label: 'Signets' } });
    expect(screen.getByRole('group', { name: 'Signets' })).toBeTruthy();

    screen.getByRole('button', { name: 'France' }).click();

    expect(store.getState().filters.country).toEqual({ kind: 'include', values: ['FR'] });
  });

  it('applies the next bookmark from the navigator controls', async () => {
    const store = newStore();
    render(BookmarkNavigator, { props: { store, bookmarks } });

    screen.getByRole('button', { name: 'Suivant' }).click();
    await tick();

    expect(store.getState().filters.country).toEqual({ kind: 'include', values: ['US'] });
  });

  it('runs bookmark URL actions through the injected runtime', () => {
    const store = newStore();
    const openUrl = vi.fn();
    render(BookmarkNavigator, {
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

    screen.getByRole('button', { name: 'Ouvrir rapport' }).click();

    expect(openUrl).toHaveBeenCalledWith('https://example.test/report', '_blank');
  });
});
