import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'cols', category: 'city', low: 'sales', high: 'sales', label: 'Column ranges' });
export default [
  { id: 'default', props: base() },
  { id: 'horizontal', props: { ...base(), orientation: 'horizontal' } },
  { id: 'sized', props: { ...base(), width: 520, height: 300 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'cols' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
