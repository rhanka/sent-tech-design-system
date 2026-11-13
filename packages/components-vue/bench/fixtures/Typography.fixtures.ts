import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: 'Hello world' } },
  { id: 'h1-variant', props: { variant: 'h1' }, slots: { default: 'Title' } },
  { id: 'custom-as', props: { variant: 'h2', as: 'span' }, slots: { default: 'As span' } },
  { id: 'weight-tone-align', props: { variant: 'body-sm', weight: 'semibold', tone: 'secondary', align: 'center' }, slots: { default: 'Styled' } },
  { id: 'truncate', props: { truncate: true }, slots: { default: 'A very long line that should be cut off with an ellipsis' } },
  { id: 'caption', props: { variant: 'caption' }, slots: { default: 'Small note' } },
  { id: 'custom-attrs', props: { variant: 'h3', class: 'consumer', style: 'color: red', 'data-bench': 'typography' }, slots: { default: 'With attrs' } },
] satisfies Fixture[];
