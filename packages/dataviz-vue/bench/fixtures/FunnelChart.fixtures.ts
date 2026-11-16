import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'funnels', category: 'city', measure: 'sales', label: 'Funnels' });
export default [
  { id: 'default', props: base() },
  { id: 'horizontal', props: { ...base(), orientation: 'horizontal' } },
  { id: 'percentages', props: { ...base(), showPercentages: false, percentMode: 'ofPrevious', legend: false } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'funnels' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
