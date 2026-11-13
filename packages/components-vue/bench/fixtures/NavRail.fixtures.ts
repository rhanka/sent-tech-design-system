import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { items: [{ id: 'home', label: 'Home', href: '/', active: true }, { id: 'docs', label: 'Docs', href: '/docs' }] } },
  { id: 'active-by-id', props: { items: [{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }], activeItemId: 'b' } },
  { id: 'badge-disabled', props: { items: [{ id: 'x', label: 'X', badge: '3' }, { id: 'y', label: 'Y', icon: 'Icon', disabled: true }] } },
  { id: 'footer-slot', props: { items: [{ id: 'a', label: 'Alpha' }], label: 'Sections', class: 'consumer', style: 'color: red', 'data-bench': 'rail' }, slots: { footer: '<button>Settings</button>' } },
  { id: 'empty-with-default', props: { items: [] }, slots: { default: '<span>Custom</span>' } },
] satisfies Fixture[];
