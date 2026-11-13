import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore(), viewId: 'crumbs', hierarchy: ['region', 'city'] });
const drilled = newStore(); drilled.drillDown('crumbs', 'city');
export default [
  { id: 'default', props: base() },
  { id: 'drilled', props: { ...base(), store: drilled } },
  { id: 'custom-labels', props: { ...base(), label: 'Trail', backLabel: 'Back' } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'crumbs' } },
] satisfies Fixture[];
