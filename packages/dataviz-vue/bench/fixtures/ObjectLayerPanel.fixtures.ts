import type { Fixture } from './types.js';
const layers = [ { id: 'page', label: 'Page', kind: 'group' }, { id: 'web', label: 'Help', kind: 'iframe', parentId: 'page' }, { id: 'logo', label: 'Logo', kind: 'image', parentId: 'page', visible: false, locked: true } ];
export default [
 { id: 'default', props: { layers } },
 { id: 'selected', props: { layers, selectedId: 'logo', label: 'Layers' } },
 { id: 'collapsed', props: { layers, expandedIds: [] } },
 { id: 'attrs', props: { layers, class: 'consumer', 'data-bench': 'layers', style: 'color:red' } },
] satisfies Fixture[];
