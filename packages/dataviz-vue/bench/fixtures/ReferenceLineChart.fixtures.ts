import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'ref', value: 25, label: 'Reference line' });
const filtered = newStore(); filtered.setFilter('region', { kind: 'include', values: ['North'] });
export default [
  { id: 'default', props: base() },
  { id: 'measure-ref', props: { ...base(), value: undefined, measure: 'sales', referenceId: 'target', referenceLabel: 'Target' } },
  { id: 'domain-hover', props: { ...base(), domainMin: 0, domainMax: 50, hoverKey: '25', onHoverKeyChange: () => {}, onSelectKey: () => {} } },
  { id: 'size-attrs', props: { ...base(), width: 480, height: 160, class: 'consumer', 'data-bench': 'ref', style: 'color:red' } },
  { id: 'filtered', props: { ...base(), store: filtered } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
