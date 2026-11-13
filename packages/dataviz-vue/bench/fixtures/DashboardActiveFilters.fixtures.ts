import { newStore } from './store.js';
import type { Fixture } from './types.js';
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
const base = () => ({ store: filtered, label: 'Active filters' });
export default [
  { id: 'default', props: base() },
  { id: 'no-filters', props: { store: newStore(), label: 'Active filters' } },
  { id: 'custom-labels', props: { ...base(), label: 'Filters', clearAllLabel: 'Clear all' } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'filters' } },
] satisfies Fixture[];
