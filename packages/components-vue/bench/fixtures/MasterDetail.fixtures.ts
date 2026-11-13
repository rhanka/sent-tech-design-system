import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { listTitle: 'Orders', detailTitle: 'Order 1' } },
  { id: 'full', props: { listTitle: 'Orders', listItems: [{ id: 'o1', primary: 'Order 1', secondary: 'Paid', statusLabel: 'Active', active: true }, { id: 'o2', primary: 'Order 2' }], detailTitle: 'Order 1', detailStatus: { label: 'Active', tone: 'success' }, detailActions: ['Edit', 'Export'], detailFields: [{ key: 'Total', value: '42 €' }, { key: 'Date', value: '2025-01-01' }] } },
  { id: 'with-content', props: { listTitle: 'L', detailTitle: 'D' }, slots: { default: '<p>Details</p>' } },
  { id: 'custom-attrs', props: { listTitle: 'L', detailTitle: 'D', searchPlaceholder: 'Find…', class: 'consumer', style: 'color: red', 'data-bench': 'master-detail' } },
] satisfies Fixture[];
