import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { label: 'Password' } },
  { id: 'model-helper', props: { label: 'Secret', modelValue: 'hunter2', helperText: 'Min. 8 chars.', placeholder: '••••••' } },
  { id: 'error-disabled', props: { label: 'Password', errorText: 'Required', disabled: true } },
  { id: 'custom-toggles', props: { label: 'Pwd', showLabel: 'Afficher', hideLabel: 'Masquer', size: 'lg', class: 'consumer', style: 'color: red', 'data-bench': 'pwd' } },
{ id:'rich-help',props:{},legacyProps:{label:h('strong','Password'),helperText:h('em','Help')},slots:{label:'<strong>Password</strong>','helper-text':'<em>Help</em>'} },
{ id:'rich-error',props:{},legacyProps:{errorText:h('strong','Required')},slots:{'error-text':'<strong>Required</strong>'} },
] satisfies Fixture[];
