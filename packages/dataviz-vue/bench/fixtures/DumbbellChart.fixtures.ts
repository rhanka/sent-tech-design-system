import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'dumbbells', category: 'city', low: 'sales', high: 'sales', label: 'Dumbbells' });
export default [
  { id: 'default', props: base() },
  { id: 'tones-labels', props: { ...base(), lowTone: 'category1', highTone: 'category2', lowLabel: 'Low', highLabel: 'High' } },
  { id: 'sized', props: { ...base(), width: 520, height: 300 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'dumbbells' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
