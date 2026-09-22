// Entrée SSR séparée : bpmn-js empaqueté pour Node, importé seulement par o3/bpmn-node.mjs,
// afin qu'un échec à l'import n'emporte pas les rendus Svelte.
export { default as BpmnViewer } from 'bpmn-js/lib/Viewer';
