import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { items: [{ label: 'Home', href: '/' }, { label: 'Docs', href: '/docs' }, { label: 'Guide', current: true }] } },
  { id: 'no-href', props: { items: [{ label: 'Home' }, { label: 'Docs' }] } },
  { id: 'current-only', props: { items: [{ label: 'Here', current: true }] } },
  { id: 'custom-label', props: { items: [{ label: 'Home', href: '/' }, { label: 'Section', href: '/s' }], label: 'Fil d\'Ariane', class: 'consumer', style: 'color: red', 'data-bench': 'crumbs' } },
  { id: 'empty', props: { items: [] } },
] satisfies Fixture[];
