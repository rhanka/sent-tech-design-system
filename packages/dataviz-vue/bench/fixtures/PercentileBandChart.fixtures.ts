import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'band', value: 'sales', lower: 0.25, upper: 0.75, label: 'Percentile band' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'tight-band', props: { ...base(), lower: 0.1, upper: 0.9 } },
  { id: 'size-attrs', props: { ...base(), width: 480, height: 160, class: 'consumer', 'data-bench': 'band', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'narrow-band', props: { ...base(), lower: 0.4, upper: 0.6 } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
