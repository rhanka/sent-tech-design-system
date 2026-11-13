import { createDashboardStore } from '@sentropic/dataviz-core';
import { newStore } from './store.js';
import type { Fixture } from './types.js';
// The presenter formats local time; freeze the Node fixture environment.
process.env.TZ = 'UTC';
const base = () => ({ store: newStore(), viewId: 'feed', at: 'city', type: 'region', severity: 'sales', message: 'sales', label: 'Events' });
export default [
  { id: 'default', props: base() },
  { id: 'sized', props: { ...base(), maxHeight: 320, height: 240 } },
  { id: 'class-attrs', props: { ...base(), class: 'consumer', 'data-bench': 'feed' } },
  { id: 'populated', props: { ...base(), at: 'at', type: 'type', severity: 'severity', message: 'message', store: createDashboardStore({
    model: { dimensions: [{ id: 'at', label: 'at', type: 'continuous' }, { id: 'type', label: 'type', type: 'discrete' }, { id: 'severity', label: 'severity', type: 'discrete' }, { id: 'message', label: 'message', type: 'discrete' }], measures: [] },
    data: [
      { at: 1000, type: 'notice', severity: 'warning', message: 'Scheduled' },
      { at: 3000, type: 'alert', severity: 'error', message: 'Failed deploy' },
      { at: 2000, type: 'deploy', severity: 'success', message: 'Deployed' },
      { at: 500, type: 'audit', severity: 'custom', message: 'Reviewed' },
    ],
  }) } },
  { id: 'empty', props: { ...base(), store: newStore([]) } },
] satisfies Fixture[];
