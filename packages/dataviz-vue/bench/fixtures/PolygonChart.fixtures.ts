import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'poly', x: 'sales', y: 'sales', label: 'Polygon' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'region-tone', props: { ...base(), x: 'region', tone: 'category3' } },
  { id: 'size-attrs', props: { ...base(), width: 480, height: 240, class: 'consumer', 'data-bench': 'poly', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'invalid-fields', props: { ...base(), x: 'missing', y: 'missing' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
