import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { categorical: ['#c8102e', '#0072bc', '#009b77', '#f2a900'] } },
  { id: 'sequential', props: { sequential: ['#eff3ff', '#3182ce', '#081d58'], label: 'Sales', min: '0', max: '100' } },
  { id: 'diverging', props: { diverging: ['#d73027', '#f7f7f7', '#4575b4'], steps: 11 } },
  { id: 'all', props: { categorical: ['#c8102e', '#0072bc'], sequential: ['#eff3ff', '#3182ce'], diverging: ['#d73027', '#f7f7f7', '#4575b4'], swatchSize: 16, label: 'Palette' } },
  { id: 'empty', props: {} },
  { id: 'attrs', props: { categorical: ['#c8102e'], class: 'consumer', 'data-bench': 'palette', style: 'color:red' } },
] satisfies Fixture[];
