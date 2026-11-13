import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Choose' }, slots: { default: '<div role="option">A</div><div role="option">B</div>' } },
  { id: 'labelledby-multiple', props: { labelledby: 'ext-label', multiple: true, value: ['a', 'b'] }, slots: { default: '<div role="option">A</div>' } },
  { id: 'controlled-single', props: { label: 'Single', value: 'a' }, slots: { default: '<div role="option">A</div>' } },
  { id: 'null-value', props: { label: 'Empty', value: null }, slots: { default: '<div role="option">A</div>' } },
  { id: 'custom-attrs', props: { label: 'Custom', class: 'consumer', style: 'color: red', 'data-bench': 'selectable' }, slots: { default: '<div role="option">X</div>' } },
  { id: 'empty', props: { label: 'Empty list' } },
] satisfies Fixture[];
