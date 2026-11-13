import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { pageTitle: 'Overview' }, slots: { default: 'Main content' } },
  { id: 'with-nav-kpis', props: { appTitle: 'App', pageTitle: 'Overview', navItems: [{ label: 'Home', href: '/', active: true }, { label: 'Settings', href: '/settings' }], kpis: [{ label: 'Users', value: '1.2k' }, { label: 'Revenue', value: '$9k', delta: '+4%' }] } },
  { id: 'title-only', props: { pageTitle: 'Plain', navItems: [{ label: 'Only', href: '/only' }] } },
  { id: 'custom-class', props: { pageTitle: 'Styled', appTitle: 'A', class: 'consumer', style: 'color: red', 'data-bench': 'dash' }, slots: { default: '<em>Slot</em> body' } },
  { id: 'kpi-no-delta', props: { pageTitle: 'KPIs', kpis: [{ label: 'A', value: '1' }] }, slots: { default: 'Body' } },
  { id: 'empty-nav', props: { pageTitle: 'Empty', navItems: [] } },
] satisfies Fixture[];
