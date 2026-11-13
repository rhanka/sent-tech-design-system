import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'records' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'fields', props: { ...base(), fields: ['city', 'region'] } },
  { id: 'caption-page', props: { ...base(), caption: 'Records', size: 'lg', pageSize: 2 } },
  { id: 'no-cf', props: { ...base(), conditionalFormat: {} } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'records', style: 'color:red' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
