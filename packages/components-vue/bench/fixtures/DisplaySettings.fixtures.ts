import type { Fixture } from './types.js';
export default [
  { id: 'default', props: {} },
  { id: 'custom-values', props: { values: { fontScale: 'large', contrast: 'high', lineSpacing: 'comfortable', reducedMotion: true } } },
  { id: 'partial-values', props: { values: { fontScale: 'extra-large' }, title: 'Display', class: 'consumer', style: 'color: red', 'data-bench': 'display' } },
  { id: 'hide-font-scale', props: { showFontScale: false } },
  { id: 'hide-motion', props: { showReducedMotion: false, showContrast: false } },
  { id: 'hide-all', props: { showFontScale: false, showContrast: false, showLineSpacing: false, showReducedMotion: false } },
] satisfies Fixture[];
