import type { Fixture } from './types.js';
export default [
  { id: 'default', slots: { default: 'Documentation' } },
  { id: 'as-div', props: { as: 'div' }, slots: { default: 'Block' } },
  { id: 'as-h2', props: { as: 'h2' }, slots: { default: 'Heading' } },
  { id: 'as-h3-custom', props: { as: 'h3', class: 'consumer', style: 'color: red', 'data-bench': 'overline' }, slots: { default: 'Sub' } },
  { id: 'empty', props: {} },
] satisfies Fixture[];
