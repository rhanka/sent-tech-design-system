import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { brand: 'Acme' } },
  { id: 'columns-links', props: { columns: [{ title: 'Product', links: [{ label: 'Pricing', href: '/pricing' }, { label: 'Changelog', href: '/changelog' }] }, { links: [{ label: 'Docs', href: '/docs' }] }], copyright: '© 2025 Acme', legalLinks: [{ label: 'Privacy', href: '/privacy' }] } },
  { id: 'links-only', props: { links: [{ label: 'Home', href: '/' }], copyright: '© 2025' } },
  { id: 'brand-slot', props: { copyright: '© 2025' }, slots: { brand: '<strong>Brand</strong>' } },
  { id: 'rich-content', props: { brand: 'Brand', copyright: '© 2025' },
    legacyProps: { brand: h('strong', 'Brand'), copyright: h('em', '© 2025') },
    slots: { brand: '<strong>Brand</strong>', copyright: '<em>© 2025</em>' } },
  { id: 'custom-attrs', props: { brand: 'Acme', class: 'consumer', style: 'color: red', 'aria-label': 'Footer', 'data-bench': 'footer' } },
] satisfies Fixture[];
