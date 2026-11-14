import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'burst', hierarchy: ['region', 'city'], measure: 'sales', label: 'Sunburst' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'no-legend', props: { ...base(), legend: false } },
  { id: 'deep', props: { ...base(), hierarchy: ['city', 'region'] } },
  { id: 'size-attrs', props: { ...base(), width: 480, height: 240, class: 'consumer', 'data-bench': 'burst', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'invalid-fields', props: { ...base(), hierarchy: ['missing'], measure: 'missing' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
