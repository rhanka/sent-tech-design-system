import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ position: 1, label: 'Launch' }, { position: 3, label: 'Release', description: 'v1' }], label: 'Timeline' } },
  { id: 'tones-truncate', props: { data: [{ position: 0, label: 'A very long event label here', tone: 'category3' }, { position: 5, label: 'Short', tone: 'category7' }, { position: 9, label: 'Another event', description: 'Details' }], width: 800, height: 300, label: 'Events' } },
  { id: 'single', props: { data: [{ position: 42, label: 'Only' }], label: 'Single' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'custom-attrs', props: { data: [{ position: 2, label: 'X' }], label: 'Custom', class: 'consumer', style: 'color: red', 'data-bench': 'timelineChart' } },
] satisfies Fixture[];
