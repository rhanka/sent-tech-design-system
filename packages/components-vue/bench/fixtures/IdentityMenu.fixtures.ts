import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {} },
  { id: 'authenticated-closed', props: { isAuthenticated: true, user: { displayName: 'Jean Dupont', email: 'jean@acme.test' } } },
  { id: 'authenticated-open', props: { isAuthenticated: true, user: { displayName: 'Jean Dupont' }, open: true } },
  { id: 'accordion-email', props: { isAuthenticated: true, user: { email: 'jean@acme.test' }, variant: 'accordion' } },
  { id: 'custom-labels', props: { isAuthenticated: true, user: { displayName: 'A' }, loginLabel: 'Sign in', devicesLabel: 'Devices', settingsLabel: 'Settings', logoutLabel: 'Log out', devicesHref: '/devices', settingsHref: '/settings' } },
] satisfies Fixture[];
