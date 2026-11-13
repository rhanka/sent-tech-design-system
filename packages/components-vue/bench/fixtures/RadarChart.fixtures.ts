import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { axes: ['Speed', 'Power', 'Range', 'Cost'], series: [{ label: 'Alpha', values: [3, 7, 5, 2] }], label: 'Radar' } },
  { id: 'multi-legend', props: { axes: ['A', 'B', 'C', 'D', 'E'], series: [{ label: 'One', values: [8, 4, 6, 9, 3], tone: 'category2' }, { label: 'Two', values: [5, 9, 3, 4, 7], tone: 'category5' }], label: 'Radar', legend: true, levels: 5, maxValue: 10, width: 400, height: 360, class: 'consumer', style: 'color: red', 'data-bench': 'radar' } },
  { id: 'single-axis', props: { axes: ['Only'], series: [{ label: 'Solo', values: [10] }], label: 'Single' } },
  { id: 'empty-series', props: { axes: ['A', 'B', 'C'], series: [], label: 'Empty' } },
  { id: 'custom-domain', props: { axes: ['X', 'Y', 'Z'], series: [{ label: 'Low', values: [1, 2, 1] }], label: 'Custom', levels: 3, maxValue: 100, width: 300, height: 300 } },
  { id: 'many-axes', props: { axes: ['North', 'East', 'South', 'West', 'NE', 'SE', 'SW', 'NW'], series: [{ label: 'Full', values: [9, 8, 7, 6, 5, 4, 3, 2] }], label: 'Compass' } },
] satisfies Fixture[];
