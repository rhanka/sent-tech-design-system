import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ at: 1000, type: 'deploy', severity: 'info', message: 'Deployed' }] } },
  { id: 'mixed-severities', props: { data: [{ at: 2000, type: 'alert', severity: 'error', message: 'Failed' }, { at: 3000, type: 'deploy', severity: 'success', message: 'Done' }, { at: 1000, type: 'warn', severity: 'warning', message: 'Slow' }, { at: 1500, type: 'custom', severity: 'custom-sev', message: 'Odd' }], label: 'Events', maxHeight: 200 } },
  { id: 'height-prop', props: { data: [{ at: 1000, type: 'deploy', severity: 'info', message: 'Hi' }], height: 120, class: 'consumer', style: 'color: red', 'data-bench': 'feed' } },
  { id: 'invalid-events', props: { data: [{ at: NaN, type: 'bad', severity: 'info', message: 'Bad time' }, { at: 5000, type: 'ok', severity: 'info', message: 'Good' }] } },
  { id: 'unsorted', props: { data: [{ at: 100, type: 'a', severity: 'info', message: 'First' }, { at: 900, type: 'b', severity: 'info', message: 'Last' }] } },
  { id: 'empty', props: { data: [] } },
] satisfies Fixture[];
