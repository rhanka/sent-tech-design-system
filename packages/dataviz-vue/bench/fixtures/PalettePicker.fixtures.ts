import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { categorical: ['#ff0000', '#00ff00'], sequential: ['#ffffff', '#0000ff'], diverging: ['#ff0000', '#ffffff', '#0000ff'], label: 'Palette', min: 'Low', max: 'High' } },
  { id: 'empty', props: {} },
  { id: 'categorical-attrs', props: { categorical: ['red', 'blue', 'green'], swatchSize: 12, class: 'consumer', 'data-bench': 'palette', style: 'color:red' } },
  { id: 'sequential-endpoints', props: { sequential: ['#ffffff', '#000000'], steps: 3, min: '', label: '' } },
  { id: 'diverging', props: { diverging: ['#ff0000', '#ffffff', '#0000ff'], steps: 5, max: '100', label: 'Balance' } },
  { id: 'invalid-scales', props: { sequential: ['red'], diverging: ['red', 'blue'], categorical: [], swatchSize: 0 } },
  { id: 'clamped-swatch', props: { categorical: ['#112233'], swatchSize: -10 } },
] satisfies Fixture[];
