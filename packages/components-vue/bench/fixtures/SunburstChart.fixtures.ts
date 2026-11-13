import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { data: { label: 'Root', children: [{ label: 'A', value: 10 }, { label: 'B', value: 20 }] }, label: 'Sunburst' } },
  { id: 'legend-custom', props: { data: { label: 'Root', children: [{ label: 'X', value: 5, tone: 'category3' }, { label: 'Y', children: [{ label: 'Y1', value: 8 }] }] }, label: 'Sunburst', legend: true, width: 400, height: 360, class: 'consumer', style: 'color: red', 'data-bench': 'sunburst' } },
  { id: 'empty', props: { data: { label: 'Empty', children: [] }, label: 'Empty' } },
  { id: 'zero', props: { data: { label: 'Root', children: [{ label: 'Zero', value: 0 }] }, label: 'Zero' } },
  { id: 'deep', props: { data: { label: 'Root', children: [{ label: 'L1', children: [{ label: 'L2', children: [{ label: 'Leaf', value: 12 }] }] }] }, label: 'Deep' } },
] satisfies Fixture[];
