import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {} },
  { id: 'no-auto-hide', props: { autoHide: false } },
  { id: 'disabled', props: { disabled: true, label: 'Back to top', targetId: 'main', threshold: 100 } },
  { id: 'smooth-false', props: { smooth: false, targetId: '#main' } },
  { id: 'custom', props: { class: 'consumer', style: 'color: red', 'data-bench': 'totop' } },
] satisfies Fixture[];
