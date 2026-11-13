import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'states', series: 'city', start: 'sales', end: 'sales', state: 'region' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'label-size', props: { ...base(), label: 'States', width: 480, height: 240 } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'states', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'invalid-fields', props: { ...base(), series: 'missing', state: 'missing' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
