import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { text: 'Hello streaming' } },
  { id: 'passive-events', props: { text: 'Working', mode: 'passive', events: [{ id: '1', label: 'First' }, { id: '2', label: 'Second' }] } },
  { id: 'empty-placeholder', props: { placeholder: 'Waiting…' } },
  { id: 'custom', props: { text: 'Hi', class: 'consumer', style: 'color: red', 'data-bench': 'streaming' } },
  { id: 'no-events', props: { text: '', placeholder: '', events: [] } },
{ id:'rich-text-event',props:{events:[{id:'a',label:'Event'}]},legacyProps:{text:h('strong','Text'),events:[{id:'a',label:h('em','Event')}]},slots:{text:'<strong>Text</strong>','event-label':{scope:'{ event }',html:'<em>{{event.label}}</em>'}} },
{ id:'rich-placeholder',props:{},legacyProps:{placeholder:h('em','Wait')},slots:{placeholder:'<em>Wait</em>'} },
] satisfies Fixture[];
