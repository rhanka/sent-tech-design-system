import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'vector', x: 'sales', y: 'sales', length: 'sales', direction: 'sales' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'label-size', props: { ...base(), label: 'Vector field', size: 14, width: 480, height: 240 } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'vector', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'invalid-fields', props: { ...base(), x: 'missing', length: 'missing' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
