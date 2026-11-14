import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'spark', dimension: 'region', measure: 'sales' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'styled', props: { ...base(), tone: 'category3', strokeWidth: 3, area: true, label: 'Sales trend' } },
  { id: 'city-size', props: { ...base(), dimension: 'city', width: 240, height: 80 } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'spark', style: 'color:red' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
