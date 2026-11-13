import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'combos', category: 'city', measures: ['sales'], label: 'Combos' });
export default [
  { id: 'default', props: base() },
  { id: 'series-stacked', props: { ...base(), series: 'region', mode: 'stacked' as const } },
  { id: 'axes-legend', props: { ...base(), leftAxisLabel: 'Left', rightAxisLabel: 'Right', legend: false } },
  { id: 'hidden', props: { ...base(), hiddenSeries: ['sales'] } },
  { id: 'sized', props: { ...base(), width: 560, height: 300 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'combos' } },
] satisfies Fixture[];
