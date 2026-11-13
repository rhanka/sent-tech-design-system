import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'errors', category: 'city', value: 'sales', label: 'Error bars' });
export default [
  { id: 'default', props: base() },
  { id: 'interval', props: { ...base(), interval: 'stderr' } },
  { id: 'annotations', props: { ...base(), annotations: [{ key: 'B', label: 'Peak' }], dataLabels: true } },
  { id: 'sized', props: { ...base(), width: 520, height: 300 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'errors' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
