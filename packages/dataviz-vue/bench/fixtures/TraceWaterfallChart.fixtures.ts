import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'trace', spanId: 'city', parentSpanId: 'region', service: 'region', start: 'sales', duration: 'sales' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'label-size', props: { ...base(), label: 'Trace', size: 14, width: 480, height: 240 } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'trace', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'invalid-fields', props: { ...base(), spanId: 'missing', duration: 'missing' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
