import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'packed', category: 'region', measure: 'sales', label: 'Packed bubbles' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'city-sort-label', props: { ...base(), category: 'city', sort: 'label-asc' } },
  { id: 'size-attrs', props: { ...base(), width: 480, height: 240, class: 'consumer', 'data-bench': 'packed', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'invalid-fields', props: { ...base(), category: 'missing', measure: 'missing' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
