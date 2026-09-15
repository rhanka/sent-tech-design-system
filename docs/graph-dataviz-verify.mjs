// Artifact and migration verification. Read-only; does not execute a Track write.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sync = read('docs/graph-dataviz-track-sync.json');
const operations = read('plan/graph-dataviz-track-operations.json');
const trackRoot = path.resolve(path.dirname(fs.realpathSync(execFileSync('which', ['track'], { encoding: 'utf8' }).trim())), '../..');
const manifest = read(path.join(trackRoot, 'package.json'));
const { Track, EventStore, validate } = await import(pathToFileURL(path.join(trackRoot, manifest.exports['.'])).href);
const store = new EventStore('.track/events.jsonl');
const events = store.readAll();
assert(validate(events).ok, 'Track integrity');
const state = new Track(store).state();
for (const item of operations.items) {
  const target = state.items.get(sync.ids[item.key]);
  assert(target, `Missing item ${item.key}`);
  assert(target.accountable, `No accountable ${item.key}`);
  if (!item.existingId) {
    assert(target.parentId === operations.streams[item.stream].id, `Incorrect stream ${item.key}`);
    assert(target.sourceKey === item.sourceKey, `Incorrect source key ${item.key}`);
  }
  for (const dep of item.dependsOn ?? []) assert([...state.blockers.values()].some(b => b.targetId === target.id && b.ref === sync.ids[dep] && b.kind === 'dependency'), `Missing dependency ${item.key} -> ${dep}`);
}
const maps = [
  ['sources', read('docs/graph-dataviz-source-map.json').exports, 'key', 'trackKey', 'trackId'],
  ['ds', read('docs/graph-dataviz-ds-exports.json').exports, 'key', 'track_key', 'track_id'],
];
const reference = read('docs/graph-dataviz-reference-catalog.json');
const referenceRows = ['elk_algorithms','elk_option_groups','elk_options','graphviz_engines','sentropic_actual_engines','jointjs_apps_and_recipes'].flatMap(k => reference[k]);
maps.push(['references', referenceRows, 'entry_key', 'track_key', 'track_id']);
const counts = {};
for (const [name, rows, keyField, taskField, idField] of maps) {
  assert(new Set(rows.map(r => r[keyField])).size === rows.length, `Duplicate ${name} key`);
  for (const row of rows) assert(sync.ids[row[taskField]] === row[idField] && state.items.has(row[idField]), `Unresolved ${name} row ${row[keyField]}`);
  counts[name] = rows.length;
}
const dag = read('docs/graph-dataviz-architecture-dag.json');
const adj = new Map(dag.nodes.map(n => [n, []]));
for (const [a,b] of dag.edges) {
  assert(adj.has(a) && adj.has(b), `Unknown DAG node: ${a}/${b}`); adj.get(a).push(b);
}
const active = new Set(), seen = new Set();
function visit(n) {
  assert(!active.has(n), `Architecture cycle ${n}`);
  if (seen.has(n)) return;
  active.add(n); for (const d of adj.get(n)) visit(d); active.delete(n); seen.add(n);
}
for (const n of dag.nodes) visit(n);
assert(adj.get('dataviz-core').length === 0, 'dataviz-core must remain independent');
const provenance = read('docs/graph-dataviz-m1-provenance.json');
for (const row of provenance.files) {
  const actual = createHash('sha256').update(fs.readFileSync(row.destination)).digest('hex');
  assert(actual === (row.destinationSha256 ?? row.sha256), `Migration drift ${row.destination}`);
  if (row.status === 'adapted-packaging-only') assert(['packages/graph/package.json','packages/graph/tsconfig.json','packages/graph/PUBLISHING.md','packages/dataviz-core/package.json'].includes(row.destination), `Unexpected source adaptation ${row.destination}`);
}
for (const [key,id] of Object.entries(sync.decisions)) {
  const d = state.decisions.get(id);
  assert(d && d.outcome === 'pending' && !d.dossier.selectedOptionId, `Decision state ${key}`);
}
const programmeEvents = events.filter(e => e.clientToken?.startsWith('graph-dataviz-repatriation:'));
assert(programmeEvents.every(e => e.by === operations.actor && e.prov?.proposed === true && e.prov?.auth === 'unauthenticated'), 'Incorrect programme actor/provenance');
console.log(JSON.stringify({ result: 'pass', counts, mappedItems: operations.items.length,
  pendingDecisions: Object.keys(sync.decisions).length, dagNodes: dag.nodes.length,
  dagEdges: dag.edges.length, provenanceFiles: provenance.files.length,
  trackEvents: events.length, programmeEvents: programmeEvents.length }, null, 2));
