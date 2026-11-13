import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { pageTitle: 'Orders', columns: [{ key: 'id', label: 'ID' }, { key: 'total', label: 'Total' }] } },
  { id: 'full', props: { appTitle: 'Acme', navItems: [{ label: 'Home', href: '/' }, { label: 'Orders', href: '/orders', active: true }], pageTitle: 'Orders', primaryAction: 'Export', secondaryAction: 'Filter', columns: [{ key: 'id', label: 'ID' }, { key: 'total', label: 'Total' }, { key: 'status', label: 'Status' }], rows: [{ id: 'o1', total: 42, status: 'Paid' }, { id: 'o2', total: 7 }] } },
  { id: 'empty-rows', props: { pageTitle: 'None', columns: [{ key: 'a', label: 'A' }], searchPlaceholder: 'Find…' } },
  { id: 'custom-attrs', props: { pageTitle: 'T', columns: [{ key: 'a', label: 'A' }], class: 'consumer', style: 'color: red', 'data-bench': 'lrp' } },
] satisfies Fixture[];
