import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { content: 'More information' }, slots: { default: '<button type="button">Help</button>' } },
  { id: 'bottom', props: { content: 'Below the trigger', placement: 'bottom' }, slots: { default: 'Trigger text' } },
  { id: 'custom', props: { content: 'A & B < C', class: 'consumer', style: 'color: red', 'data-bench': 'tooltip', tabindex: 0 }, slots: { default: '<strong>Focus me</strong>' } },
  { id: 'empty-content', props: { content: '' }, slots: { default: 'Empty tooltip' } },
  { id: 'empty-trigger', props: { content: 'No trigger content' } },
] satisfies Fixture[];
