import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'ranges', x_field: 'city', low: 'sales', high: 'sales', label: 'Ranges' });
export default [
  { id: 'default', props: base() },
  { id: 'tone', props: { ...base(), tone: 'category2' } },
  { id: 'sized', props: { ...base(), width: 520, height: 280 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'ranges' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
