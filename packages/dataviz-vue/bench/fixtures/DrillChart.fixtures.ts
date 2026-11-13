import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'drillchart', hierarchy: ['region', 'city'], measure: 'sales', label: 'Drill chart' });
export default [
  { id: 'default', props: base() },
  { id: 'donut', props: { ...base(), kind: 'donut' } },
  { id: 'treemap', props: { ...base(), kind: 'treemap' } },
  { id: 'horizontal', props: { ...base(), orientation: 'horizontal', tone: 'category2', class: 'consumer', 'data-bench': 'drillchart' } },
] satisfies Fixture[];
