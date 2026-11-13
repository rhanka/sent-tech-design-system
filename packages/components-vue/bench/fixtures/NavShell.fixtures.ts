import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { title: 'Main' }, slots: { default: '<a>Home</a>' } },
  { id: 'drawer-open', props: { variant: 'drawer', open: true, title: 'Menu', subtitle: 'Sub', side: 'right' }, slots: { default: '<a>Item</a>' } },
  { id: 'back-search-footer', props: { back: true, backLabel: 'Retour', search: true, title: 'Nav', label: 'Primary' }, slots: { default: '<a>Item</a>', search: '<input placeholder="Search" />', footer: '<button>Help</button>' } },
  { id: 'drawer-closed', props: { variant: 'drawer', open: false, title: 'Hidden' }, slots: { default: 'Not rendered' } },
  { id: 'custom-attrs', props: { title: 'Attrs', class: 'consumer', style: 'color: red', 'data-bench': 'shell' }, slots: { default: 'Body' } },
] satisfies Fixture[];
