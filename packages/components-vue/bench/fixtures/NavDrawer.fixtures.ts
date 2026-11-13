import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { open: true, title: 'Navigation', label: 'Main nav' }, slots: { default: '<a>Home</a>' } },
  { id: 'back-search-footer', props: { open: true, title: 'Menu', subtitle: 'Sections', back: true, side: 'right' }, slots: { default: '<a>Item</a>', search: '<input />', footer: '<button>Logout</button>' } },
  { id: 'closed', props: { open: false, title: 'Hidden' }, slots: { default: 'Not rendered' } },
  { id: 'no-title', props: { open: true }, slots: { default: '<span>Links</span>' } },
  { id: 'custom-attrs', props: { open: true, title: 'Attrs', class: 'consumer', style: 'color: red', 'data-bench': 'drawer' }, slots: { default: 'Body' } },
] satisfies Fixture[];
