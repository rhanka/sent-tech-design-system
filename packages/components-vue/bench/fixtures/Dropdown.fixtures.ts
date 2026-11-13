import { h } from 'vue';
import type { Fixture } from './types.js';
const options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta', disabled: true }];
export default [
  { id: 'default', props: { options } },
  { id: 'selected', props: { options, value: 'a', locale: 'en' } },
  { id: 'open', props: { options, open: true, value: 'b' } },
  { id: 'attrs', props: { options: [], label: '', placeholder: 'Choose', class: 'consumer', style: 'color: red', 'data-bench': 'dropdown' } },
  { id: 'rich', props: { options: [{ value: 'a', label: 'Alpha' }], value: 'a', open: true }, legacyProps: { options: [{ value: 'a', label: h('strong', 'Alpha') }] }, slots: { 'option-label': { scope: '{ option }', html: '<strong>{{ option.label }}</strong>' } } },
] satisfies Fixture[];
