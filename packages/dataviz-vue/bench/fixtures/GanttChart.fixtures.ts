import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'gantts', task: 'city', start: 'sales', end: 'sales', label: 'Gantt' });
export default [
  { id: 'default', props: base() },
  { id: 'category-marker', props: { ...base(), category: 'region', marker: 10 } },
  { id: 'sized', props: { ...base(), width: 560, height: 300 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'gantts' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
