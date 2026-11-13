import type { Fixture } from './types.js';
const data = {
  measure: 'Sales',
  levels: [
    { dimension: 'Channel', nodes: [{ label: 'Web', value: 60 }, { label: 'Store', value: 40 }] },
    { dimension: 'Region', nodes: [{ label: 'North', value: 35, parent: 'Web' }, { label: 'South', value: 25, parent: 'Web' }] },
  ],
};
export default [
  { id: 'default', props: { data, label: 'Breakdown' } },
  { id: 'custom-size', props: { data, label: 'Breakdown', width: 800, height: 200, class: 'consumer', style: 'color: red', 'data-bench': 'chart' } },
  { id: 'size-prop', props: { data, label: 'Breakdown', size: 480 } },
  { id: 'single-level', props: { data: { measure: 'Total', levels: [{ dimension: 'Year', nodes: [{ label: '2024', value: 100 }] }] }, label: 'Single' } },
  { id: 'no-label', props: { data } },
  { id: 'empty-levels', props: { data: { measure: 'Empty', levels: [] }, label: 'Empty tree' } },
] satisfies Fixture[];
