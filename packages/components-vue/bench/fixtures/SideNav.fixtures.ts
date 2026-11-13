import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { items: [{ label: 'Home', href: '/', active: true }, { label: 'Settings', href: '/settings' }] } },
  { id: 'custom-label', props: { items: [{ label: 'Alpha', href: '/a' }], label: 'Main' } },
  { id: 'empty', props: { items: [] } },
  { id: 'custom-attrs', props: { items: [{ label: 'One', href: '/1', active: false }], class: 'consumer', style: 'color: red', 'data-bench': 'sidenav' } },
  { id: 'many', props: { items: [{ label: 'A', href: '/a', active: true }, { label: 'B', href: '/b' }, { label: 'C', href: '/c' }] } },
] satisfies Fixture[];
