import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'pareto', category: 'region', measure: 'sales', label: 'Pareto sales' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'city-tone', props: { ...base(), category: 'city', tone: 'category3' } },
  { id: 'size-attrs', props: { ...base(), width: 480, height: 240, class: 'consumer', 'data-bench': 'pareto', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'invalid-fields', props: { ...base(), category: 'missing', measure: 'missing' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
