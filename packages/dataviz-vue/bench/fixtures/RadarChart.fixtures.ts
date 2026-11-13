import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'radar', axes: ['sales', 'sales'], label: 'Radar' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'series-levels', props: { ...base(), series: 'region', maxValue: 40, levels: 5, legend: false } },
  { id: 'size-attrs', props: { ...base(), width: 480, height: 240, class: 'consumer', 'data-bench': 'radar', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'invalid-fields', props: { ...base(), axes: ['missing', 'missing'] } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
