import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'facets', facetBy: 'region', dimension: 'city', measure: 'sales', label: 'Sales facets' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'columns-tone-attrs', props: { ...base(), columns: 3, tone: 'category4', class: 'consumer', 'data-bench': 'facets' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'invalid-fields', props: { ...base(), facetBy: 'missing', measure: 'missing' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
