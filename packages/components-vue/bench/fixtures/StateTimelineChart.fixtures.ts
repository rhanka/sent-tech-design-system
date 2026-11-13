import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ series: 'S1', segments: [{ start: 0, end: 10, state: 'up' }, { start: 10, end: 20, state: 'down', tone: 'error' }] }], label: 'Timeline' } },
  { id: 'custom', props: { data: [{ series: 'A', segments: [{ start: 1, end: 5, state: 'on' }] }], label: 'Custom', width: 500, height: 280, class: 'consumer', style: 'color: red', 'data-bench': 'timeline' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'invalid', props: { data: [{ series: '', segments: [] }, { series: 'Bad', segments: [{ start: Number.NaN, end: 5, state: 'x' }] }], label: 'Invalid' } },
  { id: 'numeric-state', props: { data: [{ series: 'N', segments: [{ start: 0, end: 100, state: 1 }] }], label: 'Numeric' } },
] satisfies Fixture[];
