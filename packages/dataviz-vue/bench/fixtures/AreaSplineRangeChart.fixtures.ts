import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'splines', x_field: 'city', low: 'sales', high: 'sales', label: 'Spline ranges' });
export default [
  { id: 'default', props: base() },
  { id: 'tone', props: { ...base(), tone: 'category3' } },
  { id: 'sized', props: { ...base(), width: 520, height: 280 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'splines' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
