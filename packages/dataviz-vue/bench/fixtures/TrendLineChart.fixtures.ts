import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'trend', x: 'region', y: 'sales', label: 'Trend line' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'city-hover', props: { ...base(), x: 'city', hoverKey: 'A', onHoverKeyChange: () => {}, onSelectKey: () => {}, dataLabels: true } },
  { id: 'size-attrs', props: { ...base(), width: 480, height: 240, class: 'consumer', 'data-bench': 'trend', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'measure-x', props: { ...base(), x: 'sales', y: 'sales' } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
