import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'trees', measure: 'sales', levels: ['region', 'city'], label: 'Tree' });
export default [
  { id: 'default', props: base() },
  { id: 'sized', props: { ...base(), width: 560, height: 340, size: 18 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'trees' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
