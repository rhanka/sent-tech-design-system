import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'contours', x: 'sales', y: 'sales', value: 'sales', label: 'Contours' });
export default [
  { id: 'default', props: base() },
  { id: 'levels', props: { ...base(), levels: 5 } },
  { id: 'sized', props: { ...base(), width: 480, height: 360, size: 18 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'contours' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
