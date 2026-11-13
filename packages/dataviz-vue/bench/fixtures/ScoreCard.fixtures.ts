import { newStore, rows } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'score', measure: 'sales' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'goal-spark', props: { ...base(), label: 'Sales', goal: 50, sparklineDimension: 'city' } },
  { id: 'format-unit', props: { ...base(), comparisonData: rows, deltaFormat: 'absolute', format: 'compact', unit: '€', currency: 'EUR', locale: 'fr-FR', size: 'lg', tone: 'info' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'score', style: 'color:red' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
