import { newStore } from './store.js';
import type { Fixture } from './types.js';
const base = () => ({ store: newStore() });
export default [
  { id: 'default', props: base() },
  { id: 'view-fields', props: { ...base(), viewId: 'export', fields: ['region', 'sales'] } },
  { id: 'named', props: { ...base(), filename: 'data.csv', label: 'Download CSV' } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'exportmenu' } },
] satisfies Fixture[];
