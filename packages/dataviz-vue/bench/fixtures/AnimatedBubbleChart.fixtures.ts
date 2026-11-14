import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'bubbles', x: 'sales', y: 'sales', size: 'sales', time: 'city', label: 'Bubble sales' });
export default [
  { id: 'default', props: base() },
  { id: 'series', props: { ...base(), series: 'region' } },
  { id: 'sized-attrs', props: { ...base(), width: 520, height: 320, class: 'consumer', 'data-bench': 'bubbles' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
