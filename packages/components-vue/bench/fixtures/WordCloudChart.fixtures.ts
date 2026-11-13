import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: [{ text: 'data', weight: 10 }, { text: 'vue', weight: 7 }, { text: 'chart', weight: 5 }, { text: 'cloud', weight: 3, tone: 'category4' }], label: 'Words' } },
  { id: 'single', props: { data: [{ text: 'only', weight: 1 }], label: 'Single' } },
  { id: 'empty', props: { data: [], label: 'Empty' } },
  { id: 'equal-weights', props: { data: [{ text: 'aa', weight: 4 }, { text: 'bb', weight: 4 }, { text: 'cc', weight: 4 }], label: 'Equal' } },
  { id: 'custom-size', props: { data: [{ text: 'big', weight: 9 }, { text: 'small', weight: 2 }], label: 'Sized', width: 640, height: 400 } },
  { id: 'custom-attrs', props: { data: [{ text: 'tag', weight: 6 }], label: 'Custom', class: 'consumer', style: 'color: red', 'data-bench': 'wordCloudChart' } },
] satisfies Fixture[];
