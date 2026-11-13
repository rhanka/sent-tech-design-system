import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { brand: 'Acme', title: 'Console', navigation: [{ label: 'Home', href: '/' }, { label: 'Docs', href: '/docs' }] } },
  { id: 'nav-items-alias', props: { brand: 'Acme', navItems: [{ label: 'A', href: '/a' }] } },
  { id: 'account', props: { brand: 'Acme', account: { name: 'Jean Dupont', email: 'jean@acme.test' } } },
  { id: 'brand-slot', props: { title: 'Console' }, slots: { brand: '<strong>Brand</strong>' } },
  { id: 'rich-content', props: { brand: 'Brand', title: 'Console' },
    legacyProps: { brand: h('strong', 'Brand'), title: h('em', 'Console') },
    slots: { brand: '<strong>Brand</strong>', title: '<em>Console</em>' } },
  { id: 'sticky-custom', props: { brand: 'Acme', sticky: true, class: 'consumer', style: 'color: red', 'data-bench': 'header' } },
] satisfies Fixture[];
