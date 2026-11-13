import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), x: 'region', y: 'city', measure: 'sales', label: 'Heat' });
export default [
  { id: 'default', props: base() },
  { id: 'no-legend', props: { ...base(), legend: false } },
  { id: 'sized', props: { ...base(), width: 480, height: 320 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'heat' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
