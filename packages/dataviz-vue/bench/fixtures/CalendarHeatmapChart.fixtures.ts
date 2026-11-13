import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), date: 'city', measure: 'sales', label: 'Calendar heat' });
export default [
  { id: 'default', props: base() },
  { id: 'sized', props: { ...base(), width: 560, height: 300 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'calheat' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
