import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: '<p>Tools</p>' } },
  { id: 'titled', props: { title: 'Settings' }, slots: { default: '<p>Body</p>' } },
  { id: 'header-footer', props: { label: 'Panel' }, slots: { header: '<strong>Custom header</strong>', default: '<p>Body</p>', footer: '<small>Footer</small>' } },
  { id: 'collapsed', props: { title: 'Settings', collapsed: true }, slots: { default: '<p>Hidden</p>', footer: '<small>Hidden</small>' } },
  { id: 'overlay-left', props: { mode: 'overlay', side: 'left', title: 'Cart' }, slots: { default: '<p>Items</p>' } },
  { id: 'custom-attrs', props: { title: 'Env', class: 'consumer', style: 'color: red', 'data-bench': 'utilityPanel' }, slots: { default: '<p>Body</p>' } },
] satisfies Fixture[];
