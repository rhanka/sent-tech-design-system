import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { icon: 'trending-up' } },
  { id: 'circle-lines', props: { icon: 'circle-alert' } },
  { id: 'unknown', props: { icon: 'unknown' } },
  { id: 'absent', props: {} },
] satisfies Fixture[];
