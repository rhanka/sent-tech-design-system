import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: '<span>Auto</span>' } },
  { id: 'numeric', props: { span: 6, offset: 2 }, slots: { default: '<span>Half</span>' } },
  { id: 'responsive', props: { span: 12, sm: 6, md: 4, lg: 3 }, slots: { default: '<span>Responsive</span>' } },
  { id: 'section', props: { as: 'section', span: 4, class: 'consumer', style: 'color: red', 'data-bench': 'col' }, slots: { default: '<span>Custom</span>' } },
  { id: 'auto-explicit', props: { span: 'auto', offset: 3 }, slots: { default: '<span>Grows</span>' } },
] satisfies Fixture[];
