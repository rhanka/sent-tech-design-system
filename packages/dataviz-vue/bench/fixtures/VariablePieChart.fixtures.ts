import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'varpie', label_field: 'region', value: 'sales', z: 'sales', label: 'Variable pie' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'city', props: { ...base(), label_field: 'city' } },
  { id: 'size-attrs', props: { ...base(), width: 480, height: 240, class: 'consumer', 'data-bench': 'varpie', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'invalid-fields', props: { ...base(), label_field: 'missing', value: 'missing' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
