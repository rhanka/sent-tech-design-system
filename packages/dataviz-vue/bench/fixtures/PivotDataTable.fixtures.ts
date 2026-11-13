import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'pivot', rows: ['region'], measures: ['sales'] });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'columns-caption', props: { ...base(), columns: ['city'], caption: 'Sales pivot', size: 'sm' } },
  { id: 'no-cf', props: { ...base(), rows: ['city'], conditionalFormat: {} } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'pivot', style: 'color:red' } },
  { id: 'invalid-fields', props: { ...base(), rows: ['missing'], measures: ['missing'] } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
