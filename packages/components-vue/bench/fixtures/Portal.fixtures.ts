import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: '<p>Portal body</p>' } },
  { id: 'inline', props: { disabled: true }, slots: { default: '<button>Inline</button>' } },
  { id: 'custom-target', props: { target: '#destination', class: 'consumer' }, slots: { default: '<span>Moved</span>' } },
  { id: 'attrs', props: { disabled: true, class: 'consumer' }, slots: { default: 'Text' } },
] satisfies Fixture[];
