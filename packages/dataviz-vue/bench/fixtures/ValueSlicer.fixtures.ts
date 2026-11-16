import { newStore } from './store.js';
import type { Fixture } from './types.js';
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
const base = () => ({ store: newStore(), dimension: 'region' });
export default [
  { id: 'default', props: base() },
  { id: 'legend-horizontal', props: { ...base(), legend: 'Regions', orientation: 'horizontal' } },
  { id: 'city', props: { ...base(), dimension: 'city' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'slicer', style: 'color:red' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
