import { newStore } from './store.js';
import type { Fixture } from './types.js';
const now = new Date('2024-06-01T00:00:00Z');
const base = () => ({ store: newStore(), dimension: 'region', now });
export default [
  { id: 'default', props: base() },
  { id: 'custom-presets', props: { ...base(), presets: [{ value: 'all', label: 'All', days: null }, { value: '7d', label: 'Week', days: 7 }] } },
  { id: 'label', props: { ...base(), label: 'Date range' } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'rel-date' } },
  { id: 'empty-presets', props: { ...base(), presets: [] } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
