import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', props: { items: [{ term: 'Name', description: 'Ada' }, { term: 'Age', description: '30' }] } },
  { id: 'label-value-bordered', props: { items: [{ label: 'Email', value: 'a@b.c' }], bordered: true } },
  { id: 'empty', props: { items: [] } },
  { id: 'custom', props: { items: [{ term: 'X', value: 'Y' }], class: 'consumer', style: 'color: red', 'data-bench': 'structured' } },
  { id: 'partial', props: { items: [{ term: 'Only' }, { description: 'No term' }] } },
{ id:'rich-terms',props:{items:[{term:'Name',value:'Ada'}]},legacyProps:{items:[{term:h('strong','Name'),value:h('em','Ada')}]},slots:{term:{scope:'{ item }',html:'<strong>{{item.term}}</strong>'},definition:{scope:'{ item }',html:'<em>{{item.value}}</em>'}} },
] satisfies Fixture[];
