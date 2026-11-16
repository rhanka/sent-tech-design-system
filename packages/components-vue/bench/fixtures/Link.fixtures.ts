import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { href: '/docs' }, slots: { default: 'Docs' } },
  { id: 'variants', props: { href: '/a', variant: 'standalone' }, slots: { default: 'Standalone' } },
  { id: 'muted-legacy', props: { href: '/b', muted: true }, slots: { default: 'Muted' } },
  { id: 'disabled', props: { href: '/c', disabled: true }, slots: { default: 'Nope' } },
  { id: 'external', props: { href: 'https://example.test', external: true }, slots: { default: 'Out' } },
  { id: 'custom-attrs', props: { href: '/d', class: 'consumer', style: 'color: red', title: 'Go', 'data-bench': 'link' }, slots: { default: '<strong>Click</strong>' } },
] satisfies Fixture[];
