import type { Fixture } from './types.js';
const nav = [{ label: 'Home', href: '/', active: true }, { label: 'Admin', href: '/admin', roles: ['admin'] }, { label: 'Disabled', href: '/disabled', disabled: true }, { label: 'External', href: '/external', target: '_blank' }];
const themes = [{ id: 'day', label: 'Day' }, { id: 'night', label: 'Night' }];
export default [
  { id: 'default', props: {} },
  { id: 'full', props: { productName: 'Product', logoSrc: '/logo.svg', nav, themes, theme: 'night', colorMode: 'light', locale: 'fr', githubHref: '/github', userRoles: ['admin'] }, slots: { identity: '<b>User</b>', extraSelectors: '<select><option>Workspace</option></select>' } },
  { id: 'drawer', props: { mobileMenuOpen: true, nav, themes, colorMode: 'dark', locale: 'en', githubHref: '/github' }, slots: { identity: '<span>User</span>' } },
  { id: 'attrs', props: { brandName: '', productName: '', colorMode: 'auto', class: 'consumer', 'data-bench': 'chrome', style: 'color: red' } },
  { id: 'custom', props: { brandName: 'Brand', brandLabel: 'Go home', logoSrc: '/logo.svg', logoAlt: 'Logo', brandHref: '/home', mobileMenuOpen: true, themes, colorMode: 'auto', locale: 'fr', colorModeLabels: { light: 'Clair', dark: 'Sombre', auto: 'Auto' } } },
] satisfies Fixture[];
