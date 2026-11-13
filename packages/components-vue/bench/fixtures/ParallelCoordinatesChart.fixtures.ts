import type { Fixture } from './types.js';
const axes = [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }];
export default [
  { id: 'default', props: { axes, data: [{ a: 10, b: 20 }, { a: 30, b: 5 }], label: 'Lines' } },
  { id: 'tones', props: { axes, data: [{ a: 1, b: 2 }, { a: 3, b: 4 }], tones: ['category1', 'category3'], label: 'Lines', width: 640, height: 360 } },
  { id: 'gap', props: { axes, data: [{ a: 1, b: 'x' }, { a: 'no', b: 4 }, { a: 2, b: 3 }], label: 'Gaps', class: 'consumer', style: 'color: red', 'data-bench': 'parallel' } },
  { id: 'empty', props: { axes: [], data: [], label: 'No data' } },
] satisfies Fixture[];
