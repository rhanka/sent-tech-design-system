import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'parallel', measures: ['sales', 'sales'], label: 'Parallel coordinates' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'series', props: { ...base(), series: 'region' } },
  { id: 'city-labels', props: { ...base(), measures: ['city', 'sales'] } },
  { id: 'size-attrs', props: { ...base(), width: 480, height: 240, class: 'consumer', 'data-bench': 'parallel', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'invalid-fields', props: { ...base(), measures: ['missing', 'missing'] } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
