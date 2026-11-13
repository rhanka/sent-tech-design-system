import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'gauge', value: 'sales' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'min-max-unit', props: { ...base(), label: 'Sales gauge', min: 0, max: 50, format: 'currency', unit: 'EUR' } },
  { id: 'angles', props: { ...base(), size: 200, innerRadius: 0.6, startAngle: -120, endAngle: 120 } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'attrs', props: { ...base(), class: 'consumer', 'data-bench': 'gauge', style: 'color:red' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
