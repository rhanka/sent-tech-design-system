import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'lollipop', category: 'region', measure: 'sales', label: 'Sales by region' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'horizontal-domain', props: { ...base(), orientation: 'horizontal', domain: [0, 40], tone: 'category3' } },
  { id: 'city-attrs', props: { ...base(), category: 'city', width: 480, height: 240, class: 'consumer', 'data-bench': 'lollipop', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'invalid-fields', props: { ...base(), category: 'missing', measure: 'missing' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
