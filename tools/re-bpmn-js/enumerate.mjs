#!/usr/bin/env node
/**
 * enumerate.mjs — mechanical enumeration of bpmn-js + diagram-js observable surface.
 *
 * No network, no dependencies. Reads the pinned sources under
 * `.ds-scrap/re-sources/` (repo root, read-only) and our stack under
 * `packages/` (this worktree), and writes `docs/re/bpmn-js-inventory.json`.
 *
 * Counting conventions (also stated in the spec):
 * - module: one entry per lib index.js (didi module) in bpmn-js + diagram-js.
 * - command: distinct command ids from Modeling.getHandlers() maps,
 *   `commandStack.registerHandler('…')` and `commandStack.execute('…')`.
 * - rule: distinct `addRule('…')` action names (array forms expanded).
 * - palette: keys of the object returned by bpmn-js PaletteProvider.getPaletteEntries.
 * - context-pad: distinct entry keys assigned in bpmn-js ContextPadProvider
 *   (single + multi element) plus the multi-element `align-elements` entry of
 *   AlignElementsContextPadProvider, de-duplicated by key.
 * - replace-menu: distinct `actionName`s actually offered by ReplaceMenuProvider,
 *   from ReplaceOptions.js (`replaceWith('…')` calls, `replace-with-` prefix
 *   unless overridden, plus the SEQUENCE_FLOW literal options). Commented-out
 *   options are not behaviour and are excluded.
 * - popup-menu: popup provider registrations (disambiguated by provider file
 *   when an id repeats), ReplaceMenuProvider header entries, align-elements
 *   entries and distribute-elements entries.
 * - keyboard: editor-action names bound in SHORTCUTS_KEY_BINDINGS (bpmn-js),
 *   diagram-js KeyboardBindings addListener actions (every listener kept in
 *   the detail), every registered EditorActions action, plus keys handled
 *   without an editor action (search-pad isKey keys, hand-tool hold key,
 *   one shared detail for both). KeyboardUtil KEYS_* groups are not
 *   entries; they enrich the detail of the matching
 *   copy/cut/duplicate/paste/undo/redo actions.
 * - event: distinct EventBus event names from `fire('…')`, `.on('…')`,
 *   `.once('…')` and their array forms (arrays may span lines), the `_emit`
 *   / `_fire` helpers (prefix resolved from each helper definition,
 *   template literals included), string-constant event names, the
 *   InteractionEvents DOM table, the CommandStack lifecycle qualifiers,
 *   and the Dragging helper types. Dynamic names with a trailing dot
 *   (`commandStack.`, `drag.`, `keyboard.`, `popupMenu.`) are kept
 *   verbatim and flagged `dynamicPrefix: true`.
 * - config: fields of BaseViewerOptions + DiagramOptions typedefs, every
 *   `config.*` didi injection key, and every DI-config read qualified by
 *   its file's injection (`config.<feature>.<prop>` from `config.<prop>`,
 *   `this._config.<prop>` and `_config['<prop>']` in that file). Files
 *   without a `config.*` injection have no DI config and are skipped.
 * - renderer: keys of the BpmnRenderer `handlers` map (including `label`),
 *   the `eventIconRenderers` map and the `taskMarkerRenderers` map.
 * - moddle-type: types AND enumerations of the five JSON descriptors present
 *   in the checkout (bpmn, bpmndi, di, dc, bioc). The `color` package (3 types)
 *   has no JSON in this checkout (external `bpmn-in-color-moddle`, dist not
 *   built) and is recorded as a source-gap in meta, not as entries.
 * - api: public methods of every didi `type` service class plus the
 *   entry classes defined directly under `lib/`: `Class.prototype.<m>`
 *   assignments and constructor-style `this.<m> = function/<fn>` assignments
 *   whose name does not start with `_`. Service classes are resolved from
 *   the `index.js` registrations (`name: [ 'type', Impl ]` + its import),
 *   never from a class list.
 * - example: top-level example directories of bpmn-js-examples whose
 *   README carries a markdown heading (upstream tombstones carry none);
 *   the entry detail is that heading.
 *
 * Every raw item must receive exactly one inventory entry; `verify.mjs`
 * compares the inventory against the independent AST extraction in
 * `extract-ast.mjs` and asserts the bijection (the completeness guard).
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const wtRoot = resolve(scriptDir, '..', '..');

function resolveSourcesRoot() {
  const candidates = [
    process.env.RE_SOURCES,
    resolve(wtRoot, '..', '.ds-scrap', 're-sources'),
    resolve(wtRoot, '.ds-scrap', 're-sources'),
    resolve(scriptDir, '..', '..', '..', '.ds-scrap', 're-sources'),
  ].filter(Boolean);
  for (const c of candidates) {
    if (existsSync(join(c, 'MANIFEST.md'))) return c;
  }
  throw new Error(`re-sources not found; tried: ${candidates.join(', ')}`);
}

const sourcesRoot = resolveSourcesRoot();
const bpmnRoot = join(sourcesRoot, 'bpmn-js');
const diagramRoot = join(sourcesRoot, 'diagram-js');
const moddleRoot = join(sourcesRoot, 'bpmn-moddle');
const examplesRoot = join(sourcesRoot, 'bpmn-js-examples');

const GENERATED_AT = '2026-10-16';
const VERSIONS = {
  'bpmn-js': '18.31.0',
  'diagram-js': '15.28.1',
  'bpmn-moddle': '10.3.1',
  'bpmn-js-examples': '18.31.0 (e6a99f5)',
};

// ---------------------------------------------------------------- utilities
function walk(dir, pred) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p, pred));
    else if (!pred || pred(p)) out.push(p);
  }
  return out;
}
function readLines(abs) {
  return readFileSync(abs, 'utf8').split(/\r?\n/);
}
function rel(abs) {
  // Source paths are reported relative to the repo root (parent of the worktree).
  const repoRoot = resolve(wtRoot, '..');
  return relative(repoRoot, abs).split('\\').join('/');
}
function firstLineMatching(abs, re) {
  const lines = readLines(abs);
  for (let i = 0; i < lines.length; i++) if (re.test(lines[i])) return i + 1;
  return 1;
}
function slug(key) {
  return key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x';
}
function jsFiles(root) {
  return walk(join(root, 'lib'), (p) => p.endsWith('.js'));
}

// ------------------------------------------------- our-stack proof helpers
const ourRoots = [
  join(wtRoot, 'packages', 'diagram-core', 'src'),
  join(wtRoot, 'packages', 'diagram-canvas', 'src'),
  join(wtRoot, 'packages', 'graph', 'src'),
];
function grepOur(needle) {
  for (const root of ourRoots) {
    for (const f of walk(root, (p) => p.endsWith('.ts'))) {
      const lines = readLines(f);
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(needle)) {
          return { path: relative(wtRoot, f).split('\\').join('/'), line: i + 1 };
        }
      }
    }
  }
  return null;
}
function proofIn(relFile, needle, fallbackNote) {
  const abs = join(wtRoot, relFile);
  if (existsSync(abs)) {
    const lines = readLines(abs);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(needle)) return { path: relFile, line: i + 1, note: fallbackNote };
    }
    return { path: relFile, line: 1, note: fallbackNote };
  }
  return { path: relFile, line: 1, note: fallbackNote };
}
const PROOF = {
  commands: () => proofIn('packages/diagram-core/src/commands.ts', 'COMMAND_KINDS', 'diagram-core transactional commands (18 kinds); no BPMN command semantics.'),
  skeleton: () => proofIn('packages/diagram-core/src/profiles/skeletons.ts', 'SKELETON. Declared', 'bpmn@1 is a declared skeleton; no BPMN conformance claimed.'),
  skeletonNotes: () => proofIn('packages/diagram-core/src/profiles/skeletons.ts', 'NOT declared', 'Skeleton notes list what BPMN does not declare (DI, rules, event matrix).'),
  scene: () => proofIn('packages/diagram-canvas/src/scene.ts', 'export function buildScene', 'Headless scene from persisted view geometry; no editor interactions.'),
  transform: () => proofIn('packages/diagram-canvas/src/transform.ts', 'export function worldToDevice', 'Camera transform contract (world -> device) only.'),
  graphRenderer: () => proofIn('packages/graph/src/renderer.ts', 'export function createGraphRenderer', 'Generic graph renderer (WebGL2/Canvas2D); no BPMN glyphs.'),
  graphShapes: () => proofIn('packages/graph/src/shape-geometry.ts', 'export function shapeCode', 'Generic shape codes only (circle/diamond/box/...); no BPMN icons/markers.'),
  graphTypes: () => proofIn('packages/graph/src/types.ts', 'export interface GraphRenderer', 'Renderer contract: buffers/camera/snapshot; no diagram editing.'),
  processing: () => proofIn('packages/graph/src/processing/index.ts', 'computeLayout', 'Layout computation only (force-fa2, hierarchy-aware).'),
  coreReadmeGap: () => proofIn('packages/diagram-core/README.md', 'What is not covered yet', 'diagram-core README lists uncovered areas (projection, codecs, native profiles).'),
  canvasReadmeGap: () => proofIn('packages/diagram-canvas/README.md', 'What is not covered yet', 'diagram-canvas README lists uncovered editor behaviours.'),
};

// ------------------------------------------------------------- extractors
// Each extractor returns [{ key, sourceAbs, line, detail }]
function extractModules() {
  const items = [];
  for (const [label, root] of [['bpmn-js', bpmnRoot], ['diagram-js', diagramRoot]]) {
    for (const f of walk(join(root, 'lib'), (p) => p.endsWith('index.js'))) {
      const text = readFileSync(f, 'utf8');
      const initLine = firstLineMatching(f, /__init__/);
      const services = [];
      for (const m of text.matchAll(/^\s{2}([A-Za-z][\w]*)\s*:\s*\[/gm)) services.push(m[1]);
      items.push({
        key: `${label}:${relative(join(root, 'lib'), f).split('\\').join('/')}`,
        sourceAbs: f, line: initLine,
        detail: services.length ? `services: ${services.join(', ')}` : 'didi module (no inline service map matched)',
      });
    }
  }
  return items;
}

function extractCommands() {
  const found = new Map(); // id -> {sourceAbs, line}
  const add = (id, abs, line) => { if (id && !found.has(id)) found.set(id, { sourceAbs: abs, line }); };
  // (a) diagram-js Modeling.getHandlers object literal
  const dModeling = join(diagramRoot, 'lib/features/modeling/Modeling.js');
  readLines(dModeling).forEach((l, i) => {
    const m = l.match(/^\s*'([a-z][\w.]+)':\s*[A-Z]/);
    if (m) add(m[1], dModeling, i + 1);
  });
  // (b) bpmn-js Modeling handlers[...] assignments
  const bModeling = join(bpmnRoot, 'lib/features/modeling/Modeling.js');
  readLines(bModeling).forEach((l, i) => {
    const m = l.match(/handlers\['([^']+)'\]/);
    if (m) add(m[1], bModeling, i + 1);
  });
  // (c) registerHandler / execute literals across both libs
  for (const root of [bpmnRoot, diagramRoot]) {
    for (const f of jsFiles(root)) {
      readLines(f).forEach((l, i) => {
        for (const m of l.matchAll(/registerHandler\(\s*'([^']+)'/g)) add(m[1], f, i + 1);
        for (const m of l.matchAll(/\.execute\(\s*'([^']+)'/g)) add(m[1], f, i + 1);
      });
    }
  }
  return [...found.entries()].map(([key, v]) => ({ key, ...v, detail: 'CommandStack command id' })).sort((a, b) => a.key.localeCompare(b.key));
}

function extractRules() {
  const found = new Map();
  for (const root of [bpmnRoot, diagramRoot]) {
    for (const f of jsFiles(root)) {
      const lines = readLines(f);
      lines.forEach((l, i) => {
        // single: addRule('x'  | array: addRule([ 'x', 'y'  (possibly multiline, handled by token scan below)
        for (const m of l.matchAll(/addRule\(\s*'([^']+)'/g)) {
          if (!found.has(m[1])) found.set(m[1], { sourceAbs: f, line: i + 1 });
        }
      });
      // multiline array form: join a window and capture quoted names after addRule([
      const text = lines.join('\n');
      for (const m of text.matchAll(/addRule\(\s*\[([\s\S]*?)\]/g)) {
        for (const q of m[1].matchAll(/'([^']+)'/g)) {
          if (!found.has(q[1])) {
            const idx = text.slice(0, m.index).split('\n').length;
            found.set(q[1], { sourceAbs: f, line: idx });
          }
        }
      }
    }
  }
  return [...found.entries()].map(([key, v]) => ({ key, ...v, detail: 'RuleProvider action (canExecute gate)' })).sort((a, b) => a.key.localeCompare(b.key));
}

function extractPalette() {
  const f = join(bpmnRoot, 'lib/features/palette/PaletteProvider.js');
  const items = [];
  readLines(f).forEach((l, i) => {
    const m = l.match(/^\s{4}'([a-z][\w.-]+)':\s*(?:\{|createAction|createSubprocess)/) || l.match(/^\s{4}'([a-z][\w.-]+)':/);
    if (m && !items.some((x) => x.key === m[1])) items.push({ key: m[1], sourceAbs: f, line: i + 1, detail: 'Palette entry (group/className/title in source)' });
  });
  return items;
}

function extractContextPad() {
  const f = join(bpmnRoot, 'lib/features/context-pad/ContextPadProvider.js');
  const found = new Map();
  readLines(f).forEach((l, i) => {
    for (const m of l.matchAll(/'((?:append|connect|replace|delete|lane|entry)[\w.-]*)'\s*:/g)) {
      if (!found.has(m[1])) found.set(m[1], { sourceAbs: f, line: i + 1 });
    }
    for (const m of l.matchAll(/'(append\.[\w-]+)'\s*:\s*appendAction/g)) {
      if (!found.has(m[1])) found.set(m[1], { sourceAbs: f, line: i + 1 });
    }
  });
  // Multi-element align entry (AlignElementsContextPadProvider._getEntries).
  const af = join(bpmnRoot, 'lib/features/align-elements/AlignElementsContextPadProvider.js');
  readLines(af).forEach((l, i) => {
    const m = l.match(/'(align-elements)'\s*:/);
    if (m && !found.has(m[1])) found.set(m[1], { sourceAbs: af, line: i + 1 });
  });
  return [...found.entries()].map(([key, v]) => ({ key, ...v, detail: 'Context-pad entry key' })).sort((a, b) => a.key.localeCompare(b.key));
}

function extractReplaceMenu() {
  const f = join(bpmnRoot, 'lib/features/replace/ReplaceOptions.js');
  const lines = readLines(f);
  const text = lines.join('\n');
  const lineAt = (idx) => text.slice(0, idx).split('\n').length;
  const isCommentLine = (lineNo) => (lines[lineNo - 1] || '').trimStart().startsWith('//');
  const found = new Map();
  for (const m of text.matchAll(/replaceWith\(\s*'([^']+)'(?:\s*,\s*\{([\s\S]*?)\}\s*\))?/g)) {
    const line = lineAt(m.index);
    if (isCommentLine(line)) continue; // deactivated gateways are not behaviour
    let action = `replace-with-${m[1]}`;
    const extra = m[2] || '';
    const override = extra.match(/actionName:\s*'([^']+)'/);
    if (override) action = override[1];
    if (!found.has(action)) found.set(action, { sourceAbs: f, line });
  }
  const seqStart = text.indexOf('export var SEQUENCE_FLOW');
  if (seqStart >= 0) {
    const seqText = text.slice(seqStart, text.indexOf('];', seqStart));
    for (const m of seqText.matchAll(/actionName:\s*'([^']+)'/g)) {
      if (!found.has(m[1])) found.set(m[1], { sourceAbs: f, line: lineAt(seqStart + m.index) });
    }
  }
  return [...found.entries()].map(([key, v]) => ({ key, ...v, detail: 'ReplaceOptions actionName (ReplaceMenuProvider entry)' })).sort((a, b) => a.key.localeCompare(b.key));
}

function extractPopupMenu() {
  const found = new Map();
  const add = (key, abs, line, detail) => { if (key && !found.has(key)) found.set(key, { sourceAbs: abs, line, detail }); };
  const providerFiles = [
    join(bpmnRoot, 'lib/features/popup-menu/ReplaceMenuProvider.js'),
    join(bpmnRoot, 'lib/features/align-elements/AlignElementsMenuProvider.js'),
    join(bpmnRoot, 'lib/features/distribute-elements/DistributeElementsMenuProvider.js'),
  ];
  const regs = [];
  for (const f of providerFiles) {
    readLines(f).forEach((l, i) => {
      const m = l.match(/registerProvider\(\s*'([^']+)'/);
      if (m) regs.push({ id: m[1], sourceAbs: f, line: i + 1 });
    });
  }
  const idCount = {};
  for (const r of regs) idCount[r.id] = (idCount[r.id] || 0) + 1;
  for (const r of regs) {
    const stem = r.sourceAbs.split('/').pop().replace(/\.js$/, '');
    add(idCount[r.id] > 1 ? `${r.id} (${stem})` : r.id, r.sourceAbs, r.line, 'Popup-menu provider id');
  }
  readLines(providerFiles[0]).forEach((l, i) => {
    if (l.trimStart().startsWith('//')) return;
    const m = l.match(/'(toggle-[\w-]+)'\s*:/);
    if (m) add(m[1], providerFiles[0], i + 1, 'Popup-menu header entry (ReplaceMenuProvider)');
  });
  const ampLines = readLines(providerFiles[1]);
  let inOptions = false;
  ampLines.forEach((l, i) => {
    if (/ALIGNMENT_OPTIONS\s*=\s*\[/.test(l)) inOptions = true;
    else if (inOptions && /\];/.test(l)) inOptions = false;
    else if (inOptions) {
      const m = l.match(/'([\w-]+)'/);
      if (m) add(`align-elements-${m[1]}`, providerFiles[1], i + 1, 'Align-elements popup entry');
    }
  });
  readLines(providerFiles[2]).forEach((l, i) => {
    const m = l.match(/'(distribute-elements-[\w-]+)'\s*:/);
    if (m) add(m[1], providerFiles[2], i + 1, 'Distribute-elements popup entry');
  });
  return [...found.entries()].map(([key, v]) => ({ key, ...v })).sort((a, b) => a.key.localeCompare(b.key));
}

function extractKeyboard() {
  const items = [];
  const seen = new Set();
  const push = (key, abs, line, detail) => { if (!seen.has(key)) { seen.add(key); items.push({ key, sourceAbs: abs, line, detail }); } };
  const bf = join(bpmnRoot, 'lib/features/keyboard/BpmnKeyboardBindings.js');
  let inMap = false;
  readLines(bf).forEach((l, i) => {
    if (/SHORTCUTS_KEY_BINDINGS\s*=\s*\{/.test(l)) inMap = true;
    else if (inMap && /^\};/.test(l)) inMap = false;
    else if (inMap) {
      const m = l.match(/^\s{2}(\w+):\s*\{\s*key:\s*'([^']+)'(?:,\s*modifier:\s*'([^']+)')?/);
      if (m) push(m[1], bf, i + 1, `key ${m[3] ? m[3] + '+' : ''}${m[2]}`);
    }
  });
  const df = join(diagramRoot, 'lib/features/keyboard/KeyboardBindings.js');
  const listenerLines = new Map();
  readLines(df).forEach((l, i) => {
    const m = l.match(/addListener\('([^']+)'/);
    if (m) {
      if (!listenerLines.has(m[1])) listenerLines.set(m[1], []);
      listenerLines.get(m[1]).push(i + 1);
    }
  });
  // KeyboardUtil key groups enrich the matching actions; they are not
  // actions themselves and get no entry of their own.
  const keyGroups = new Map();
  const kuFile = join(diagramRoot, 'lib/features/keyboard/KeyboardUtil.js');
  readLines(kuFile).forEach((l, i) => {
    const m = l.match(/export var (KEYS_\w+)\s*=\s*\[([^\]]*)\]/);
    if (m) {
      const values = [...m[2].matchAll(/'([^']+)'/g)].map((q) => q[1]);
      keyGroups.set(m[1].replace(/^KEYS_/, '').toLowerCase(), { name: m[1], values, line: i + 1 });
    }
  });
  for (const [action, lines] of listenerLines) {
    const base = lines.length > 1 ? `diagram-js default binding (${lines.length} listeners, lines ${lines.join(', ')})` : 'diagram-js default binding (guarded by editorActions.isRegistered)';
    const group = keyGroups.get(action);
    push(action, df, lines[0], group ? `${base}; ${group.name} = [${group.values.join(', ')}]` : base);
  }
  // Every registered editor action (bpmn-js _registerAction, diagram-js register).
  for (const f of [join(bpmnRoot, 'lib/features/editor-actions/BpmnEditorActions.js'), join(diagramRoot, 'lib/features/editor-actions/EditorActions.js')]) {
    readLines(f).forEach((l, i) => {
      for (const m of l.matchAll(/(?:_registerAction|register)\(\s*'([^']+)'/g)) push(m[1], f, i + 1, 'registered editor action');
    });
  }
  // Keys handled inside a feature without an editor action, found by
  // scanning isKey(...) (single and array forms) in the owning file.
  const sp = join(diagramRoot, 'lib/features/search-pad/SearchPad.js');
  readLines(sp).forEach((l, i) => {
    for (const m of l.matchAll(/isKey\(\s*'([^']+)'/g)) push(`searchPad:${m[1]}`, sp, i + 1, 'key handling without editor action (isKey)');
    for (const m of l.matchAll(/isKey\(\s*\[([^\]]*)\]/g)) {
      for (const q of m[1].matchAll(/'([^']+)'/g)) push(`searchPad:${q[1]}`, sp, i + 1, 'key handling without editor action (isKey)');
    }
  });
  const ht = join(diagramRoot, 'lib/features/hand-tool/HandTool.js');
  readLines(ht).forEach((l, i) => {
    for (const m of l.matchAll(/isKey\(\s*'([^']+)'/g)) push(`handTool:${m[1]}`, ht, i + 1, 'key handling without editor action (isKey)');
  });
  return items;
}

function extractEvents() {
  const found = new Map(); // name -> {sourceAbs, line}
  const add = (name, abs, line) => { if (name && !found.has(name)) found.set(name, { sourceAbs: abs, line }); };
  for (const root of [bpmnRoot, diagramRoot]) {
    for (const f of jsFiles(root)) {
      const lines = readLines(f);
      const codeText = lines.filter((l) => !l.trimStart().startsWith('*')).join('\n');
      // Per-file string constants, used to resolve identifier event names.
      const consts = new Map();
      for (const m of codeText.matchAll(/([A-Z][A-Z\d_]*)\s*=\s*'([^']+)'/g)) consts.set(m[1], m[2]);
      for (const [name, value] of consts) {
        if (name.includes('EVENT') && value.includes('.')) add(value, f, firstLineMatching(f, new RegExp(`'${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`)));
      }
      const constArrays = new Map();
      for (const m of codeText.matchAll(/(?:var|const|let)\s+([A-Z][A-Z\d_]*)\s*=\s*\[([\s\S]*?)\]/g)) {
        constArrays.set(m[1], [...m[2].matchAll(/'([^']+)'/g)].map((q) => q[1]));
      }
      // Prefix applied by this file's _emit/_fire helper, if it defines one:
      // fire(type) applies no prefix, fire('p.' + x) / fire(`p.${x}`) apply 'p.'.
      let emitPrefix = null;
      const def = codeText.match(/prototype\._(?:emit|fire)\s*=\s*function\s*\([^)]*\)\s*\{([\s\S]{0,400}?)\n\};/);
      if (def) {
        const tpl = def[1].match(/fire\(\s*`([^`$]*)\$\{/);
        const bin = def[1].match(/fire\(\s*'([^']*)'\s*\+/);
        emitPrefix = tpl ? tpl[1] : bin ? bin[1] : '';
      }
      lines.forEach((l, i) => {
        if (l.trimStart().startsWith('*')) return; // JSDoc examples are not behaviour
        for (const m of l.matchAll(/\.fire\(\s*'([^']+)'/g)) add(m[1], f, i + 1);
        for (const m of l.matchAll(/\.on\(\s*'([^']+)'/g)) add(m[1], f, i + 1);
        for (const m of l.matchAll(/\.once\(\s*'([^']+)'/g)) add(m[1], f, i + 1);
        for (const m of l.matchAll(/\.fire\(\s*`([^`$]*)\$\{/g)) { if (m[1].endsWith('.')) add(m[1], f, i + 1); }
        if (emitPrefix !== null) {
          for (const m of l.matchAll(/\._(?:emit|fire)\(\s*'([^']+)'/g)) add(`${emitPrefix}${m[1]}`, f, i + 1);
        }
        if (/\.(?:fire|on|once)\(/.test(l)) {
          for (const m of l.matchAll(/\b([A-Z][A-Z\d_]{2,})\b/g)) {
            if (consts.has(m[1])) add(consts.get(m[1]), f, i + 1);
            if (constArrays.has(m[1])) for (const v of constArrays.get(m[1])) add(v, f, i + 1);
          }
          for (const m of l.matchAll(/\b(CLOSE_EVENTS|[A-Z][A-Z\d_]*EVENTS?)\b/g)) {
            if (constArrays.has(m[1])) for (const v of constArrays.get(m[1])) add(v, f, i + 1);
          }
        }
        const onceId = l.match(/\.once\(\s*([A-Za-z_$][\w$]*)\s*[,)]/);
        if (onceId && constArrays.has(onceId[1])) for (const v of constArrays.get(onceId[1])) add(v, f, i + 1);
        const onId = l.match(/\.(?:on|once)\(\s*([A-Za-z_$][\w$]*)\s*[,)]/);
        if (onId && constArrays.has(onId[1])) for (const v of constArrays.get(onId[1])) add(v, f, i + 1);
      });
      // .on/.once([ 'a', 'b' ], ...) arrays may span lines: scan the joined code.
      for (const m of codeText.matchAll(/\.(?:on|once)\(\s*\[([\s\S]*?)\]/g)) {
        for (const q of m[1].matchAll(/'([^']+)'/g)) add(q[1], f, firstLineMatching(f, new RegExp(`'${q[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`)));
      }
    }
  }
  // InteractionEvents: DOM name -> EventBus name table values.
  const ie = join(diagramRoot, 'lib/features/interaction-events/InteractionEvents.js');
  readLines(ie).forEach((l, i) => {
    for (const m of l.matchAll(/:\s*'(element\.[\w.]+)'/g)) add(m[1], ie, i + 1);
  });
  // CommandStack lifecycle: _fire('changed') and _fire(command, 'qualifier').
  const cs = join(diagramRoot, 'lib/command/CommandStack.js');
  readLines(cs).forEach((l, i) => {
    if (/_fire\(\s*'changed'/.test(l)) add('commandStack.changed', cs, i + 1);
    for (const m of l.matchAll(/_fire\([^)]*?,\s*'([\w.]+)'/g)) add(`commandStack.${m[1]}`, cs, i + 1);
  });
  // Dragging helper: fire('type') -> drag.<type> (prefixed variants stay dynamic).
  const dg = join(diagramRoot, 'lib/features/dragging/Dragging.js');
  readLines(dg).forEach((l, i) => {
    for (const m of l.matchAll(/(^|[^\w.])fire\(\s*'([^']+)'/g)) {
      if (!m[2].endsWith('.')) add(`drag.${m[2]}`, dg, i + 1);
    }
  });
  return [...found.entries()]
    .map(([key, v]) => ({ key, ...v, detail: key.endsWith('.') ? 'dynamic prefix (concrete names built at runtime)' : 'EventBus event name', dynamicPrefix: key.endsWith('.') }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

function extractConfig() {
  const items = [];
  const seen = new Set();
  const push = (key, abs, line, detail) => { if (!seen.has(key)) { seen.add(key); items.push({ key, sourceAbs: abs, line, detail }); } };
  const bv = join(bpmnRoot, 'lib/BaseViewer.js');
  const bvLines = readLines(bv);
  // Viewer options: fields of the typedef block closed by the
  // `BaseViewerOptions` name, then any further `options.<prop>` read in
  // the viewer implementation.
  const typedefEnd = bvLines.findIndex((l) => /\}\s*&\s*Record<[^>]*>\s*\}\s*BaseViewerOptions/.test(l));
  if (typedefEnd >= 0) {
    let typedefStart = typedefEnd;
    while (typedefStart > 0 && !/@typedef/.test(bvLines[typedefStart])) typedefStart--;
    for (let i = typedefStart; i < typedefEnd; i++) {
      const m = bvLines[i].match(/^\s*\*\s+([A-Za-z][\w]*)\??:/);
      if (m) push(`viewer.${m[1]}`, bv, i + 1, 'BaseViewerOptions field');
    }
  }
  bvLines.forEach((l, i) => {
    const c = l.match(/options\.(\w+)/);
    if (c) push(`viewer.${c[1]}`, bv, i + 1, 'options read in BaseViewer');
  });
  const dg = join(diagramRoot, 'lib/Diagram.js');
  readLines(dg).forEach((l, i) => {
    if (/modules\?:/.test(l)) push('diagram.modules', dg, i + 1, 'DiagramOptions field');
  });
  // Per-feature config reads, qualified by the didi injection of the same
  // file: a service injected as 'config.<feature>' receives that sub-object
  // as its local `config` parameter, so `config.<prop>` in that file means
  // `config.<feature>.<prop>`. Files without a 'config.*' injection have no
  // DI config (Text layout defaults, per-tooltip add() options) and are
  // skipped. Bare `config` reads inside a method that declares its own
  // non-forwarded `config` parameter (a menu/container descriptor) do not
  // read DI config and are skipped; `this._config` always does.
  // JSDoc lines are skipped: they document options, they do not read them.
  for (const root of [bpmnRoot, diagramRoot]) {
    for (const f of jsFiles(root)) {
      const lines = readLines(f);
      let feature = null;
      let featureLine = 1;
      for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(/'config\.([A-Za-z][\w]*)'/);
        if (m) { feature = m[1]; featureLine = i + 1; break; }
      }
      if (!feature) continue;
      const prefix = `config.${feature}`;
      push(prefix, f, featureLine, 'didi config injection');
      const forwarded = new Set();
      for (const l of lines) {
        for (const m of l.matchAll(/this\.(\w+)\(\s*config\b/g)) forwarded.add(m[1]);
      }
      let bareIsDi = true;
      lines.forEach((l, i) => {
        if (l.trimStart().startsWith('*')) return;
        const ctor = l.match(/export default function\s*\w*\s*\(([^)]*)\)/);
        const proto = l.match(/prototype\.(\w+)\s*=\s*function\s*\(([^)]*)\)/);
        const own = l.match(/this\.(\w+)\s*=\s*function\s*\(([^)]*)\)/);
        const plain = !ctor && !proto && !own ? l.match(/function\s*\w*\s*\(([^)]*)\)/) : null;
        if (ctor) bareIsDi = true;
        else if (proto) {
          const ownsConfig = proto[2].split(',').map((s) => s.trim()).includes('config');
          bareIsDi = !ownsConfig || forwarded.has(proto[1]);
        } else if (own) {
          const ownsConfig = own[2].split(',').map((s) => s.trim()).includes('config');
          bareIsDi = !ownsConfig || forwarded.has(own[1]);
        } else if (plain) {
          const ownsConfig = plain[1].split(',').map((s) => s.trim()).includes('config');
          if (ownsConfig) bareIsDi = false;
        }
        if (bareIsDi) {
          for (const m of l.matchAll(/(?:^|[^\w])config\.(\w+)/g)) {
            if (m[1] !== feature) push(`${prefix}.${m[1]}`, f, i + 1, 'feature config read');
          }
        }
        for (const m of l.matchAll(/_config\.(\w+)/g)) push(`${prefix}.${m[1]}`, f, i + 1, 'feature config read');
      });
      const joined = lines.join('\n');
      for (const m of joined.matchAll(/_config\[\s*([\s\S]{0,160}?)\]/g)) {
        for (const q of m[1].matchAll(/'(\w+)'/g)) {
          const line = joined.slice(0, m.index).split('\n').length;
          push(`${prefix}.${q[1]}`, f, line, 'feature config read');
        }
      }
    }
  }
  return items.sort((a, b) => a.key.localeCompare(b.key));
}

function extractRenderer() {
  const f = join(bpmnRoot, 'lib/draw/BpmnRenderer.js');
  const items = [];
  const blocks = [
    [/var handlers = this\.handlers = \{/, 'BpmnRenderer handler (shape/connection drawing)'],
    [/var eventIconRenderers = \{/, 'BpmnRenderer event icon renderer'],
    [/var taskMarkerRenderers = \{/, 'BpmnRenderer task marker renderer'],
  ];
  for (const [startRe, detail] of blocks) {
    let inBlock = false;
    readLines(f).forEach((l, i) => {
      if (startRe.test(l)) { inBlock = true; return; }
      if (inBlock && /^\s{2}\};/.test(l)) { inBlock = false; return; }
      if (inBlock) {
        const m = l.match(/^\s{4}'([\w:.-]+)'\s*:/);
        if (m && !items.some((x) => x.key === m[1])) items.push({ key: m[1], sourceAbs: f, line: i + 1, detail });
      }
    });
  }
  return items;
}

function extractModdleTypes() {
  const files = [
    ['bpmn', join(moddleRoot, 'resources/bpmn/json/bpmn.json')],
    ['bpmndi', join(moddleRoot, 'resources/bpmn/json/bpmndi.json')],
    ['di', join(moddleRoot, 'resources/bpmn/json/di.json')],
    ['dc', join(moddleRoot, 'resources/bpmn/json/dc.json')],
    ['bioc', join(moddleRoot, 'resources/bpmn-io/json/bioc.json')],
  ];
  const items = [];
  for (const [prefix, abs] of files) {
    const doc = JSON.parse(readFileSync(abs, 'utf8'));
    const text = readFileSync(abs, 'utf8').split(/\r?\n/);
    const lineOfName = (name) => {
      for (let i = 0; i < text.length; i++) if (text[i].includes(`"name": "${name}"`)) return i + 1;
      return 1;
    };
    for (const t of doc.types || []) {
      const key = `${prefix}:${t.name}`;
      const extendsPart = (t.extends || []).length ? `; extends: ${(t.extends || []).join(', ')}` : '';
      items.push({
        key, sourceAbs: abs, line: lineOfName(t.name),
        detail: `${t.isAbstract ? 'abstract' : 'concrete'}; superClass: ${(t.superClass || []).join(', ') || 'none'}${extendsPart}; own properties: ${(t.properties || []).length}`,
        abstract: !!t.isAbstract,
      });
    }
    for (const e of doc.enumerations || []) {
      const key = `${prefix}:${e.name}`;
      const rawValues = e.literalValues || e.values || [];
      const values = rawValues.map((v) => (typeof v === 'string' ? v : v && v.name)).filter(Boolean);
      items.push({
        key, sourceAbs: abs, line: lineOfName(e.name),
        detail: `enumeration; values: ${values.join(', ')}`,
        enumeration: true,
      });
    }
  }
  return items;
}

function extractApi() {
  // Resolve a didi registration's implementation file from its import
  // specifier (relative, `bpmn-js/lib/...` or `diagram-js/lib/...`).
  const resolveImpl = (spec, fromFile) => {
    let abs;
    if (spec.startsWith('diagram-js/lib/')) abs = join(diagramRoot, 'lib', spec.slice('diagram-js/lib/'.length));
    else if (spec.startsWith('bpmn-js/lib/')) abs = join(bpmnRoot, 'lib', spec.slice('bpmn-js/lib/'.length));
    else abs = resolve(dirname(fromFile), spec);
    for (const candidate of [abs, `${abs}.js`, join(abs, 'index.js')]) {
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
    return null;
  };
  const classes = new Map(); // "label:Class" -> { label, cls, abs }
  const noteClass = (label, cls, abs) => {
    if (cls && abs) classes.set(`${label}:${cls}`, { label, cls, abs });
  };
  for (const [label, root] of [['bpmn-js', bpmnRoot], ['diagram-js', diagramRoot]]) {
    const libDir = join(root, 'lib');
    // Entry classes: implementation files directly under lib/.
    for (const name of readdirSync(libDir).sort()) {
      if (!name.endsWith('.js') || name === 'index.js') continue;
      const abs = join(libDir, name);
      readLines(abs).forEach((l) => {
        const m = l.match(/^([A-Za-z_$][\w$]*)\.prototype\.[A-Za-z]/);
        if (m) noteClass(label, m[1], abs);
      });
    }
    // Service classes: every `name: [ 'type', Impl ]` registration.
    for (const idx of walk(libDir, (p) => p.endsWith('index.js'))) {
      const text = readFileSync(idx, 'utf8');
      const imports = new Map();
      for (const m of text.matchAll(/import\s+([A-Za-z_$][\w$]*)\s+from\s+'([^']+)'/g)) {
        imports.set(m[1], resolveImpl(m[2], idx));
      }
      for (const m of text.matchAll(/[A-Za-z][\w]*\s*:\s*\[\s*'type',\s*([A-Za-z_$][\w$]*)\s*\]/g)) {
        noteClass(label, m[1], imports.get(m[1]));
      }
    }
  }
  const items = [];
  const seen = new Set();
  for (const { label, cls, abs } of classes.values()) {
    const lines = readLines(abs);
    const localFns = new Set();
    for (const l of lines) {
      const fm = l.match(/function\s+([A-Za-z_$][\w$]*)\s*\(/);
      if (fm) localFns.add(fm[1]);
    }
    const pushMethod = (method, line) => {
      if (!method || method.startsWith('_')) return;
      const key = `${label}:${cls}.${method}`;
      if (seen.has(key)) return;
      seen.add(key);
      items.push({ key, sourceAbs: abs, line, detail: `public method of ${cls}` });
    };
    lines.forEach((l, i) => {
      const pm = l.match(new RegExp(`^${cls}\\.prototype\\.([A-Za-z]\\w*)\\s*=`));
      if (pm) pushMethod(pm[1], i + 1);
      const tm = l.match(/^\s*this\.([A-Za-z]\w*)\s*=\s*(.+?);?\s*$/);
      if (tm) {
        const rhs = tm[2].trim();
        if (rhs.startsWith('function') || localFns.has(rhs.replace(/;$/, ''))) pushMethod(tm[1], i + 1);
      }
    });
  }
  return items.sort((a, b) => a.key.localeCompare(b.key));
}

function extractExamples() {
  const items = [];
  for (const name of readdirSync(examplesRoot).sort()) {
    const dir = join(examplesRoot, name);
    if (!statSync(dir).isDirectory()) continue;
    const readme = join(dir, 'README.md');
    if (!existsSync(readme)) continue;
    // An example is a directory whose README carries a markdown heading;
    // upstream tombstones (README only, removal note) have none.
    const heading = readFileSync(readme, 'utf8').match(/^#\s+.+$/m);
    if (!heading) continue;
    items.push({ key: name, sourceAbs: readme, line: 1, detail: heading[0].trim().slice(0, 120) });
  }
  return items;
}

export function extractAll() {
  return {
    module: extractModules(),
    command: extractCommands(),
    rule: extractRules(),
    palette: extractPalette(),
    'context-pad': extractContextPad(),
    'replace-menu': extractReplaceMenu(),
    'popup-menu': extractPopupMenu(),
    keyboard: extractKeyboard(),
    event: extractEvents(),
    config: extractConfig(),
    renderer: extractRenderer(),
    'moddle-type': extractModdleTypes(),
    api: extractApi(),
    example: extractExamples(),
  };
}

// ------------------------------------------------------- coverage mapping
// Targets: graph | diagram-core | diagram-canvas | ds-component | new-module
// Priority: P0 (blocking parity), P1 (editing parity), P2 (polish/extension).
const COMMAND_MAP = {
  'shape.create': ['partial', 'diagram-core', 'P0'],
  'shape.delete': ['partial', 'diagram-core', 'P0'],
  'shape.move': ['partial', 'diagram-core', 'P0'],
  'shape.resize': ['partial', 'diagram-core', 'P0'],
  'shape.replace': ['missing', 'diagram-core', 'P1'],
  'shape.append': ['missing', 'diagram-core', 'P1'],
  'shape.toggleCollapse': ['partial', 'diagram-core', 'P1'],
  'connection.create': ['partial', 'diagram-core', 'P0'],
  'connection.delete': ['partial', 'diagram-core', 'P0'],
  'connection.move': ['partial', 'diagram-core', 'P1'],
  'connection.layout': ['partial', 'graph', 'P1'],
  'connection.updateWaypoints': ['partial', 'diagram-core', 'P1'],
  'connection.reconnect': ['missing', 'diagram-core', 'P1'],
  'elements.create': ['partial', 'diagram-core', 'P0'],
  'elements.move': ['partial', 'diagram-core', 'P0'],
  'elements.delete': ['partial', 'diagram-core', 'P0'],
  'elements.distribute': ['missing', 'diagram-canvas', 'P2'],
  'elements.align': ['missing', 'diagram-canvas', 'P2'],
  'element.updateAttachment': ['missing', 'diagram-core', 'P1'],
  'label.create': ['missing', 'diagram-core', 'P1'],
  'spaceTool': ['missing', 'diagram-canvas', 'P2'],
};
function coverageFor(family, key, item) {
  switch (family) {
    case 'module': {
      if (/modeling/.test(key)) return { status: 'partial', target: 'diagram-core', priority: 'P0', proof: PROOF.commands() };
      if (/canvas|core\/|draw|navigation|interaction-events|selection|overlays/.test(key)) return { status: 'partial', target: 'diagram-canvas', priority: 'P1', proof: PROOF.scene() };
      if (/palette|context-pad|popup-menu|replace|keyboard|search|copy-paste|editor-actions|space-tool|lasso|hand-tool|connect|create|move|resize|bendpoints|snapping|grid|align|distribute|label|drilldown|outline|rules|auto-/.test(key)) return { status: 'missing', target: 'new-module', priority: 'P1', proof: PROOF.canvasReadmeGap() };
      return { status: 'missing', target: 'new-module', priority: 'P2', proof: PROOF.coreReadmeGap() };
    }
    case 'command': {
      const m = COMMAND_MAP[key];
      if (m) return { status: m[0], target: m[1], priority: m[2], proof: PROOF.commands() };
      if (key.startsWith('lane.') || key.startsWith('element.update') || key.startsWith('canvas.updateRoot') || key.startsWith('group.') || key.startsWith('id.')) return { status: 'missing', target: 'diagram-core', priority: 'P1', proof: PROOF.skeleton() };
      if (key === 'element.setColor') return { status: 'missing', target: 'diagram-core', priority: 'P2', proof: PROOF.skeletonNotes() };
      return { status: 'missing', target: 'diagram-core', priority: 'P1', proof: PROOF.commands() };
    }
    case 'rule':
      if (key === 'elements.move' || key === 'elements.create') return { status: 'partial', target: 'diagram-core', priority: 'P0', proof: PROOF.commands() };
      return { status: 'missing', target: 'diagram-core', priority: key.startsWith('connection') || key.startsWith('shape') ? 'P0' : 'P1', proof: PROOF.skeletonNotes() };
    case 'palette':
      return { status: 'missing', target: 'ds-component', priority: 'P1', proof: PROOF.canvasReadmeGap() };
    case 'context-pad':
      return { status: 'missing', target: 'ds-component', priority: 'P1', proof: PROOF.canvasReadmeGap() };
    case 'replace-menu':
      return { status: 'missing', target: 'ds-component', priority: 'P1', proof: PROOF.skeleton() };
    case 'popup-menu':
      return { status: 'missing', target: 'ds-component', priority: 'P1', proof: PROOF.canvasReadmeGap() };
    case 'keyboard':
      return { status: 'missing', target: 'diagram-canvas', priority: 'P1', proof: PROOF.canvasReadmeGap() };
    case 'event':
      if (key.startsWith('commandStack') || key === 'elements.changed' || key === 'element.changed') return { status: 'partial', target: 'diagram-core', priority: 'P1', proof: PROOF.commands() };
      if (key.startsWith('canvas.') || key === 'diagram.init') return { status: 'partial', target: 'diagram-canvas', priority: 'P1', proof: PROOF.transform() };
      return { status: 'missing', target: 'new-module', priority: 'P2', proof: PROOF.canvasReadmeGap() };
    case 'config':
      return { status: 'missing', target: 'new-module', priority: 'P1', proof: PROOF.coreReadmeGap() };
    case 'renderer':
      if (key === 'bpmn:SequenceFlow' || key === 'bpmn:MessageFlow' || key === 'bpmn:Association' || key.endsWith('Association')) return { status: 'partial', target: 'graph', priority: 'P0', proof: PROOF.graphRenderer() };
      return { status: 'missing', target: 'graph', priority: 'P0', proof: PROOF.graphShapes() };
    case 'moddle-type': {
      if (item && item.enumeration) return { status: 'missing', target: 'diagram-core', priority: key.startsWith('bpmn:') && !key.startsWith('bpmndi:') ? 'P0' : 'P1', proof: PROOF.skeleton() };
      const skeletonTypes = new Set(['bpmn:Process', 'bpmn:Participant', 'bpmn:Lane', 'bpmn:Task', 'bpmn:SubProcess', 'bpmn:SequenceFlow']);
      if (skeletonTypes.has(key)) return { status: 'partial', target: 'diagram-core', priority: 'P0', proof: PROOF.skeleton() };
      // Labels, fonts and styles are explicitly not in diagram-canvas today
      // (scene header: labels need text measurement), so no partial credit.
      const labelStyleTypes = new Set(['dc:Font', 'bpmndi:BPMNLabel', 'bpmndi:BPMNLabelStyle', 'di:Label', 'di:LabeledEdge', 'di:LabeledShape', 'di:Style', 'di:Extension']);
      if (labelStyleTypes.has(key)) return { status: 'missing', target: 'diagram-core', priority: 'P1', proof: PROOF.canvasReadmeGap() };
      if (key.startsWith('bpmndi:') || key.startsWith('dc:') || key.startsWith('di:')) return { status: 'partial', target: 'diagram-core', priority: 'P1', proof: PROOF.scene() };
      if (key.startsWith('bioc:') || key.startsWith('color:')) return { status: 'missing', target: 'diagram-core', priority: 'P2', proof: PROOF.skeletonNotes() };
      return { status: 'missing', target: 'diagram-core', priority: 'P0', proof: PROOF.skeleton() };
    }
    case 'api':
      if (/Canvas\.(viewbox|scrollToElement|scroll|zoom)/.test(key)) return { status: 'partial', target: 'diagram-canvas', priority: 'P1', proof: PROOF.transform() };
      if (/Canvas\.(getRootElements?|addShape|addConnection|removeShape|removeConnection)/.test(key)) return { status: 'partial', target: 'diagram-canvas', priority: 'P1', proof: PROOF.scene() };
      if (/Modeling\./.test(key)) return { status: 'missing', target: 'diagram-core', priority: 'P0', proof: PROOF.commands() };
      if (/CommandStack\.(execute|undo|redo|canUndo|canRedo)/.test(key)) return { status: 'partial', target: 'diagram-core', priority: 'P1', proof: PROOF.commands() };
      if (/Selection\.|Overlays\./.test(key)) return { status: 'missing', target: 'diagram-canvas', priority: 'P1', proof: PROOF.canvasReadmeGap() };
      if (/BaseViewer\.(importXML|saveXML|saveSVG|importDefinitions|open)/.test(key)) return { status: 'missing', target: 'new-module', priority: 'P0', proof: PROOF.coreReadmeGap() };
      return { status: 'missing', target: 'new-module', priority: 'P1', proof: PROOF.coreReadmeGap() };
    case 'example':
      return { status: 'missing', target: 'new-module', priority: 'P2', proof: PROOF.coreReadmeGap() };
    default:
      return { status: 'missing', target: 'new-module', priority: 'P2', proof: PROOF.coreReadmeGap() };
  }
}

const BEHAVIOUR = {
  module: (k, d) => `DI module \`${k}\` composed via didi (__init__/__depends__); ${d}. Observable effect: its services exist in the injector and its initialisers run at bootstrap.`,
  command: (k) => (k === 'element.setColor'
    ? 'Command `element.setColor` executed through CommandStack.execute with undo/redo; SetColorHandler postExecute writes background-color/border-color, the legacy bioc stroke/fill aliases and BPMNLabel color on the DI element.'
    : `Command \`${k}\` executed through CommandStack.execute with undo/redo (execute/revert); observers see commandStack.* events and a dirty model.`),
  rule: (k) => `Rule \`${k}\`: canExecute gate consulted before the matching modeling operation; returns boolean or a typed result object, and forbids/permits the interaction.`,
  palette: (k) => (k === 'tool-separator'
    ? 'Palette entry `tool-separator`: visual separator between palette groups (separator: true); it has no action, creates nothing and activates no tool.'
    : `Palette entry \`${k}\`: drag or click starts element creation (create.start) with the entry's BPMN type, or activates the named tool.`),
  'context-pad': (k) => `Context-pad entry \`${k}\`: shown for the selected element(s); click triggers append/connect/replace/delete or lane actions on that element.`,
  'replace-menu': (k) => `Replace option \`${k}\`: offered by ReplaceMenuProvider for matching elements; activation morphs the selected element in place via BpmnReplace.replaceElement, retaining connections where the rule matrix allows.`,
  'popup-menu': (k, d) => `Popup-menu item \`${k}\` (${d}): a provider registration, header entry or menu entry supplied for its target; opening is gated by popupMenu.open.allowed.`,
  keyboard: (k, d) => (k.startsWith('searchPad:')
    ? `Search-pad key \`${k}\` (${d}): handled inside the open search pad (navigate, select or close); it triggers no editor action.`
    : k.startsWith('handTool:')
      ? `Hand-tool hold key \`${k}\` (${d}): holding the key temporarily activates the hand tool on keyboard.keydown and releases it on keyboard.keyup; it triggers no editor action.`
      : `Keyboard binding \`${k}\` (${d}): key press triggers the editor action of the same name when registered.`),
  event: (k) => `EventBus event \`${k}\`: emitted/listened across modules; listeners receive the payload described at the source site.`,
  config: (k) => `Configuration \`${k}\`: public option read at construction; changes bootstrap wiring, canvas or feature behaviour.`,
  renderer: (k, d) => `Renderer entry \`${k}\` (${d}): draws the BPMN shape/connection/icon/marker (geometry, markers, icons, label placement) into the SVG graphics element.`,
  'moddle-type': (k, d) => (String(d).startsWith('enumeration')
    ? `Moddle enumeration \`${k}\` (${d}): the closed value set constraining the BPMN attributes that reference it.`
    : `Moddle type \`${k}\` (${d}): instantiable/abstract BPMN metamodel type carried by Definitions and DI.`),
  api: (k) => `Public API \`${k}\`: callable on the viewer/modeler/canvas instance; see the JSDoc at the source for arguments and result.`,
  example: (k, d) => `Example scenario \`${k}\`: ${d || 'standalone demo'}; used here as an acceptance scenario, not as shipped behaviour.`,
};
const ACCEPTANCE = {
  module: (k) => `Differential: bootstrap both stacks with the equivalent module set; assert the service/behaviour named by ${k} is reachable and initialised.`,
  command: (k) => `Differential: run ${k} on the same fixture in bpmn-js and in the target; compare resulting moddle JSON (F1), DI geometry and emitted commandStack events; then undo and compare again.`,
  rule: (k) => `Differential: probe ${k} with allowed and forbidden source/target pairs from the BPMN matrix; compare boolean/typed verdicts.`,
  palette: (k) => (k === 'tool-separator'
    ? 'Differential: render the palette; assert tool-separator appears as a non-interactive divider between the tools and creation groups and that activating it creates nothing.'
    : `Differential: activate palette entry ${k} (drag + click paths); compare created element type, parent and DI bounds.`),
  'context-pad': (k) => `Differential: select each applicable element type, open the context pad, activate ${k}; compare resulting model + DI.`,
  'replace-menu': (k) => `Differential: replace/append to variant ${k} from each source type that offers it; compare new type, retained connections, label and DI.`,
  'popup-menu': (k, d) => (String(d).includes('provider id')
    ? `Differential: open provider ${k} on representative targets; compare entry ids, order, disabled state and header entries.`
    : String(d).includes('header entry')
      ? `Differential: open the owning popup menu and toggle header entry ${k}; compare the toggled model attribute and the refreshed entry state.`
      : `Differential: open the owning popup menu on a multi-element selection and activate entry ${k}; compare alignment/distribution geometry and model state.`),
  keyboard: (k) => (k.startsWith('searchPad:')
    ? `Differential: open the search pad, dispatch ${k}; compare navigation/selection/close behaviour and focus.`
    : k.startsWith('handTool:')
      ? `Differential: hold and release the key for ${k}; compare temporary hand-tool activation on keydown and release on keyup.`
      : `Differential: dispatch the key chord for ${k} with/without modifiers and with a text input focused; compare triggered action and focus behaviour.`),
  event: (k) => `Differential: run the scripted interaction that emits ${k}; compare event name, payload keys and ordering against the reference log.`,
  config: (k) => `Differential: construct with ${k} set/unset; compare bootstrap, rendering and interaction deltas.`,
  renderer: (k) => `Differential: render a fixture containing ${k} at fixed viewport/DPR; compare geometry (bounds, waypoints, marker/icon presence) and, secondarily, pixels within tolerance.`,
  'moddle-type': (k) => `Bijection: moddle JSON (F1) containing ${k} round-trips through diagram-core without loss; descriptor coverage test names this type.`,
  api: (k) => `Differential: call ${k} with the documented arguments on the same fixture; compare return value, model state and events.`,
  example: (k) => `Scenario: replay example ${k} steps against the target implementation; compare the observable end state.`,
};

function buildInventory(raw) {
  const entries = [];
  for (const [family, items] of Object.entries(raw)) {
    for (const it of items) {
      const cov = coverageFor(family, it.key, it);
      entries.push({
        id: `RE.${family}.${slug(it.key)}`,
        family,
        key: it.key,
        source: { path: rel(it.sourceAbs), line: it.line },
        behaviour: BEHAVIOUR[family](it.key, it.detail),
        acceptance: ACCEPTANCE[family](it.key, it.detail),
        target: cov.target,
        status: cov.status,
        proof: cov.proof,
        priority: cov.priority,
        ...(it.dynamicPrefix ? { dynamicPrefix: true } : {}),
        ...(it.abstract !== undefined ? { abstract: it.abstract } : {}),
        ...(it.enumeration ? { enumeration: true } : {}),
        detail: it.detail,
      });
    }
  }
  // Stable order: family (extraction order), then key.
  const famOrder = Object.keys(raw);
  entries.sort((a, b) => famOrder.indexOf(a.family) - famOrder.indexOf(b.family) || a.key.localeCompare(b.key));
  // De-duplicate ids (defensive: keys are unique per family by construction).
  const seen = new Set();
  for (const e of entries) {
    if (seen.has(e.id)) throw new Error(`duplicate inventory id ${e.id}`);
    seen.add(e.id);
  }
  return entries;
}

function summarise(entries) {
  const by = (fn) => {
    const m = {};
    for (const e of entries) { const k = fn(e); m[k] = (m[k] || 0) + 1; }
    return m;
  };
  return {
    total: entries.length,
    byFamily: by((e) => e.family),
    byStatus: by((e) => e.status),
    byTarget: by((e) => e.target),
    byPriority: by((e) => e.priority),
  };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const raw = extractAll();
  const entries = buildInventory(raw);
  const inventory = {
    meta: {
      generatedAt: GENERATED_AT,
      generator: 'tools/re-bpmn-js/enumerate.mjs',
      versions: VERSIONS,
      sourcesRoot: '.ds-scrap/re-sources (repo root, read-only; see MANIFEST.md)',
      worktree: '.re-bpmnjs-wt (branch spec/re-bpmnjs-parity)',
      countingConventions: 'See the header of tools/re-bpmn-js/enumerate.mjs and SPEC_RE_BPMN_JS_PARITY.md section 3. Counts are distinct keys per family under those conventions.',
      sourceGaps: [
        'color package (3 types per the A-prime spec) has no JSON descriptor in this checkout: bpmn-moddle/lib/simple.js imports bpmn-in-color-moddle, whose files are absent (no node_modules, no dist). Not counted in moddle-type; recorded here as missing source.',
        'Dynamic EventBus names ending in a dot (commandStack., drag., keyboard.) are single entries flagged dynamicPrefix; concrete suffixed names are runtime-built and not enumerable statically.',
        'Three bpmn-js-examples directories (custom-bower-bundle, simple-bower, simple-commonjs) are upstream tombstones whose README only records their removal as of bpmn-js 0.27.0; they carry no behaviour and are excluded from the example family.',
      ],
      licenceNote: 'Behavioural reimplementation only (clean room). No third-party code is copied; see the spec licence section.',
    },
    summary: summarise(entries),
    entries,
  };
  const out = join(wtRoot, 'docs', 're', 'bpmn-js-inventory.json');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(inventory, null, 2) + '\n');
  console.log(`wrote ${relative(wtRoot, out)} entries=${entries.length}`);
  console.log(JSON.stringify(inventory.summary, null, 2));
}
