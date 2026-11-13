import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { entityTitle: 'Order 123' } },
  { id: 'header-actions', props: { entityTitle: 'Account', entityStatus: { label: 'Active', tone: 'success' }, primaryAction: 'Save', secondaryAction: 'Cancel', breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Accounts' }] } },
  { id: 'kpis-fields', props: { entityTitle: 'Dashboard', kpis: [{ label: 'Revenue', value: '12k', delta: '+3%' }, { label: 'Users', value: '921' }], fieldsTitle: 'Details', fields: [{ key: 'Owner', value: 'Ana' }, { key: 'Plan', value: 'Pro' }] } },
  { id: 'related-table', props: { entityTitle: 'Orders', relatedTitle: 'Lines', relatedColumns: [{ key: 'id', label: 'ID' }, { key: 'qty', label: 'Qty' }], relatedRows: [{ id: 'r1', qty: 2 }, { id: 'r2', qty: 5 }] } },
  { id: 'custom-attrs', props: { entityTitle: 'Attrs', class: 'consumer', style: 'color: red', 'data-bench': 'op' } },
] satisfies Fixture[];
