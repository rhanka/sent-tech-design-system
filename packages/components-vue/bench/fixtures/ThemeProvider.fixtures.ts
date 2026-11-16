import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: '<span>Theme content</span>' } },
  { id: 'namespace', props: { namespace: 'demo' }, slots: { default: 'Namespaced' } },
  { id: 'attrs', props: { id: 'tenant', class: 'consumer', 'data-bench': 'theme' }, slots: { default: '<strong>Tenant</strong>' } },
  { id: 'empty', props: {} },
] satisfies Fixture[];
