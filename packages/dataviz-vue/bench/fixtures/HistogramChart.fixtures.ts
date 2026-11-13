import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'hist', value: 'sales', label: 'Sales distribution' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'bins-domain-attrs', props: { ...base(), bins: 4, domain: [0, 20], width: 480, height: 240, class: 'consumer', 'data-bench': 'hist', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'no-view', props: { store: newStore(), value: 'sales', label: 'Sales' } },
  { id: 'invalid-value', props: { ...base(), value: 'missing' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
