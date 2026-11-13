import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ label: 'A', width: 50, segments: [{ label: 'x', value: 30 }, { label: 'y', value: 20 }] }, { label: 'B', width: 50, segments: [{ label: 'x', value: 10 }, { label: 'z', value: 40 }] }], label: 'Split' } },
  { id: 'tones', props: { data: [{ label: 'A', width: 2, segments: [{ label: 'x', value: 1, tone: 'category4' }, { label: 'y', value: 1, tone: 'category6' }] }], label: 'Tones' } },
  { id: 'invalid', props: { data: [{ label: 'Good', width: 10, segments: [{ label: 'x', value: 5 }] }, { label: 'Bad', width: 0, segments: [{ label: 'x', value: 5 }] }, { label: 'Zero', width: 10, segments: [{ label: 'x', value: 0 }, { label: 'y', value: 5 }] }], label: 'Clean' } },
  { id: 'empty', props: { data: [], label: 'None' } },
  { id: 'custom-attrs', props: { data: [{ label: 'A', width: 3, segments: [{ label: 'x', value: 2 }] }], label: 'Sized', width: 640, height: 360, class: 'consumer', style: 'color: red', 'data-bench': 'marimekko' } },
] satisfies Fixture[];
