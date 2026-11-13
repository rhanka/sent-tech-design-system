import { createDashboardStore, type DashboardBookmark } from '@sentropic/dataviz-core';
import { newStore } from './store.js';
import type { Fixture } from './types.js';
const bookmarks: DashboardBookmark[] = [
  { id: 'bm-fr', label: 'France', state: { filters: { region: { kind: 'include', values: ['North'] } } } },
  { id: 'bm-us', label: 'South', state: { filters: { region: { kind: 'include', values: ['South'] } } } },
];
const base = () => ({ store: newStore(), bookmarks });
export default [
  { id: 'default', props: base() },
  { id: 'selected', props: { ...base(), selectedId: 'bm-us' } },
  { id: 'no-playback', props: { ...base(), showPlaybackControls: false } },
  { id: 'custom-labels', props: { ...base(), label: 'Views', previousLabel: 'Back', nextLabel: 'Fwd', playLabel: 'Play', pauseLabel: 'Stop' } },
  { id: 'empty', props: { store: newStore(), bookmarks: [], emptyLabel: 'None' } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'bookmarks' } },
] satisfies Fixture[];
