import type { Fixture } from './types.js';
const layout = { columns: 2, panels: [{ id: 'a', x: 0, y: 0, w: 1, h: 1 }, { id: 'b', x: 1, y: 0, w: 1, h: 2 }] };
const panels = [{ id: 'a', title: 'Alpha', description: 'First panel' }, { id: 'b', title: 'Beta' }];
export default [
  { id: 'default', props: { layout } },
  { id: 'panels', props: { layout, panels } },
  { id: 'editable', props: { layout, panels, editable: true } },
  { id: 'sized', props: { layout, panels, rowHeight: 128, minPanelHeight: 140 } },
  { id: 'custom-slot', props: { layout, panels }, slots: { default: { html: '<em>Custom {{ meta.title }}</em>', scope: '{ meta }' } } },
  { id: 'class-attrs', props: { layout, panels, class: 'consumer', 'data-bench': 'grid' } },
] satisfies Fixture[];
