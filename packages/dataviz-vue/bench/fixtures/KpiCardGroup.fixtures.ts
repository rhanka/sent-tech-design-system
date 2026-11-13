import { newStore, rows } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'kpis', configs: [{ id: 'sales', measure: 'sales' }] });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'multi-cards', props: { ...base(), configs: [{ id: 'sales', measure: 'sales' }, { id: 'spark', measure: 'sales', sparklineDimension: 'city', label: 'Sales by city' }] } },
  { id: 'compared', props: { ...base(), comparisonData: rows, deltaFormat: 'absolute', size: 'sm', tone: 'success', format: 'compact' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'kpis', style: 'color:red' } },
  { id: 'empty', props: { ...base(), store: newStore([]), configs: [{ id: 'sales', measure: 'sales' }] } },
] satisfies Fixture[];
