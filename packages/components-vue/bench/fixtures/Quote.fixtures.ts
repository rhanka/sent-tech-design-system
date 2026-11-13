import { h } from 'vue';
import type { Fixture } from './types.js';
export default [
  { id: 'default', slots: { default: 'The quick brown fox.' } },
  { id: 'author', props: { author: 'Ada' }, slots: { default: 'Quote here.' } },
  { id: 'author-source', props: { author: 'Ada', source: 'Notes' }, slots: { default: 'Quote here.' } },
  { id: 'source-only', props: { source: 'Docs' }, slots: { default: 'Quote here.' } },
  { id: 'custom-attrs', props: { author: 'Ada', class: 'consumer', style: 'color: red', 'data-bench': 'quote' }, slots: { default: 'Quote here.' } },
{ id:'rich-attribution',props:{},legacyProps:{author:h('strong','Ada'),source:h('em','Notes')},slots:{author:'<strong>Ada</strong>',source:'<em>Notes</em>',default:'Quote'} },
] satisfies Fixture[];
