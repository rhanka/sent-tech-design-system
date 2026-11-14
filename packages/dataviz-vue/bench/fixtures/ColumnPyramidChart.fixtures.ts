import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'pyramids', category: 'city', value: 'sales', label: 'Pyramids' });
export default [
  { id: 'default', props: base() },
  { id: 'sized', props: { ...base(), width: 520, height: 300 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'pyramids' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
