import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { brandName: 'SENT', productName: 'Design System', drawerId: 'drawer-1' },
    slots: { nav: '<a href="/docs">Docs</a>', actions: '<button type="button">Sign in</button>' } },
  { id: 'compact-closed', props: { compact: true, menuOpen: false, brandName: 'SENT', drawerId: 'drawer-2' },
    slots: { drawer: '<p>Menu</p>' } },
  { id: 'compact-open-drawer', props: { compact: true, menuOpen: true, menuLabel: 'Toggle menu', brandName: 'SENT', drawerId: 'drawer-3' },
    slots: { drawer: '<nav aria-label="Mobile"><a href="/">Home</a></nav>' } },
  { id: 'logo-slot', props: { brandName: 'Ignored', productName: 'Also ignored', drawerId: 'drawer-4' },
    slots: { logo: '<span class="brand-lockup">SENT</span>' } },
  { id: 'default-brand-img', props: { brandName: 'SENT', productName: 'Data Viz', logoSrc: '/SENT-logo-squared.svg', logoAlt: '', brandHref: '/home', brandLabel: 'SENT home', drawerId: 'drawer-5' } },
  { id: 'custom', props: { brandName: 'SENT', drawerId: 'drawer-6', class: 'consumer', style: 'color: red', 'data-bench': 'header' } },
] satisfies Fixture[];
