import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: '<p>One</p>' } },
  { id: 'labeled', props: { label: 'Sections' }, slots: { default: '<p>One</p><p>Two</p>' } },
  { id: 'controlled-expanded', props: { expanded: 'a' }, slots: { default: '<p>A</p>' } },
  { id: 'split-primary', props: { shape: 'split-primary', primary: 'a', primaryMinHeight: 200 }, slots: { default: '<p>A</p>' } },
  { id: 'custom-attrs', props: { label: 'Attrs', class: 'consumer', style: 'color: red', 'data-bench': 'stack' }, slots: { default: '<p>A</p>' } },
] satisfies Fixture[];
