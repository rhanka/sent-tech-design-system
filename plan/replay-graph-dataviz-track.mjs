// Replay the owner-mandated programme through the public @sentropic/track facade.
// Never writes the event log or its integrity frame directly. Single designated writer.
import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

const root = process.cwd();
const input = JSON.parse(readFileSync(join(root, 'plan/graph-dataviz-track-operations.json'), 'utf8'));
const apply = process.argv.includes('--apply');
const packageFlag = process.argv.indexOf('--track-package');
const packageRoot = packageFlag >= 0 ? resolve(process.argv[packageFlag + 1])
  : resolve(dirname(realpathSync(execFileSync('which', ['track'], { encoding: 'utf8' }).trim())), '../..');
const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
if (manifest.name !== '@sentropic/track') throw new Error('Expected the public @sentropic/track package');
const { Track, EventStore, validate } = await import(pathToFileURL(join(packageRoot, manifest.exports['.'])).href);
const eventStore = new EventStore(join(root, '.track/events.jsonl'));
const before = eventStore.readAll();
if (!validate(before).ok) throw new Error('Invalid initial track log');
const track = new Track(eventStore, {
  by: input.actor,
  prov: { transport: 'internal', proposed: true, auth: 'unauthenticated' },
});
const initial = track.state();
// Validate the complete operation graph before the first mutation.
const byKey = new Map(input.items.map(item => [item.key, item]));
if (byKey.size !== input.items.length) throw new Error('Duplicate task keys');
const visited = new Set(), visiting = new Set();
function visit(key) {
  if (visiting.has(key)) throw new Error(`Dependency cycle at ${key}`);
  if (visited.has(key)) return;
  const item = byKey.get(key);
  if (!item || !input.streams[item.stream]) throw new Error(`Unknown task or stream: ${key}`);
  visiting.add(key);
  for (const dependency of item.dependsOn ?? []) visit(dependency);
  visiting.delete(key); visited.add(key);
}
for (const key of byKey.keys()) visit(key);
for (const task of input.items) if (task.delivery) {
  const actual = createHash('sha256').update(readFileSync(join(root, task.delivery.locator))).digest('hex');
  if (actual !== task.delivery.sha256) throw new Error(`Delivery artifact changed: ${task.key}`);
}
for (const [code, stream] of Object.entries(input.streams)) {
  const item = initial.items.get(stream.id);
  if (!item || item.title !== stream.title || item.workspace !== 'streams') throw new Error(`Stream drift: ${code}`);
}
const ids = {};
const operations = [];
const token = (key, verb) => `graph-dataviz-repatriation:v1:${key}:${verb}`;
for (const task of input.items) {
  const matches = [...track.state().items.values()].filter(i => i.sourceKey === task.sourceKey);
  if (matches.length > 1) throw new Error(`Duplicate sourceKey: ${task.sourceKey}`);
  let found = task.existingId ? track.state().items.get(task.existingId) : matches[0];
  if (task.existingId && !found) throw new Error(`Missing existing item ${task.existingId}`);
  if (!found) {
    operations.push({ key: task.key, action: 'create' });
    if (apply) {
      const id = track.withClientToken(token(task.key, 'create'), () => track.createItem({
        kind: 'chore', title: task.title, workspace: 'streams', parentId: input.streams[task.stream].id,
        sourceKey: task.sourceKey, body: task.body,
        accountable: input.actor, responsible: [input.actor],
        links: [{ kind: 'plan', locator: 'plan/10-BRANCH_graph-dataviz-repatriation.md' }],
      }));
      found = track.state().items.get(id);
    }
  }
  ids[task.key] = found?.id ?? `pending:${task.key}`;
  if (!found) continue;
  // Preserve an existing accountable owner; adopt only genuinely unassigned items.
  if (!found.accountable) {
    operations.push({ key: task.key, action: 'assign-agent' });
    if (apply) track.setRaci(found.id, { accountable: input.actor, responsible: [input.actor] }, token(task.key, 'raci'));
  }
  const statement = `[${task.key}] ${task.acceptance}`;
  if (![...track.state().criteria.values()].some(c => c.itemId === found.id && c.statement === statement)) {
    operations.push({ key: task.key, action: 'criterion' });
    if (apply) track.withClientToken(token(task.key, 'criterion'), () => track.addCriterion(found.id, statement));
  }
  if ((task.start || task.delivery) && found.realization === 'to-do') {
    operations.push({ key: task.key, action: 'start' });
    if (apply) track.withClientToken(token(task.key, 'start'), () => track.setRealization(found.id, 'in-progress'));
  }
  if (task.delivery) {
    if (found.specStatus === 'to-specify') {
      operations.push({ key: task.key, action: 'specified' });
      if (apply) track.withClientToken(token(task.key, 'specified'), () => track.setSpec(found.id, 'specified'));
    }
    if (found.realization !== 'done') {
      operations.push({ key: task.key, action: 'delivered' });
      if (apply) track.withClientToken(token(task.key, 'delivered'), () => track.setRealization(found.id, 'done'));
    }
    const criterion = [...track.state().criteria.values()].find(c => c.itemId === found.id && c.statement === statement);
    if (criterion && ![...track.state().evidence.values()].some(e => e.criterionId === criterion.id && e.locator === task.delivery.locator)) {
      operations.push({ key: task.key, action: 'link-delivery-evidence' });
      if (apply) track.withClientToken(token(task.key, 'delivery-evidence'), () => track.linkEvidence(criterion.id, task.delivery.kind, task.delivery.locator));
    }
    // A delivered artifact is not owner acceptance. No pass run or owner choice is manufactured here.
  }
}
for (const task of input.items) for (const prerequisite of task.dependsOn ?? []) {
  if (!ids[prerequisite]) throw new Error(`Unresolved prerequisite: ${prerequisite}`);
  const targetId = ids[task.key], ref = ids[prerequisite];
  if (![...track.state().blockers.values()].some(b => b.targetId === targetId && b.ref === ref && b.kind === 'dependency')) {
    operations.push({ key: task.key, action: 'dependency', prerequisite });
    if (apply) track.withClientToken(token(task.key, `dep:${prerequisite}`), () => track.openBlocker({
      targetId, ref, kind: 'dependency', scope: 'intra', resolutionRule: 'linked-accepted',
      reason: `${task.key} requires the acceptance evidence of ${prerequisite}`, owner: input.actor,
    }));
  }
}
const decisionInput = JSON.parse(readFileSync(join(root, 'spec/graph-dataviz-decisions.json'), 'utf8'));
const decisions = {};
for (const question of decisionInput.decisions) {
  const matches = [...track.state().decisions.values()].filter(d => d.sourceKey === question.sourceKey);
  if (matches.length > 1) throw new Error(`Duplicate decision sourceKey: ${question.sourceKey}`);
  if (question.targets.some(key => !ids[key])) throw new Error(`Unknown decision target: ${question.key}`);
  const dossier = { context: `Incomplete: fable 5.1 + gemini 3.7 review pending.\n\n${question.context}`,
    options: question.options, recommendation: question.recommendation, qa: [] };
  let id = matches[0]?.id;
  if (!id) {
    operations.push({ key: question.key, action: 'prepare-decision', review: decisionInput.review.status });
    if (apply) id = track.withClientToken(token(question.key, 'decision'), () => track.createDecision({
      decisionKind: 'orientation', title: `${question.key} — ${question.title}`, workspace: 'streams',
      targets: question.targets.map(key => ids[key]), sourceKey: question.sourceKey,
      accountable: input.actor,
      dossier,
      links: [{ kind: 'dossier-source', locator: 'spec/SPEC_DECISIONS_GRAPH_DATAVIZ_REPATRIATION.md' }],
    }));
  } else if (['context', 'options', 'recommendation'].some(field => !isDeepStrictEqual(matches[0].dossier[field], dossier[field]))) {
    if (matches[0].outcome !== 'pending' || matches[0].dossier.selectedOptionId) throw new Error(`Settled decision requires explicit reconciliation: ${question.key}`);
    operations.push({ key: question.key, action: 'revise-pending-dossier' });
    const revision = createHash('sha256').update(JSON.stringify(dossier)).digest('hex');
    if (apply) track.withClientToken(token(question.key, `revise:${revision}`), () => track.reviseDossier(id, { ...matches[0].dossier, ...dossier }));
  }
  decisions[question.key] = id ?? `pending:${question.key}`;
}
const after = eventStore.readAll();
if (!validate(after).ok) throw new Error('Invalid resulting track log');
const result = { schemaVersion: 1, trackVersion: manifest.version, actor: input.actor,
  mode: apply ? 'applied' : 'preview', eventsBefore: before.length, eventsAfter: after.length,
  appendedEvents: after.length - before.length, operations, ids, decisions };
if (apply) writeFileSync(join(root, 'docs/graph-dataviz-track-sync.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
