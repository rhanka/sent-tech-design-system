import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'wheels', source: 'region', target: 'city', weight: 'sales', label: 'Wheel' });
export default [
  { id: 'default', props: base() },
  { id: 'labels', props: { ...base(), labels: { North: 'N', South: 'S' } } },
  { id: 'sized', props: { ...base(), width: 460, height: 360 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'wheels' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
