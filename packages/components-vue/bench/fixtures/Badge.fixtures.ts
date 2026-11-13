import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {}, slots: { default: 'New' } },
  { id: 'success-small-circle', props: { tone: 'success', shape: 'circle', size: 'sm' }, slots: { default: '2' } },
  { id: 'warning-circle-overflow', props: { tone: 'warning', shape: 'circle' }, slots: { default: '1234' } },
  { id: 'error-custom', props: { tone: 'error', class: 'consumer', style: 'color: red', title: 'Failure', 'data-bench': 'badge' }, slots: { default: '<strong>Failed</strong> &amp; retry' } },
  { id: 'info-small', props: { tone: 'info', size: 'sm' }, slots: { default: 'Info' } },
  { id: 'empty', props: {} },
] satisfies Fixture[];
