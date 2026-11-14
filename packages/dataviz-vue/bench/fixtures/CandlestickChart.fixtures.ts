import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'candles', label_field: 'city', open: 'sales', high: 'sales', low: 'sales', close: 'sales', label: 'Candles' });
export default [
  { id: 'default', props: base() },
  { id: 'sized', props: { ...base(), width: 560, height: 300 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'candles' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
