import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'donuts', category: 'city', measure: 'sales', label: 'Donuts' });
export default [
  { id: 'default', props: base() },
  { id: 'sorted', props: { ...base(), sort: 'desc' } },
  { id: 'center-datalabels', props: { ...base(), centerLabel: 'Sales', dataLabels: true } },
  { id: 'sized', props: { ...base(), size: 220, thickness: 40 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'donuts' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
