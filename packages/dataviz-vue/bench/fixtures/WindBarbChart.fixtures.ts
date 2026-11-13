import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'wind', at: 'city', speed: 'sales', direction: 'sales' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'label-size', props: { ...base(), label: 'Wind barbs', size: 14, width: 480, height: 240 } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'wind', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'invalid-fields', props: { ...base(), at: 'missing', speed: 'missing' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
