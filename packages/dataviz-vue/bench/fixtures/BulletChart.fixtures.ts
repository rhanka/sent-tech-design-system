import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), value: 'sales', target: 'sales', category: 'city', label: 'Bullet sales' });
export default [
  { id: 'default', props: base() },
  { id: 'ranges', props: { ...base(), ranges: [0, 10, 20] } },
  { id: 'vertical', props: { ...base(), orientation: 'vertical' } },
  { id: 'sized', props: { ...base(), width: 480, height: 260 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'bullet' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
