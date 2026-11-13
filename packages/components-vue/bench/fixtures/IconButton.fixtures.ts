import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: '✕' } },
  { id: 'secondary-large', props: { size: 'lg', variant: 'secondary' }, slots: { default: '＋' } },
  { id: 'danger-small', props: { size: 'sm', variant: 'danger', disabled: true }, slots: { default: '🗑' } },
  { id: 'submit-custom', props: { type: 'submit', class: 'consumer', style: 'color: red', 'aria-label': 'Remove', 'data-bench': 'icon-button' }, slots: { default: '<strong>×</strong>' } },
] satisfies Fixture[];
