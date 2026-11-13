import { Rocket } from 'lucide-vue-next';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { name: 'eye' } },
  { id: 'settings-sized', props: { name: 'settings', size: 24, strokeWidth: 1.5, title: 'Settings' } },
  { id: 'glyph-rocket', props: { glyph: Rocket } },
  { id: 'glyph-wins', props: { name: 'eye', glyph: Rocket } },
  { id: 'decorative', props: { name: 'close' } },
  { id: 'custom-attrs', props: { name: 'layers', class: 'consumer', style: 'color: red', 'data-bench': 'icon' } },
] satisfies Fixture[];
