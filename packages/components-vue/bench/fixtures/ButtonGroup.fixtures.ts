import type { Fixture } from './types.js';
const buttons = '<button type="button">A</button><button type="button">B</button><button type="button">C</button>';
export default [
  { id: 'default', props: {}, slots: { default: buttons } },
  { id: 'vertical-attached', props: { orientation: 'vertical', attached: true, gap: 2 }, slots: { default: buttons } },
  { id: 'gap', props: { gap: 3 }, slots: { default: buttons } },
  { id: 'sized', props: { size: 'sm', label: 'Actions' }, slots: { default: buttons } },
  { id: 'custom', props: { gap: 2, class: 'consumer', style: 'color: red', 'data-bench': 'group' }, slots: { default: buttons } },
] satisfies Fixture[];
