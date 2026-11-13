import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'waffle', label_field: 'region', value: 'sales' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'cells-columns', props: { ...base(), totalCells: 100, columns: 10, label: 'Waffle', size: 14 } },
  { id: 'city', props: { ...base(), label_field: 'city' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'waffle', style: 'color:red' } },
  { id: 'invalid-fields', props: { ...base(), label_field: 'missing', value: 'missing' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
