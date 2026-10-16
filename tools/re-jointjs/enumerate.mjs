#!/usr/bin/env node
/**
 * enumerate.mjs — mechanical enumeration of the JointJS (@joint/core 4.3.3)
 * observable surface, for the renderer-independent parity spec
 * (spec/SPEC_RE_JOINTJS_PARITY.md).
 *
 * No network, no dependencies. Reads the pinned sources under
 * `.ds-scrap/re-sources/joint` (repo root, read-only), the existing
 * 186-application catalogue (`docs/graph-dataviz-reference-catalog.json`,
 * this worktree) and our stack (`packages/graph`, `packages/diagram-core`,
 * `packages/diagram-canvas` in this worktree), and writes
 * `docs/re/jointjs-inventory.json`.
 *
 * Counting conventions (the independent AST guard in extract-ast.mjs
 * re-derives exactly these with separate code; see COUNTING_CONVENTIONS):
 * - dia-api: one entry per distinct public/protected member name (method,
 *   property or constructor; overloads collapsed; `private` and
 *   underscore-prefixed internal members excluded) of every `export class`
 *   in `types/dia.d.ts`, via the TypeScript AST (generic methods and
 *   required properties included). Inherited members are counted on the
 *   class that declares them only.
 * - paper-option: one entry per declared field of `dia.Paper.Options`
 *   (`types/dia.d.ts`); fields inherited from `mvc.ViewOptions` are noted,
 *   not counted here (they belong to the mvc family).
 * - event: one entry per distinct event name in the union of (a) keys of
 *   `dia.Paper.EventMap`, (b) `trigger('…')` literals in `src/**`, and
 *   (c) dynamic patterns built as `'change:' + …` or `eventPrefix + '…'`
 *   (kept as pattern names such as `change:<attribute>`, flagged dynamic).
 * - router / connector: keys of `RouterArgumentsMap` / `ConnectorArgumentsMap`
 *   in the corresponding `types/*.d.ts`.
 * - anchor: `export const` names in `src/anchors/index.mjs` (12);
 *   link-anchor: exported names in `src/linkAnchors/index.mjs` (4). The two
 *   families are disjoint; together they cover `AnchorArgumentsMap` (16).
 * - connection-point / connection-strategy: `export const` names in the
 *   corresponding `src/…/index.mjs`.
 * - highlighter: `export const` names in `src/highlighters/*.mjs`.
 * - link-tool / element-tool: top-level `export class` names in
 *   `types/linkTools.d.ts` / `types/elementTools.d.ts` (same short names in
 *   the two families are distinct tools bound to LinkView / ElementView).
 * - shape: `export class` names in `types/shapes-standard.d.ts` (standard.*).
 * - layout-port / layout-port-label: `export var` names under the `Port` /
 *   `PortLabel` namespaces of `types/layout.d.ts`.
 * - geometry: distinct declared member names per `export class` in
 *   `types/geometry.d.ts`, plus standalone `export function`s, plus members
 *   of the `bezier` / `scale` / `intersection` namespaces.
 * - vectorizer: distinct member names of `VElement` plus the `VStatic`
 *   interface members in `types/vectorizer.d.ts` (prefix `V.`).
 * - util: `export function` / `export var` names in `types/util.d.ts`,
 *   including members of the `timing` / `interpolate` / `filter` / `format`
 *   namespaces (prefix `<namespace>.`).
 * - mvc: distinct declared member names per `export class` in
 *   `types/mvc.d.ts`, plus the `Data` and `$` exports of `src/mvc/index.mjs`
 *   which have no class body in the type surface.
 * - presentation-attribute: top-level keys (4-space `'name': {`) of the
 *   attribute namespaces merged in `src/dia/attributes/*.mjs`, plus the
 *   `props` shorthand of `src/dia/attributes/index.mjs`.
 * - core-config: keys of `src/config/index.mjs`, plus `env.addTest`,
 *   `env.test`, `setTheme` and `version`.
 * - alg: the exported `rightAnglePath` function of `types/alg.d.ts`
 *   (flagged `@internal` upstream; counted because it is in the shipped
 *   type surface and `@joint/router-avoid` consumes it).
 * - package: one entry per directory of `packages/*` in the monorepo
 *   carrying a `package.json` (11 packages).
 * - package-api: entry-point exports only — `DirectedGraph.*` functions,
 *   MSAGL `layout` + enums, router-avoid initialisers, `export *`-resolved
 *   classes of shapes-general / shapes-general-tools, exported names of
 *   `@joint/react`'s `src/index.ts`, decorator factories of
 *   `@joint/decorators`, CLI commands (`src/commands/*.ts`), ESLint config
 *   names and the SVG-mock plugin. `@joint/core` itself is covered by the
 *   families above, never by this one.
 * - catalog-app: one entry per row of `jointjs_apps_and_recipes` in the
 *   existing catalogue (186), with the Open source / JointJS+ distinction
 *   carried from `source_license_marker`.
 *
 * Every raw item receives exactly one inventory entry. The guard
 * (`verify.mjs` + `extract-ast.mjs`) does NOT reuse this extraction: it
 * re-derives the expected set with a separate TypeScript-AST extractor
 * (ts.createProgram) and fails on any one-sided difference. Behaviour
 * text states the observable contract (signature, defaults, rounding);
 * no third-party implementation code is reproduced (clean-room rule).
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

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
const jointRoot = join(sourcesRoot, 'joint');
const coreRoot = join(jointRoot, 'packages', 'joint-core');
const cataloguePath = join(wtRoot, 'docs', 'graph-dataviz-reference-catalog.json');
const GENERATED_AT = '2026-10-15';
export const JOINT_VERSION = '4.3.3';
export const JOINT_COMMIT = 'e0ee1a6a1b842df12eb6d1815a3099193a76588a';

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
function repoRel(abs) {
  const repoRoot = resolve(wtRoot, '..');
  return relative(repoRoot, abs).split('\\').join('/');
}
function wtRel(abs) {
  return relative(wtRoot, abs).split('\\').join('/');
}
function slug(key) {
  return key.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x';
}
function braceDelta(line) {
  let d = 0;
  for (const ch of line) {
    if (ch === '{') d++;
    else if (ch === '}') d--;
  }
  return d;
}

// ------------------------------------------------------- our-stack index
const ourRoots = [
  join(wtRoot, 'packages', 'diagram-core', 'src'),
  join(wtRoot, 'packages', 'diagram-canvas', 'src'),
  join(wtRoot, 'packages', 'graph', 'src'),
];
const ourFiles = [];
for (const root of ourRoots) {
  for (const f of walk(root, (p) => p.endsWith('.ts'))) {
    ourFiles.push({ abs: f, rel: wtRel(f), lines: readLines(f) });
  }
}
function findOur(needle) {
  for (const f of ourFiles) {
    for (let i = 0; i < f.lines.length; i++) {
      if (f.lines[i].includes(needle)) return { path: f.rel, line: i + 1 };
    }
  }
  return null;
}
function proofInFile(relFile, needle, note) {
  const abs = join(wtRoot, relFile);
  if (existsSync(abs)) {
    const lines = readLines(abs);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(needle)) return { path: relFile, line: i + 1, note };
    }
    return { path: relFile, line: 1, note };
  }
  return { path: relFile, line: 1, note };
}
const GAP_PROOF = {
  'diagram-core': () => proofInFile('packages/diagram-core/README.md', '## What is not covered yet',
    'No analogue in diagram-core; the README section at this line lists the uncovered areas.'),
  'diagram-canvas': () => proofInFile('packages/diagram-canvas/README.md', '## What is not covered yet',
    'No analogue in diagram-canvas; the README section at this line lists the uncovered areas.'),
  graph: () => proofInFile('packages/graph/FEATURES.md', '## Deferred',
    'No analogue in @sentropic/graph; FEATURES.md lists the deferred capabilities at this line.'),
  'new-module': () => proofInFile('packages/graph/FEATURES.md', '## Deferred',
    'No module owns this on our stack yet; a new module is required (see the spec).'),
  'ds-component': () => proofInFile('packages/graph/FEATURES.md', '## Deferred',
    'No DS component owns this yet; FEATURES.md lists the deferred capabilities at this line.'),
};
function gapProof(target) {
  return (GAP_PROOF[target] || GAP_PROOF.graph)();
}
function foundProof(needle, note) {
  const hit = findOur(needle);
  if (hit) return { path: hit.path, line: hit.line, note };
  return null;
}

// ------------------------------------------------- .d.ts AST parsing (TypeScript compiler API)
// Primary extractor uses ts.createSourceFile. The independent guard in
// extract-ast.mjs uses ts.createProgram + TypeChecker with separate code;
// the two share only the TypeScript library and the counting conventions.
function loadSourceFile(abs) {
  const text = readFileSync(abs, 'utf8');
  const kind = abs.endsWith('.mts') || abs.endsWith('.ts') || abs.endsWith('.tsx') || abs.endsWith('.d.ts')
    ? ts.ScriptKind.TS
    : ts.ScriptKind.JS;
  return ts.createSourceFile(abs, text, ts.ScriptTarget.Latest, true, kind);
}
function astLine(sf, node) {
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}
function astMemberName(nameNode) {
  if (!nameNode) return null;
  if (ts.isIdentifier(nameNode) || ts.isStringLiteralLike(nameNode) || ts.isNumericLiteral(nameNode)) return nameNode.text;
  if (ts.isPrivateIdentifier(nameNode)) return null;
  if (ts.isComputedPropertyName(nameNode)) {
    const inner = nameNode.expression.getText();
    if (inner === 'Symbol.iterator') return '[Symbol.iterator]';
    return `[${inner}]`;
  }
  return nameNode.getText();
}
function astHasModifier(node, kind) {
  return !!(node.modifiers && node.modifiers.some((m) => m.kind === kind));
}
function astSignature(sf, node) {
  let txt = node.getText(sf).replace(/\s+/g, ' ').trim();
  // Strip a trailing semicolon and any JSDoc already handled separately.
  if (txt.length > 420) txt = txt.slice(0, 417) + '...';
  return txt;
}
function astJsDoc(node) {
  const docs = ts.getJSDocCommentsAndTags(node) || [];
  for (const d of docs) {
    if (ts.isJSDoc(d) && d.comment) {
      const txt = typeof d.comment === 'string' ? d.comment : d.comment.map((p) => p.text || '').join('');
      const clean = txt.replace(/\s+/g, ' ').trim();
      if (clean) return clean;
    }
  }
  return '';
}
function collectAstMembers(sf, members) {
  const out = new Map();
  for (const mem of members) {
    let name = null;
    let kind = null;
    if (ts.isConstructorDeclaration(mem)) { name = 'constructor'; kind = 'constructor'; }
    else if (ts.isMethodDeclaration(mem) || ts.isMethodSignature(mem)) { name = astMemberName(mem.name); kind = 'method'; }
    else if (ts.isPropertyDeclaration(mem) || ts.isPropertySignature(mem)) { name = astMemberName(mem.name); kind = 'property'; }
    else if (ts.isGetAccessorDeclaration(mem) || ts.isSetAccessorDeclaration(mem)) { name = astMemberName(mem.name); kind = 'property'; }
    else continue;
    if (!name || name.startsWith('_')) continue;
    if (astHasModifier(mem, ts.SyntaxKind.PrivateKeyword)) continue;
    // `declare` fields on RouterService (on/off/trigger) are PropertyDeclarations; keep them.
    if (out.has(name)) continue;
    out.set(name, {
      name, kind, line: astLine(sf, mem),
      visibility: astHasModifier(mem, ts.SyntaxKind.ProtectedKeyword) ? 'protected' : 'public',
      isStatic: astHasModifier(mem, ts.SyntaxKind.StaticKeyword),
      signature: astSignature(sf, mem),
      jsDoc: astJsDoc(mem),
    });
  }
  return out;
}
function parseDtsClasses(abs) {
  const sf = loadSourceFile(abs);
  const classes = [];
  for (const stmt of sf.statements) {
    if (!ts.isClassDeclaration(stmt) || !stmt.name) continue;
    classes.push({ name: stmt.name.text, line: astLine(sf, stmt), members: collectAstMembers(sf, stmt.members) });
  }
  return classes;
}
// All classes including those nested in namespaces (qualified "Ns.Class").
function parseAllClasses(abs) {
  const sf = loadSourceFile(abs);
  const out = [];
  const visit = (node, prefix) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const qualified = prefix ? `${prefix}.${node.name.text}` : node.name.text;
      out.push({ name: node.name.text, qualified, line: astLine(sf, node), members: collectAstMembers(sf, node.members) });
    }
    if (ts.isModuleDeclaration(node) && node.body) {
      const nsName = node.name.text;
      const next = prefix ? `${prefix}.${nsName}` : nsName;
      if (ts.isModuleBlock(node.body)) for (const s of node.body.statements) visit(s, next);
      else visit(node.body, next);
      return;
    }
    ts.forEachChild(node, (c) => visit(c, prefix));
  };
  for (const s of sf.statements) visit(s, '');
  return out;
}
function parseDtsInterfaces(abs) {
  const sf = loadSourceFile(abs);
  const out = new Map();
  const visit = (node, prefix) => {
    if (ts.isInterfaceDeclaration(node)) {
      const qualified = prefix ? `${prefix}.${node.name.text}` : node.name.text;
      if (!out.has(qualified)) {
        out.set(qualified, { name: node.name.text, qualified, line: astLine(sf, node), members: collectAstMembers(sf, node.members) });
      }
    }
    if (ts.isModuleDeclaration(node) && node.body) {
      const next = prefix ? `${prefix}.${node.name.text}` : node.name.text;
      if (ts.isModuleBlock(node.body)) for (const s of node.body.statements) visit(s, next);
      else visit(node.body, next);
      return;
    }
    ts.forEachChild(node, (c) => visit(c, prefix));
  };
  for (const s of sf.statements) visit(s, '');
  return out;
}
function parseDtsEnums(abs) {
  const sf = loadSourceFile(abs);
  const out = [];
  const visit = (node, prefix) => {
    if (ts.isEnumDeclaration(node)) {
      const qualified = prefix ? `${prefix}.${node.name.text}` : node.name.text;
      const members = node.members.map((m) => astMemberName(m.name)).filter(Boolean);
      out.push({ name: node.name.text, qualified, line: astLine(sf, node), members, signature: astSignature(sf, node) });
    }
    if (ts.isModuleDeclaration(node) && node.body) {
      const next = prefix ? `${prefix}.${node.name.text}` : node.name.text;
      if (ts.isModuleBlock(node.body)) for (const s of node.body.statements) visit(s, next);
      else visit(node.body, next);
      return;
    }
    ts.forEachChild(node, (c) => visit(c, prefix));
  };
  for (const s of sf.statements) visit(s, '');
  return out;
}
// Interface members of one named interface (top-level or "Ns.Name").
function interfaceMembers(abs, qualifiedName) {
  const all = parseDtsInterfaces(abs);
  return all.get(qualifiedName) || null;
}
function parseMapKeys(abs, interfaceName) {
  const lines = readLines(abs);
  const keys = new Map();
  let inside = false;
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inside && line.includes(`interface ${interfaceName}`)) inside = true;
    if (inside) {
      const m = line.match(/'([^']+)'\s*:/);
      if (m && !keys.has(m[1])) keys.set(m[1], { name: m[1], line: i + 1 });
      depth += braceDelta(line);
      if (depth < 0) break;
      if (depth === 0 && line.includes('}')) break;
    }
  }
  return keys;
}
function parseSrcConstExports(abs) {
  const lines = readLines(abs);
  const out = new Map();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/export\s+const\s+(\w+)/) || lines[i].match(/export\s+(?:async\s+)?function\s+(\w+)/);
    if (m && !out.has(m[1])) out.set(m[1], { name: m[1], line: i + 1 });
  }
  return out;
}
function parseExportClasses(abs) {
  const lines = readLines(abs);
  const out = new Map();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/export\s+(?:abstract\s+)?class\s+(\w+)/);
    if (m && !out.has(m[1])) out.set(m[1], { name: m[1], line: i + 1 });
  }
  return out;
}
function findLine(abs, needle) {
  const lines = readLines(abs);
  for (let i = 0; i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
  return 1;
}

// ------------------------------------------------------------ extraction
// Returns a Map: `${family}\0${key}` -> raw item
// { family, key, name, sourceAbs, line, extra }.
export function extractRaw() {
  const raw = new Map();
  const add = (family, key, name, sourceAbs, line, extra = {}) => {
    const ck = `${family}\0${key}`;
    if (!raw.has(ck)) raw.set(ck, { family, key, name, sourceAbs, line, extra });
  };
  const T = (rel) => join(coreRoot, 'types', rel);
  const S = (rel) => join(coreRoot, 'src', rel);

  // dia-api (AST: generic methods and required properties included)
  for (const cls of parseDtsClasses(T('dia.d.ts'))) {
    for (const mem of cls.members.values()) {
      add('dia-api', `${cls.name}.${mem.name}`, mem.name, T('dia.d.ts'), mem.line,
        { owner: cls.name, kind: mem.kind, visibility: mem.visibility, isStatic: !!mem.isStatic, signature: mem.signature, jsDoc: mem.jsDoc });
    }
  }
  // dia enums declared inside namespaces (CellView.Highlighting, ElementView.Flags,
  // LinkView.Flags, Paper.sorting, Paper.Layers)
  for (const en of parseDtsEnums(T('dia.d.ts'))) {
    add('dia-api', en.qualified, en.name, T('dia.d.ts'), en.line,
      { owner: en.qualified.split('.').slice(0, -1).join('.') || 'dia', kind: 'enum', enumMembers: en.members, signature: en.signature });
  }
  // paper-option: fields of Paper.Options only (AST interface Paper.Options)
  {
    const abs = T('dia.d.ts');
    const opts = interfaceMembers(abs, 'Paper.Options');
    if (opts) {
      for (const mem of opts.members.values()) {
        if (mem.kind !== 'property') continue;
        add('paper-option', mem.name, mem.name, abs, mem.line, { signature: mem.signature, jsDoc: mem.jsDoc });
      }
    }
  }
  // event: EventMap keys (Graph and Paper namespaces) + trigger literals
  {
    const abs = T('dia.d.ts');
    const lines = readLines(abs);
    let inside = false, depth = 0, ns = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nm = line.match(/export\s+namespace\s+(\w+)/);
      if (nm) ns = nm[1];
      if (!inside && line.includes('interface EventMap')) { inside = true; depth = 0; }
      if (inside) {
        const m = line.match(/'([^']+)'\s*:/);
        if (m) add('event', m[1], m[1], abs, i + 1, { origin: `${ns || 'dia'}-event-map` });
        const tm = line.match(/`(change|layer:change):\$\{string\}`/);
        if (tm) add('event', `${tm[1]}:<attribute>`, `${tm[1]}:<attribute>`, abs, i + 1, { origin: `${ns || 'dia'}-event-map`, dynamic: true });
        depth += braceDelta(line);
        if (depth < 0 || (depth === 0 && line.trim().startsWith('}'))) inside = false;
      }
    }
    for (const f of walk(join(coreRoot, 'src'), (p) => p.endsWith('.mjs'))) {
      const ls = readLines(f);
      for (let i = 0; i < ls.length; i++) {
        // Comment-only trigger examples (e.g. the Events mixin doc header)
        // are not observable events and must not be enumerated.
        const trimmed = ls[i].trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;
        for (const m of ls[i].matchAll(/trigger\(\s*'([^']+)'/g)) {
          add('event', m[1], m[1], f, i + 1, { origin: 'trigger-literal' });
        }
        for (const m of ls[i].matchAll(/trigger\(\s*"([^"]+)"/g)) {
          add('event', m[1], m[1], f, i + 1, { origin: 'trigger-literal' });
        }
        if (/'change:'\s*\+/.test(ls[i])) {
          add('event', 'change:<attribute>', 'change:<attribute>', f, i + 1, { origin: 'dynamic-pattern', dynamic: true });
        }
        for (const m of ls[i].matchAll(/eventPrefix\s*\+\s*'([^']+)'/g)) {
          add('event', `<prefix>${m[1]}`, `<prefix>${m[1]}`, f, i + 1, { origin: 'dynamic-pattern', dynamic: true });
        }
      }
    }
  }
  // routers / connectors (type maps + public enums)
  for (const [k, v] of parseMapKeys(T('routers.d.ts'), 'RouterArgumentsMap')) {
    add('router', k, k, T('routers.d.ts'), v.line, { deprecated: k === 'oneSide' });
  }
  for (const [k, v] of parseMapKeys(T('connectors.d.ts'), 'ConnectorArgumentsMap')) {
    add('connector', k, k, T('connectors.d.ts'), v.line, {});
  }
  // routers.rightAngle.Directions (RightAngleDirections) and connectors.curve enums
  for (const en of parseDtsEnums(T('routers.d.ts'))) {
    if (en.name === 'RightAngleDirections') {
      add('router', 'rightAngle.Directions', 'Directions', T('routers.d.ts'), en.line, { owner: 'rightAngle', kind: 'enum', enumMembers: en.members, signature: en.signature });
    }
  }
  for (const en of parseDtsEnums(T('connectors.d.ts'))) {
    if (en.name === 'CurveDirections') add('connector', 'curve.Directions', 'Directions', T('connectors.d.ts'), en.line, { owner: 'curve', kind: 'enum', enumMembers: en.members, signature: en.signature });
    if (en.name === 'CurveTangentDirections') add('connector', 'curve.TangentDirections', 'TangentDirections', T('connectors.d.ts'), en.line, { owner: 'curve', kind: 'enum', enumMembers: en.members, signature: en.signature });
  }
  // anchors / link-anchors / connection points / strategies (src exports)
  for (const [k, v] of parseSrcConstExports(S('anchors/index.mjs'))) add('anchor', k, k, S('anchors/index.mjs'), v.line, {});
  for (const [k, v] of parseSrcConstExports(S('linkAnchors/index.mjs'))) {
    if (k === 'resolveRef') continue; // internal resolver helper, not an anchor name
    add('link-anchor', k, k, S('linkAnchors/index.mjs'), v.line, {});
  }
  // linkAnchors uses `export { connectionRatio, connectionLength }` — catch brace exports too
  {
    const abs = S('linkAnchors/index.mjs');
    for (const line of readLines(abs)) {
      const m = line.match(/export\s*\{\s*([^}]+)\}/);
      if (m) for (const part of m[1].split(',')) {
        const n = part.trim().split(/\s+as\s+/).pop();
        if (n) add('link-anchor', n, n, abs, findLine(abs, n), {});
      }
    }
  }
  for (const [k, v] of parseSrcConstExports(S('connectionPoints/index.mjs'))) add('connection-point', k, k, S('connectionPoints/index.mjs'), v.line, {});
  for (const [k, v] of parseSrcConstExports(S('connectionStrategies/index.mjs'))) add('connection-strategy', k, k, S('connectionStrategies/index.mjs'), v.line, {});
  // highlighters: constructor names (src) + declared members and list enums (types)
  for (const f of walk(S('highlighters'), (p) => p.endsWith('.mjs') && !p.endsWith('index.mjs'))) {
    for (const [k, v] of parseSrcConstExports(f)) add('highlighter', k, k, f, v.line, {});
  }
  {
    const abs = T('highlighters.d.ts');
    for (const cls of parseAllClasses(abs)) {
      // Top-level highlighter classes already added from src; add their members.
      if (cls.qualified.includes('.')) continue;
      for (const mem of cls.members.values()) {
        add('highlighter', `${cls.name}.${mem.name}`, mem.name, abs, mem.line, { owner: cls.name, kind: mem.kind, signature: mem.signature, jsDoc: mem.jsDoc });
      }
    }
    for (const en of parseDtsEnums(abs)) {
      add('highlighter', en.qualified, en.name, abs, en.line, { owner: en.qualified.split('.').slice(0, -1).join('.') || 'highlighters', kind: 'enum', enumMembers: en.members, signature: en.signature });
    }
  }
  // tools: top-level classes + nested handle classes + declared members
  for (const [family, file] of [['link-tool', 'linkTools.d.ts'], ['element-tool', 'elementTools.d.ts']]) {
    const abs = T(file);
    for (const [k, v] of parseExportClasses(abs)) add(family, k, k, abs, v.line, {});
    for (const cls of parseAllClasses(abs)) {
      if (cls.qualified.includes('.')) add(family, cls.qualified, cls.name, abs, cls.line, { owner: cls.qualified.split('.').slice(0, -1).join('.'), kind: 'class' });
      for (const mem of cls.members.values()) {
        // Constructors of tools are construction, not a separate observable edit.
        if (mem.kind === 'constructor') continue;
        add(family, `${cls.qualified}.${mem.name}`, mem.name, abs, mem.line, { owner: cls.qualified, kind: mem.kind, signature: mem.signature, jsDoc: mem.jsDoc });
      }
    }
  }
  // shapes: standard classes + declared members (e.g. Cylinder.topRy)
  {
    const abs = T('shapes-standard.d.ts');
    for (const [k, v] of parseExportClasses(abs)) add('shape', k, k, abs, v.line, {});
    for (const cls of parseAllClasses(abs)) {
      for (const mem of cls.members.values()) {
        if (mem.kind === 'constructor') continue;
        add('shape', `${cls.qualified}.${mem.name}`, mem.name, abs, mem.line, { owner: cls.qualified, kind: mem.kind, signature: mem.signature, jsDoc: mem.jsDoc });
      }
    }
  }
  // layout ports
  {
    const abs = T('layout.d.ts');
    const lines = readLines(abs);
    let ns = null;
    for (let i = 0; i < lines.length; i++) {
      const nm = lines[i].match(/export\s+namespace\s+(\w+)/);
      if (nm) ns = nm[1];
      const vm = lines[i].match(/export\s+var\s+(\w+)/);
      if (vm && ns === 'Port') add('layout-port', vm[1], vm[1], abs, i + 1, { deprecated: vm[1] === 'fn' });
      if (vm && ns === 'PortLabel') add('layout-port-label', vm[1], vm[1], abs, i + 1, {});
    }
  }
  // geometry (classes + Segment interface + types enum)
  {
    const abs = T('geometry.d.ts');
    for (const cls of parseDtsClasses(abs)) {
      for (const mem of cls.members.values()) {
        add('geometry', `${cls.name}.${mem.name}`, mem.name, abs, mem.line, { owner: cls.name, kind: mem.kind, signature: mem.signature, jsDoc: mem.jsDoc });
      }
    }
    const seg = interfaceMembers(abs, 'Segment');
    if (seg) {
      for (const mem of seg.members.values()) {
        add('geometry', `Segment.${mem.name}`, mem.name, abs, mem.line, { owner: 'Segment', kind: mem.kind, signature: mem.signature, jsDoc: mem.jsDoc });
      }
    }
    for (const en of parseDtsEnums(abs)) {
      if (en.name === 'types') add('geometry', 'types', 'types', abs, en.line, { owner: 'g', kind: 'enum', enumMembers: en.members, signature: en.signature });
    }
    const lines = readLines(abs);
    let ns = null, nsDepth = -1, depth = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nm = line.match(/export\s+namespace\s+(\w+)/);
      if (nm) { ns = nm[1]; nsDepth = depth; }
      const fm = line.match(/^export\s+function\s+(\w+)/) || line.match(/^\s+export\s+function\s+(\w+)/) || (ns === 'intersection' ? line.match(/^\s+function\s+(\w+)/) : null);
      if (fm) {
        if (ns && depth > nsDepth) add('geometry', `${ns}.${fm[1]}`, fm[1], abs, i + 1, { owner: ns, kind: 'function' });
        else if (!ns) add('geometry', fm[1], fm[1], abs, i + 1, { owner: 'g', kind: 'function' });
      }
      depth += braceDelta(line);
      if (ns && depth <= nsDepth) ns = null;
    }
  }
  // vectorizer (VElement + VStatic interface + V callable signature)
  {
    const abs = T('vectorizer.d.ts');
    for (const cls of parseDtsClasses(abs)) {
      if (cls.name !== 'VElement') continue;
      for (const mem of cls.members.values()) {
        add('vectorizer', mem.name, mem.name, abs, mem.line, { owner: 'VElement', kind: mem.kind, signature: mem.signature, jsDoc: mem.jsDoc });
      }
    }
    const vstatic = interfaceMembers(abs, 'VStatic');
    if (vstatic) {
      for (const mem of vstatic.members.values()) {
        add('vectorizer', `V.${mem.name}`, mem.name, abs, mem.line, { owner: 'VStatic', kind: mem.kind, signature: mem.signature, jsDoc: mem.jsDoc });
      }
    }
    // Direct invocation V(svg, attrs, children): the call signature of VCallable.
    {
      const sf = loadSourceFile(abs);
      const visit = (node) => {
        if (ts.isInterfaceDeclaration(node) && node.name.text === 'VCallable') {
          for (const mem of node.members) {
            if (ts.isCallSignatureDeclaration(mem)) {
              add('vectorizer', 'V', 'V', abs, astLine(sf, mem), { owner: 'VCallable', kind: 'callable', signature: astSignature(sf, mem) });
            }
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(sf);
    }
  }
  // util
  {
    const abs = T('util.d.ts');
    const lines = readLines(abs);
    let ns = null, nsDepth = -1, depth = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nm = line.match(/export\s+namespace\s+(\w+)/);
      if (nm) { ns = nm[1]; nsDepth = depth; }
      const fm = line.match(/export\s+(?:function|var)\s+(\w+)/);
      if (fm) {
        if (ns && depth > nsDepth) add('util', `${ns}.${fm[1]}`, fm[1], abs, i + 1, { owner: ns });
        else if (!ns || depth <= nsDepth) add('util', fm[1], fm[1], abs, i + 1, { owner: 'util' });
      }
      depth += braceDelta(line);
      if (ns && depth <= nsDepth) ns = null;
    }
  }
  // mvc (typed classes + runtime-only Data methods; $ stays a single facade entry)
  {
    const abs = T('mvc.d.ts');
    for (const cls of parseDtsClasses(abs)) {
      for (const mem of cls.members.values()) {
        add('mvc', `${cls.name}.${mem.name}`, mem.name, abs, mem.line, { owner: cls.name, kind: mem.kind, signature: mem.signature, jsDoc: mem.jsDoc });
      }
    }
    const idx = S('mvc/index.mjs');
    add('mvc', 'Data', 'Data', idx, findLine(idx, 'Data'), { owner: 'mvc', kind: 'class' });
    add('mvc', '$', '$', idx, findLine(idx, 'Dom/index'), { owner: 'mvc', kind: 'dom-helper' });
    // mvc.Data methods from the JS class body (no .d.ts declaration exists).
    {
      const dataAbs = S('mvc/Data.mjs');
      const sf = loadSourceFile(dataAbs);
      for (const stmt of sf.statements) {
        if (!ts.isClassDeclaration(stmt)) continue;
        for (const mem of collectAstMembers(sf, stmt.members).values()) {
          if (mem.kind === 'constructor') continue;
          add('mvc', `Data.${mem.name}`, mem.name, dataAbs, mem.line, { owner: 'Data', kind: mem.kind, signature: mem.signature });
        }
      }
    }
  }
  // presentation attributes (registry keys + bracket aliases + calc evaluator
  // + CellView-consumed selector attributes)
  {
    const attrDir = S('dia/attributes');
    for (const f of walk(attrDir, (p) => p.endsWith('.mjs'))) {
      if (f.endsWith('props.mjs')) continue;
      if (f.endsWith('eval.mjs')) continue; // handled explicitly below
      const lines = readLines(f);
      for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(/^\s{4}'([^']+)':\s*\{/);
        if (m) add('presentation-attribute', m[1], m[1], f, i + 1, {});
        const bracket = lines[i].match(/^\w+AttributesNS\['([^']+)'\]\s*=/);
        if (bracket) add('presentation-attribute', bracket[1], bracket[1], f, i + 1, { alias: true });
      }
    }
    const idx = S('dia/attributes/index.mjs');
    add('presentation-attribute', 'props', 'props', idx, findLine(idx, 'props,'), {});
    // calc(...) evaluator (src/dia/attributes/eval.mjs + src/util/calc.mjs)
    {
      const evalAbs = S('dia/attributes/eval.mjs');
      add('presentation-attribute', 'evalAttributes', 'evalAttributes', evalAbs, findLine(evalAbs, 'export function evalAttributes'), { owner: 'attributes', kind: 'function' });
      add('presentation-attribute', 'evalAttribute', 'evalAttribute', evalAbs, findLine(evalAbs, 'export function evalAttribute'), { owner: 'attributes', kind: 'function' });
    }
    // Consumed inside the text attribute handler, not a registry key.
    {
      const textAbs = S('dia/attributes/text.mjs');
      add('presentation-attribute', 'use-no-break-space', 'use-no-break-space', textAbs, findLine(textAbs, 'use-no-break-space'), { owner: 'attributes', kind: 'option' });
    }
    // Selector/control attributes consumed by CellView outside the registry
    // (types/attributes.d.ts SVGAttributes).
    {
      const attrTypes = T('attributes.d.ts');
      for (const name of ['event', 'magnet', 'magnetSelector', 'highlighterSelector', 'containerSelector']) {
        add('presentation-attribute', name, name, attrTypes, findLine(attrTypes, `${name}?:`), { owner: 'attributes', kind: 'selector-attribute' });
      }
    }
  }
  // core config
  {
    const abs = S('config/index.mjs');
    const lines = readLines(abs);
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^\s{4}(\w+):/);
      if (m) add('core-config', `config.${m[1]}`, m[1], abs, i + 1, { owner: 'config' });
    }
    const envAbs = S('env/index.mjs');
    add('core-config', 'env.addTest', 'addTest', envAbs, findLine(envAbs, 'addTest'), { owner: 'env' });
    add('core-config', 'env.test', 'test', envAbs, findLine(envAbs, 'test: function'), { owner: 'env' });
    const themeAbs = S('setTheme.mjs');
    add('core-config', 'setTheme', 'setTheme', themeAbs, 1, { owner: 'core' });
    const jointTypes = T('joint.d.ts');
    add('core-config', 'version', 'version', jointTypes, findLine(jointTypes, 'version'), { owner: 'core' });
  }
  // alg
  {
    const abs = T('alg.d.ts');
    add('alg', 'rightAnglePath', 'rightAnglePath', abs, findLine(abs, 'rightAnglePath(source'), { internal: true });
  }
  extractPackages(raw, add);
  extractCatalog(raw, add);
  return raw;
}

function parseExportStarClasses(indexAbs) {
  // Resolve `export * from './x'` one level and collect exported classes/functions.
  const out = new Map();
  const dir = dirname(indexAbs);
  for (const line of readLines(indexAbs)) {
    const m = line.match(/export\s+\*\s+from\s+'([^']+)'/);
    if (!m) continue;
    let target = join(dir, m[1]);
    if (!existsSync(target)) {
      for (const cand of [`${target}.ts`, `${target}.tsx`, join(target, 'index.ts')]) {
        if (existsSync(cand)) { target = cand; break; }
      }
    }
    if (!existsSync(target)) continue;
    for (const [k, v] of parseExportClasses(target)) if (!out.has(k)) out.set(k, { name: k, line: v.line, file: target });
    for (const [k, v] of parseSrcConstExports(target)) if (!out.has(k)) out.set(k, { name: k, line: v.line, file: target });
  }
  return out;
}
function parseIndexExportNames(abs) {
  // Distinct names exported by an index file: `export { A, B as C }`,
  // `export type { … }` (flagged), and direct `export class/function/const`.
  const out = new Map();
  const text = readFileSync(abs, 'utf8');
  const lines = text.split(/\r?\n/);
  let pending = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (pending) {
      pending.text += ' ' + line.trim();
      if (line.includes('}')) {
        flushExportBlock(pending, out, abs);
        pending = null;
      }
      continue;
    }
    const direct = line.match(/export\s+(?:abstract\s+)?(?:class|function|const|enum)\s+(\w+)/);
    if (direct && !out.has(direct[1])) out.set(direct[1], { name: direct[1], line: i + 1, kind: 'runtime' });
    if (/export\s+(type\s+)?\{/.test(line)) {
      if (line.includes('}')) {
        flushExportBlock({ text: line, line: i + 1, isType: /export\s+type\s*\{/.test(line) }, out, abs);
      } else {
        pending = { text: line, line: i + 1, isType: /export\s+type\s*\{/.test(line) };
      }
    }
  }
  if (pending) flushExportBlock(pending, out, abs);
  return out;
}
function flushExportBlock(block, out, abs) {
  const m = block.text.match(/\{([\s\S]*)\}/);
  if (!m) return;
  for (const part of m[1].split(',')) {
    const t = part.trim().replace(/^type\s+/, '');
    if (!t) continue;
    const name = t.split(/\s+as\s+/).pop().trim();
    if (name && !out.has(name)) out.set(name, { name, line: block.line, kind: block.isType ? 'type' : 'runtime', file: abs });
  }
}

function extractPackages(raw, add) {
  const pkgsDir = join(jointRoot, 'packages');
  const pkgDirs = readdirSync(pkgsDir).sort()
    .map((n) => join(pkgsDir, n))
    .filter((p) => statSync(p).isDirectory() && existsSync(join(p, 'package.json')));
  for (const dir of pkgDirs) {
    const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    add('package', manifest.name, manifest.name, join(dir, 'package.json'), 1, {
      version: manifest.version, license: manifest.license || 'unknown',
      private: !!manifest.private, dir: repoRel(dir),
    });
  }
  const P = (rel) => join(jointRoot, 'packages', rel);
  // DirectedGraph functions
  {
    const abs = P('joint-layout-directed-graph/DirectedGraph.d.ts');
    for (const line of readLines(abs)) {
      const m = line.match(/export\s+function\s+(\w+)/);
      if (m) add('package-api', `@joint/layout-directed-graph:${m[1]}`, m[1], abs, findLine(abs, `function ${m[1]}`), { package: '@joint/layout-directed-graph' });
    }
  }
  // MSAGL entry-point: layout + enums
  {
    const idx = P('joint-layout-msagl/src/index.mts');
    add('package-api', '@joint/layout-msagl:layout', 'layout', idx, findLine(idx, 'export function layout'), { package: '@joint/layout-msagl' });
    const enums = P('joint-layout-msagl/src/enums.mts');
    for (const [k, v] of parseSrcConstExports(enums)) add('package-api', `@joint/layout-msagl:${k}`, k, enums, v.line, { package: '@joint/layout-msagl' });
    for (const line of readLines(enums)) {
      const m = line.match(/export\s+enum\s+(\w+)/);
      if (m) add('package-api', `@joint/layout-msagl:${m[1]}`, m[1], enums, findLine(enums, `enum ${m[1]}`), { package: '@joint/layout-msagl' });
      const r = line.match(/export\s*\{\s*(\w+)\s*\}/);
      if (r) add('package-api', `@joint/layout-msagl:${r[1]}`, r[1], enums, findLine(enums, r[1]), { package: '@joint/layout-msagl' });
    }
  }
  // router-avoid: initialisers + RouterService class, members and events
  {
    const idx = P('joint-router-avoid/src/index.mts');
    for (const n of ['initAvoidRouter', 'loadAvoidRouter']) {
      add('package-api', `@joint/router-avoid:${n}`, n, idx, findLine(idx, n), { package: '@joint/router-avoid' });
    }
    const svc = P('joint-router-avoid/src/RouterService.mts');
    if (existsSync(svc)) {
      add('package-api', '@joint/router-avoid:RouterService', 'RouterService', svc, findLine(svc, 'export class RouterService'), { package: '@joint/router-avoid', kind: 'class' });
      for (const cls of parseAllClasses(svc)) {
        if (cls.name !== 'RouterService') continue;
        for (const mem of cls.members.values()) {
          if (mem.kind === 'constructor') continue;
          add('package-api', `@joint/router-avoid:RouterService.${mem.name}`, `RouterService.${mem.name}`, svc, mem.line, { package: '@joint/router-avoid', kind: mem.kind, signature: mem.signature, jsDoc: mem.jsDoc });
        }
      }
      // Events of RouterServiceEventMap (link:routing, link:routed, ...)
      const evMap = interfaceMembers(svc, 'RouterServiceEventMap');
      if (evMap) {
        for (const mem of evMap.members.values()) {
          add('package-api', `@joint/router-avoid:RouterService.event:${mem.name}`, mem.name, svc, mem.line, { package: '@joint/router-avoid', kind: 'event', signature: mem.signature });
        }
      }
      // Exported option/result types of the service.
      for (const [qname, iface] of parseDtsInterfaces(svc)) {
        if (['RouterServiceOptions', 'RoutingResult', 'FallbackRouteAttributes', 'RouteAttributes'].includes(iface.name)) {
          add('package-api', `@joint/router-avoid:${iface.name}`, iface.name, svc, iface.line, { package: '@joint/router-avoid', kind: 'type' });
        }
      }
    }
  }
  // shapes-general + shapes-general-tools (export * resolved classes)
  for (const [pkg, label] of [['joint-shapes-general', '@joint/shapes-general'], ['joint-shapes-general-tools', '@joint/shapes-general-tools']]) {
    const idx = P(`${pkg}/src/index.ts`);
    if (!existsSync(idx)) continue;
    for (const v of parseExportStarClasses(idx).values()) {
      add('package-api', `${label}:${v.name}`, v.name, v.file, v.line, { package: label });
    }
  }
  // react exported names (entry point "." plus public subpath "./internal")
  {
    const idx = P('joint-react/src/index.ts');
    if (existsSync(idx)) {
      for (const v of parseIndexExportNames(idx).values()) {
        add('package-api', `@joint/react:${v.name}`, v.name, idx, v.line, { package: '@joint/react', kind: v.kind });
      }
    }
    const internal = P('joint-react/src/internal.ts');
    if (existsSync(internal)) {
      for (const v of parseIndexExportNames(internal).values()) {
        add('package-api', `@joint/react/internal:${v.name}`, v.name, internal, v.line, { package: '@joint/react', subpath: '/internal', kind: v.kind });
      }
      // `export * from './state/data-mapping/...'` in internal.ts: resolve one level.
      for (const v of parseExportStarClasses(internal).values()) {
        add('package-api', `@joint/react/internal:${v.name}`, v.name, v.file, v.line, { package: '@joint/react', subpath: '/internal', kind: 'runtime' });
      }
    }
  }
  // decorators factories
  {
    const idx = P('joint-decorators/src/index.ts');
    if (existsSync(idx)) {
      for (const v of parseExportStarClasses(idx).values()) {
        add('package-api', `@joint/decorators:${v.name}`, v.name, v.file, v.line, { package: '@joint/decorators' });
      }
      for (const f of walk(P('joint-decorators/src/decorators'), (p) => p.endsWith('.ts'))) {
        for (const line of readLines(f)) {
          const m = line.match(/export\s+enum\s+(\w+)/);
          if (m) add('package-api', `@joint/decorators:${m[1]}`, m[1], f, findLine(f, `enum ${m[1]}`), { package: '@joint/decorators' });
        }
      }
    }
  }
  // CLI commands
  {
    const cmdDir = P('joint-cli/src/commands');
    for (const f of walk(cmdDir, (p) => p.endsWith('.ts'))) {
      const base = f.split('/').pop().replace(/\.ts$/, '');
      add('package-api', `@joint/cli:${base}`, base, f, 1, { package: '@joint/cli', kind: 'cli-command' });
    }
  }
  // ESLint config names + SVG mock plugin
  {
    const idx = P('joint-eslint-config/index.mjs');
    if (existsSync(idx)) {
      for (const line of readLines(idx)) {
        const m = line.match(/export\s*\{\s*(\w+)\s*\}/);
        if (m) add('package-api', `@joint/eslint-config:${m[1]}`, m[1], idx, findLine(idx, m[1]), { package: '@joint/eslint-config' });
      }
    }
    const mock = P('joint-vitest-plugin-mock-svg/src/index.ts');
    if (existsSync(mock)) add('package-api', '@joint/vitest-plugin-mock-svg:mockSVG', 'mockSVG', mock, findLine(mock, 'mockSVG'), { package: '@joint/vitest-plugin-mock-svg' });
  }
}

const TAG_TO_FAMILIES = {
  'Automatic layout': ['package-api (@joint/layout-directed-graph, @joint/layout-msagl)', 'dia-api (Graph)'],
  'Events': ['event', 'dia-api (Paper, Graph)'],
  'Custom shapes': ['shape', 'dia-api (Element.define, Cell)'],
  'Element palette': ['dia-api (Paper)', 'ds-component (palette)'],
  'Highlighters': ['highlighter', 'dia-api (CellView.highlight)'],
  'Zoom & Pan': ['dia-api (Paper scale/translate)', 'event (paper:pan, paper:pinch)'],
  'Built-in shapes': ['shape'],
  'Embedding': ['dia-api (Cell embed, Graph)', 'dia-api (Paper embedding options)'],
  'Ports': ['dia-api (Element ports)', 'layout-port', 'layout-port-label'],
  'Toolbar': ['ds-component (toolbar)'],
  'Property editor & viewer': ['ds-component (inspector)'],
  'Animation': ['dia-api (Cell transition)', 'util (timing, interpolate)'],
  'Graph API': ['dia-api (Graph, Cell)'],
  'Element tools': ['element-tool'],
  'Geometry': ['geometry'],
  'Drag & Drop': ['dia-api (Paper pointer events)', 'element-tool (Connect)'],
  'Anchors': ['anchor', 'link-anchor'],
  'Selection': ['dia-api (Paper pointer events)', 'highlighter'],
  'Link tools': ['link-tool'],
  'Vectorizer': ['vectorizer'],
  'Collapse & Expand': ['dia-api (Graph, Element embeds)'],
  'Undo/Redo': ['mvc (Model history is application-side)', 'diagram-core transactions (target)'],
  'Popups': ['ds-component (popup)'],
  'Content-driven shapes': ['shape', 'presentation-attribute (text)'],
  'Constraints on movement': ['paper-option (restrictTranslate, validate*)'],
  'Link labels': ['dia-api (Link labels)', 'presentation-attribute (text)'],
  'Adjustable interactivity': ['paper-option (interactive)'],
  'Import/Export': ['dia-api (Graph toJSON/fromJSON)', 'mvc (Model toJSON)'],
  'Routers': ['router'],
  'Connectors': ['connector'],
  'Minimap': ['ds-component (minimap)'],
  'Menus': ['ds-component (menu)'],
  'Validation': ['paper-option (validate*)', 'mvc (Model validate)'],
  'Tooltips': ['ds-component (tooltip)'],
  'Simulation': ['dia-api (Graph)', 'event'],
  'Integration': ['package-api (@joint/react)', 'ds-component'],
  'Keyboard': ['dia-api (Paper)', 'ds-component'],
  'CSS styling': ['presentation-attribute', 'core-config (setTheme)'],
  'Text content': ['presentation-attribute (text)', 'vectorizer (text)'],
  'External images': ['shape (Image family)'],
  'Shape transformation': ['dia-api (Element rotate/scale/resize)'],
  'Responsive': ['dia-api (Paper setDimensions)'],
  'Toggle visibility': ['dia-api (CellView visibility)', 'diagram-canvas visibility (target)'],
};

function extractCatalog(raw, add) {
  const catalogue = JSON.parse(readFileSync(cataloguePath, 'utf8'));
  const apps = catalogue.jointjs_apps_and_recipes || [];
  const catLines = readLines(cataloguePath);
  for (const app of apps) {
    const needle = `"entry_key": "${app.entry_key}"`;
    let line = 1;
    for (let i = 0; i < catLines.length; i++) if (catLines[i].includes(needle)) { line = i + 1; break; }
    const capabilities = [...new Set((app.source_tags || []).flatMap((t) => TAG_TO_FAMILIES[t] || [`tag:${t}`]))].sort();
    add('catalog-app', app.entry_key, app.name, cataloguePath, line, {
      sourceId: app.source_id,
      licenseMarker: app.source_license_marker,
      catalogueCoverage: app.coverage_status,
      currentEquivalent: app.current_sentropic_equivalent,
      tags: app.source_tags || [],
      capabilities,
      referenceUrl: app.reference_url,
    });
  }
}

// ------------------------------------------------------- entry building
const MODEL_CLASSES = new Set(['Graph', 'Cell', 'Element', 'Link', 'GraphLayer', 'CellCollection', 'GraphLayerCollection']);
const PACKAGE_TARGET = {
  '@joint/core': 'diagram-core',
  '@joint/layout-directed-graph': 'graph',
  '@joint/layout-msagl': 'graph',
  '@joint/router-avoid': 'diagram-canvas',
  '@joint/shapes-general': 'graph',
  '@joint/shapes-general-tools': 'diagram-canvas',
  '@joint/react': 'ds-component',
  '@joint/decorators': 'new-module',
  '@joint/cli': 'new-module',
  '@joint/eslint-config': 'new-module',
  '@joint/vitest-plugin-mock-svg': 'new-module',
};
function targetFor(r) {
  const { family, extra } = r;
  switch (family) {
    case 'dia-api': return MODEL_CLASSES.has(extra.owner) ? 'diagram-core' : 'diagram-canvas';
    case 'paper-option': return 'diagram-canvas';
    case 'event': return /^(blank:|paper:|cell:|element:|link:|render:|tools:|translate$|scale$|resize$|transform$)/.test(r.name) ? 'diagram-canvas' : 'diagram-core';
    case 'router': case 'connector': case 'anchor': case 'link-anchor':
    case 'connection-point': case 'connection-strategy':
    case 'layout-port': case 'layout-port-label':
    case 'highlighter': case 'link-tool': case 'element-tool': case 'alg':
      return 'diagram-canvas';
    case 'shape': return 'graph';
    case 'geometry': return 'graph';
    case 'vectorizer': case 'util': case 'mvc': case 'presentation-attribute': case 'core-config':
      return 'new-module';
    case 'package': return PACKAGE_TARGET[r.name] || 'new-module';
    case 'package-api': return PACKAGE_TARGET[extra.package] || 'new-module';
    case 'catalog-app': return 'ds-component';
    default: return 'new-module';
  }
}
function priorityFor(r, target) {
  const { family, extra } = r;
  if (family === 'dia-api' && ['Graph', 'Cell', 'Element', 'Link', 'Paper'].includes(extra.owner)) return 'P0';
  if (family === 'paper-option' || (family === 'event' && target === 'diagram-core')) return 'P0';
  if (family === 'catalog-app') return extra.licenseMarker === 'JointJS+' ? 'P3' : 'P2';
  if (family === 'package' || family === 'package-api') {
    if (['@joint/layout-directed-graph', '@joint/layout-msagl', '@joint/router-avoid'].includes(extra.package || r.name)) return 'P1';
    if ((extra.package || r.name) === '@joint/react') return 'P2';
    return 'P2';
  }
  if (['router', 'connector', 'anchor', 'link-anchor', 'connection-point', 'connection-strategy',
    'layout-port', 'layout-port-label', 'shape', 'geometry'].includes(family)) return 'P1';
  if (family === 'event') return 'P1';
  return 'P2';
}

// Verified contract details for entries whose defaults live in .mjs sources
// (the .d.ts signature alone does not state them). Values were read from the
// pinned sources cited in the spec appendix; they are behaviour facts, not
// transcribed code.
const CONTRACT_DETAILS = {
  'router:metro': 'Delegates to manhattan with maxAllowedDirectionChange=45 and 8 search directions (4 orthogonal + 4 diagonal); diagonal step cost is ceil(sqrt(2*step^2)); on exceeding maximumLoops or an inaccessible target the octilinear fallbackRoute (single 45-degree bend through rounded points, obstacles ignored) is returned. Rounding follows manhattan (precision=1, points rounded).',
  'router:manhattan': 'A* search on a step grid (step=10, maximumLoops=2000, precision=1) with maxAllowedDirectionChange=90, perpendicular=true, excludeEnds=[], excludeTypes=[], start/end directions [top,right,bottom,left]; returned vertices are grid-aligned and rounded to precision=1.',
  'connector:straight': 'Connects [sourcePoint, ...routePoints, targetPoint]. Defaults: cornerType=point (plain polyline), cornerRadius=10, cornerPreserveAspectRatio=false, precision=1, raw=false. With cornerType cubic/line/gap and cornerRadius>0 each interior vertex is replaced by cornerStart/cornerEnd moved toward neighbours by min(cornerRadius, half adjacent distances) (equal moves when cornerPreserveAspectRatio) and rounded to precision=1; an unknown cornerType throws.',
  'connector:curve': 'Catmull-Rom through [sourcePoint, ...route, targetPoint] converted to cubic Beziers. Defaults: direction=auto, precision=3, distanceCoefficient (coeff)=0.6, angleTangentCoefficient=80, tension (tau)=0.5; end tangents lengthen by (angle-pi/4)*80 when the end direction deviates more than 45 degrees. The Path is rounded to precision=3; raw=true returns the Path, otherwise its serialised string. curve.Directions={auto,horizontal,vertical,closest-point,outwards}; curve.TangentDirections adds {up,down,left,right}.',
  'geometry:Rect.containsPoint': 'Closed convention without normalisation: with opt.strict falsy the result is x>=this.x && x<=this.x+width && y>=this.y && y<=this.y+height; with opt.strict===true all four comparisons are strict (> and <). Negative widths/heights are not normalised first, so the span can be empty or inverted. This differs from diagram-canvas rectContainsPoint (normalised, half-open x<=p.x<x+width).',
  'geometry:Rect.intersect': 'Returns a new g.Rect holding the overlap rectangle, or null when the rectangles do not overlap (touching edges count as no overlap: the test uses <=/>= on origins/corners). This differs from diagram-canvas rectsIntersect, which returns a boolean.',
  'presentation-attribute:evalAttributes': 'For each attribute whose name is in the calc list [transform,x,y,cx,cy,dx,dy,x1,y1,x2,y2,points,d,r,rx,ry,width,height,stroke-width,font-size] and whose value contains calc(...), evaluates every calc formula against the reference box and clamps r,rx,ry,width,height,stroke-width,font-size to >=0. Other attributes pass through unchanged.',
  'presentation-attribute:evalAttribute': 'Single-attribute form of evalAttributes: evaluates calc(...) only when the attribute is in the calc list; otherwise returns the value unchanged (positive-value clamping as above).',
};
const CALC_GRAMMAR = 'calc grammar: calc(<formula>) where a formula is [coef*](w|h|x|y|s|l|d)[/divisor][+/-offset] with w=width, h=height, x,y=origin, s=min(w,h), l=max(w,h), d=sqrt(w^2+h^2); formulas may be embedded in SVG strings such as d or points and several calc(...) may appear in one value.';

function behaviourFor(r) {
  const n = r.name;
  const o = r.extra.owner || '';
  const sig = r.extra.signature ? ` Declared as: \`${r.extra.signature}\`.` : '';
  const doc = r.extra.jsDoc ? ` ${r.extra.jsDoc}` : '';
  const detailKey = `${r.family}:${r.key}`;
  const detail = CONTRACT_DETAILS[detailKey] ? ` ${CONTRACT_DETAILS[detailKey]}` : '';
  const enumNote = r.extra.enumMembers ? ` Members: ${r.extra.enumMembers.join(', ')}.` : '';
  switch (r.family) {
    case 'dia-api':
      if (r.extra.kind === 'enum') return `\`dia.${r.key}\` (enum).${enumNote}${sig}${doc} Reading the enum yields the string constants used by the corresponding dia options and view flags; the values are part of the observable contract.`;
      return `\`dia.${o}.${n}\` (${r.extra.kind}${r.extra.isStatic ? ', static' : ''}).${sig}${doc}${detail} Observable contract: the inputs, return value, thrown/rejected cases and emitted change notifications are those of the declared signature; mutable model members mutate the owning graph/cell state, accessors report it without side effects beyond the documented caching.`;
    case 'paper-option':
      return `Paper option \`${n}\`.${sig}${doc} Setting it at Paper construction changes the rendering or interaction behaviour named by the field for every subsequent render and pointer interaction until changed; options holding functions (validators, strategies) are invoked with the documented view/model arguments.`;
    case 'event':
      return `Event \`${n}\`${r.extra.dynamic ? ' (dynamic pattern: the suffix after the prefix is supplied at emission time)' : ''}: emitted synchronously by the owning graph, paper, model or view when the named condition occurs; listeners receive the arguments declared for this name in emission order, and preventing or suppressing the underlying operation suppresses the event.${sig}`;
    case 'router':
      if (r.extra.kind === 'enum') return `\`routers.${r.key}\` (enum).${enumNote}${sig} The constants select the exit/entry sides honoured by the rightAngle router.`;
      return `Router \`${n}\`: input is the link source anchor, target anchor and current intermediate vertices plus this router's options; output is the replacement intermediate-vertex list, in order, through which the rendered connection must pass.${detail}${sig}`;
    case 'connector':
      if (r.extra.kind === 'enum') return `\`connectors.${r.key}\` (enum).${enumNote}${sig} The constants select the tangent/direction rule of the curve connector.`;
      return `Connector \`${n}\`: input is source point, target point, routed vertices and this connector's options; output is the connection path (serialised SVG path upstream; sampled polyline/curve points on our stack).${detail}${sig}`;
    case 'anchor':
      return `Element anchor \`${n}\`: input is the end element/port geometry, the magnet shape descriptor and a reference point (plus this anchor's options); output is the link end point on the element. Moving, resizing or rotating the element moves the computed point by the same rule.${sig}`;
    case 'link-anchor':
      return `Link anchor \`${n}\`: input is the host link's rendered connection and a reference point or ratio/length argument; output is the attachment point on that connection, used when a link end attaches to another link.${sig}`;
    case 'connection-point':
      return `Connection point \`${n}\`: input is the link end segment and the end element's shape/bounding box; output trims or extends the rendered path end so the visible path starts or ends exactly at the computed boundary point (stroke and offset options honoured as declared).${sig}`;
    case 'connection-strategy':
      return `Connection strategy \`${n}\`: on a link-end drop over an element, magnet or link it rewrites the end definition (anchor name and arguments, or connection ratio on a link target) before the link model is updated; the rewritten definition is the observable output.${sig}`;
    case 'highlighter':
      if (r.extra.kind === 'enum') return `Highlighter enum \`${r.key}\`.${enumNote}${sig}`;
      if (o && n !== o) return `\`highlighters.${o}.${n}\` (${r.extra.kind}).${sig}${doc} It contributes to the "${o}" emphasis: applied to a cell view (or link connection) it adds the visible overlay and removes it cleanly on unhighlight, without changing the underlying model.`;
      return `Highlighter \`${n}\`: when applied to a cell view (or a link connection) it adds the visible emphasis named "${n}" (padding, stroke, mask or class as declared for this highlighter) and removes it cleanly on unhighlight, without changing the underlying model.`;
    case 'link-tool':
      if (r.extra.kind === 'class') return `Link-tool handle class \`${r.key}\`: the draggable handle view used by its parent tool; pointer drags on it produce the parent tool's link edit.${sig}`;
      if (o && r.key !== n) return `\`linkTools.${r.key}\` (${r.extra.kind}).${sig}${doc} Part of the parent tool's interaction: it renders on the link's tools layer and translates its pointer gestures into that tool's link edit, committed to the link model on release.`;
      return `Link tool \`${n}\`: when a link's tools are shown it renders its handle(s) on the link and translates pointer drags into the link edits named by the tool (vertices, segments, arrowheads, anchors, labels or removal), updating the link model on release.`;
    case 'element-tool':
      if (r.extra.kind === 'class') return `Element-tool handle class \`${r.key}\`: the draggable handle view used by its parent tool.${sig}`;
      if (o && r.key !== n) return `\`elementTools.${r.key}\` (${r.extra.kind}).${sig}${doc} Part of the parent tool's interaction on the element's tools layer.`;
      return `Element tool \`${n}\`: when an element's tools are shown it renders its handle or button on the element and translates pointer interaction into the element or link-creation edits named by the tool, updating the model on release.`;
    case 'shape':
      if (o && r.key !== n) return `\`standard.${r.key}\` (${r.extra.kind}).${sig}${doc} Member of the standard shape class; reading or setting it follows the declared signature on shape instances.`;
      return `Standard shape \`standard.${n}\`: an element (or link, for the link shapes) type with its own default markup, default selector attributes (including calc(...) sizing such as calc(w)/calc(h) where declared) and default size; creating it renders the named figure and setting its selectors updates the corresponding parts.`;
    case 'layout-port':
      return `Port layout \`${n}\`: input is a port group's ports (with per-port dx/dy) and the element bounding box; output is each port's position and angle. Positions are rounded to integers (p.round()) upstream.${sig}`;
    case 'layout-port-label':
      return `Port-label layout \`${n}\`: input is a port position and the element bounding box; output is the port label's position, angle and attributes.${sig}`;
    case 'geometry':
      if (r.extra.kind === 'enum') return `\`g.types\` (enum).${enumNote}${sig} The numeric codes discriminate the geometry classes (Point=1, Line=2, Ellipse=3, Rect=4, Polyline=5, Polygon=6, Curve=7, Path=8).`;
      if (o === 'Segment') return `\`g.Segment.${n}\` (${r.extra.kind}).${sig}${doc} Behavioural contract of one path segment (M/L/C/Z units created through Path.createSegment): a pure geometry operation on the segment, with no rendering side effects. Segment geometry (bbox, length, closest point, tangents, subdivision) follows the declared signature.`;
      return `\`g.${o ? o + '.' : ''}${n}\` (${r.extra.kind || 'function'}).${sig}${doc}${detail} Pure plane-geometry operation: the documented inputs produce the documented points, shapes, distances, intersections or serialised form, with no rendering side effects.`;
    case 'vectorizer':
      if (r.extra.kind === 'callable') return `\`V(svg, attrs, children)\` (callable).${sig} Creates a VElement wrapping the given SVG element/tag, applies attrs and appends children; the result supports the VElement operations of this family.`;
      return `\`${o === 'VStatic' ? 'V.' : 'VElement.'}${n}\` (${r.extra.kind}).${sig}${doc} SVG DOM operation: ${o === 'VStatic' ? 'as a static helper it transforms or inspects SVG nodes, matrices or path data and returns the declared result.' : 'applied to the wrapped SVG node it mutates or inspects that node (attributes, transform, text, tree position or measured box) and returns the declared result.'}`;
    case 'util':
      return `\`util.${o && o !== 'util' ? o + '.' : ''}${n}\`.${sig}${doc} Pure (or explicitly documented) helper: the documented inputs produce the documented transformed value, cloned structure, formatted string or scheduled callback behaviour, independently of any diagram state.`;
    case 'mvc':
      if (r.key === '$') return '`mvc.$`: the DOM helper facade re-exported from src/mvc/Dom/index.mjs (vendored jQuery-derived implementation, Dom.mjs). It is inventoried as a single facade entry: parity is specified as a DOM-helper replacement contract, not as per-method jQuery parity (see the spec annex).';
      if (o === 'Data') return `\`mvc.Data.${n}\` (${r.extra.kind}).${sig} WeakMap-backed per-object data store operation of mvc.Data.`;
      return `\`mvc.${o}.${n}\` (${r.extra.kind || 'member'}).${sig}${doc} Backbone-style model, collection, view or event primitive on which dia.Graph, dia.Cell and the views are built; state changes emit the documented change notifications.`;
    case 'presentation-attribute':
      if (n === 'evalAttributes' || n === 'evalAttribute') return `Presentation evaluator \`${n}\`.${detail} ${CALC_GRAMMAR}`;
      if (r.extra.kind === 'selector-attribute') return `Selector attribute \`${n}\`: consumed by CellView outside the presentation-attribute registry to resolve the magnet, event source, highlighter target or port container for a selector; it does not itself paint.`;
      if (n === 'use-no-break-space') return 'Presentation option `use-no-break-space`: when true inside text attributes, spaces are preserved as non-breaking spaces during text wrapping/measurement of the owning text attribute.';
      return `Presentation attribute \`${n}\`${r.extra.alias ? ' (bracket-assigned alias of its -keep-gradient/-reset-offset or base variant)' : ''}: when set in a cell's selector attributes it is evaluated against the element's reference bounding box (calc(...) values through the calc evaluator) and applied to the target node following the "${n}" rule, and re-evaluated when the geometry changes. ${CALC_GRAMMAR}`;
    case 'core-config':
      return `\`${r.key}\`.${sig}${doc} Global JointJS setting: reading or setting it changes the library-wide default (merging, selectors, theme, capability tests or version reporting) for all subsequently created graphs, papers and cells.`;
    case 'alg':
      return `\`alg.${n}\` (upstream-flagged internal, consumed by @joint/router-avoid): given the two path ends with their bounding boxes, margins and exit sides, it computes the right-angled path points between them, including any required detour around an end's box.`;
    case 'package':
      return `Monorepo package \`${n}\` ${r.extra.version} (${r.extra.license}): the installable unit at ${r.extra.dir}. Its public entry point provides the package's documented diagram capability to applications that depend on it.`;
    case 'package-api':
      if (r.extra.package === '@joint/router-avoid' && n.startsWith('RouterService')) return `\`@joint/router-avoid\` \`${n}\`${r.extra.kind ? ` (${r.extra.kind})` : ''}.${sig}${doc} Part of the RouterService obstacle-routing lifecycle (start/stop/destroy, one-shot routeAll/routeSubgraph, isStarted/changeFlag state, on/off/trigger events link:routing, link:routed, link:routing:cancelled, idle). The underlying libavoid engine is LGPL-2.1+ and is never ported (see the spec licence section).`;
      return `\`${r.extra.package}${r.extra.subpath || ''}\` export \`${n}\`${r.extra.kind ? ` (${r.extra.kind})` : ''}.${sig}${doc} Public capability of that package entry point, usable by an application importing it.${r.extra.kind === 'type' ? ' Type-only export: parity is a type-shape contract checked by typecheck, with no runtime oracle.' : ''}`;
    case 'catalog-app':
      return `Catalogue application "${n}" (${r.extra.licenseMarker}; catalogue coverage: ${r.extra.catalogueCoverage}). It exercises: ${(r.extra.capabilities || []).join('; ') || 'no mapped capability'}. Catalogue statement of our current state: ${r.extra.currentEquivalent}`;
    default:
      return `\`${n}\`: the observable behaviour named "${n}" in its family.${sig}`;
  }
}
function acceptanceFor(r) {
  const n = r.name;
  const label = r.extra.signature ? `\`${r.key}\` (${r.extra.signature})` : `\`${r.key}\``;
  switch (r.family) {
    case 'router': case 'connector': case 'anchor': case 'link-anchor': case 'connection-point': case 'layout-port': case 'layout-port-label': case 'geometry': case 'alg':
      return `Differential geometry oracle for ${label}: run identical fixed inputs (boxes, points, vertices, options from the behaviour contract, including its stated defaults and rounding rule) through JointJS (@joint/core ${JOINT_VERSION}) and our implementation; assert returned points/path samples match under the per-function tolerance of the spec harness section (the function's own rounding reproduced first, residual <=1e-6 world units; integers exact), including one rotated-element case and one degenerate coincident-points case.`;
    case 'dia-api': case 'mvc':
      return `Differential model oracle for ${label}: apply the same operation sequence to a JointJS graph and to our diagram-core state (via transactions with the JointJS-to-Effect projection of the spec); assert the serialised model, the returned value or rejection and the projected effect/event sequence match, including one invalid-input case that must be rejected without partial state change.`;
    case 'paper-option': case 'event':
      return `Differential interaction oracle for ${label}: build the same paper and scripted pointer/option sequence in JointJS and in our diagram-canvas plus renderer harness (playwright-core, headless Chrome); assert the emitted event sequence, the camera/scene result and the model result match, with pointer coordinates compared after the shared world transform.`;
    case 'highlighter': case 'link-tool': case 'element-tool':
      return `Differential interaction oracle for ${label}: script the same hover, drag and release sequence in JointJS and in our implementation; assert the intermediate overlay (handle positions or highlight geometry, within 1 device pixel) and the final link or element model match.`;
    case 'shape': case 'presentation-attribute':
      return `Differential rendering oracle for ${label}: create the same cell JSON in JointJS and in our implementation; assert the model echo, the computed geometry (within 1e-6 world units after the stated rounding) and, where pixels are compared, the golden capture within the harness tolerance; text cases use the shared fitted-label measurement and the multi-line breakText contract.`;
    case 'vectorizer': case 'util': case 'core-config':
      return `Differential unit oracle for ${label}: run the same inputs through the JointJS helper and our replacement; assert deep equality of the returned values (exact for strings and integers, 1e-9 for floats), including one edge input (empty, missing or boundary value). SVG-node cases compare the resulting serialised node, not the live DOM identity; DOM-coupled members without a pure contract are harness-excluded per the spec.`;
    case 'connection-strategy':
      return `Differential drop oracle for ${label}: script the same link-end drop (element, port and link targets) in JointJS and in our implementation; assert the rewritten end definition (anchor name and arguments, percentages rounded to 3 decimals where the contract states it) and the final link model match exactly.`;
    case 'package': case 'package-api':
      if (r.extra.kind === 'type') return `Typecheck-only oracle for ${label}: assert the exported type shape compiles against the same consumer fixture on both sides; no runtime differential oracle exists for a type-only export.`;
      return `Differential package oracle for ${label}: run the entry scenario named by this entry on the same input graph in JointJS and in our implementation; assert the resulting positions, routes or rendered model match under the family tolerance of the spec. Tooling-only packages assert the exported names and their configuration shape instead.`;
    case 'catalog-app':
      return `Capability scenario (not a pixel clone) for "${n}": for each mapped capability, run the corresponding family oracle from this inventory; the application counts as covered only when every mapped capability it exercises is covered. ${r.extra.licenseMarker === 'JointJS+' ? 'JointJS+ row (greenfield GD-M5-APPS tracking, excluded from the parity denominator): behaviour is specified from the public catalogue description only; no JointJS+ code or asset is used and exact interaction fidelity is unverified (unknown), with no differential oracle.' : 'Open-source row: the same scenario is also run against the public demo behaviour where it can be observed without copying code; third-party dependencies named in the spec must be replaced, not shipped.'}`;
    default:
      return `Differential oracle for ${label}: run the same inputs through JointJS (@joint/core ${JOINT_VERSION}) and our implementation and assert the observable results match.`;
  }
}

// Status assessment against our current stack. `covered` is reserved for
// the same observable input → output contract; `partial` means a contract
// analogue exists with different shape or coverage; `missing` means none.
function assess(r, target) {
  const { family, name, extra } = r;
  const covered = (needle, note) => ({ status: 'covered', proof: foundProof(needle, note) || gapProof(target) });
  const partial = (needle, note) => {
    const p = foundProof(needle, note);
    return p ? { status: 'partial', proof: p } : { status: 'missing', proof: gapProof(target) };
  };
  const missing = () => ({ status: 'missing', proof: gapProof(target) });
  const missingWith = (relFile, needle, note) => ({ status: 'missing', proof: proofInFile(relFile, needle, note) });
  const partialWith = (relFile, needle, note) => ({ status: 'partial', proof: proofInFile(relFile, needle, note) });
  if (family === 'geometry') {
    // g.Rect.containsPoint is closed (<= on all sides, no normalisation) while
    // diagram-canvas is normalised half-open: an analogue exists, the edge
    // contract differs, so this is partial, not covered.
    if (extra.owner === 'Rect' && name === 'containsPoint') return partial('export function rectContainsPoint', 'diagram-canvas rectContainsPoint is the analogue predicate but uses the normalised half-open convention (x<=p.x<x+width); JointJS g.Rect.containsPoint is closed (<= on all sides) without normalisation, so right/bottom-edge and negative-extent cases diverge.');
    if (extra.owner === 'Segment') return missing();
    if (extra.owner === 'Rect' && name === 'union') return covered('export function rectUnion', 'diagram-canvas rectUnion implements the same smallest-enclosing-rect result for normalised rects.');
    if (extra.owner === 'Rect' && name === 'center') return covered('export function rectCenter', 'diagram-canvas rectCenter returns the same centre point for normalised rects.');
    if (/intersect|distance|closest|bbox|contains|equals|clone|toJSON|serialize/.test(name)) {
      return partial('export function rectsIntersect', 'diagram-canvas geometry and graph render-geometry implement related predicates and measures over plain points and rects, but there is no g.* geometry kernel with JointJS signatures or shape coverage.');
    }
    return missing();
  }
  if (family === 'dia-api') {
    const o = extra.owner;
    if (extra.kind === 'enum') return missing();
    if (/transition/.test(name)) return missing();
    // Link labels have no analogue: diagram-canvas excludes labels from the
    // scene (they need text measurement) and gitflow labels place node pills,
    // never edge labels.
    if (o === 'Link' && /^(label|labels|appendLabel|insertLabel|removeLabel)$/.test(name)) {
      return missingWith('packages/diagram-canvas/src/scene.ts', 'NOT here', 'No edge-label analogue: SceneFrame holds no labels (scene.ts states labels are NOT here) and graph gitflow labels place branch-node pills, never link labels.');
    }
    if (o === 'Paper' && name === 'findViewsInArea') {
      return partialWith('packages/diagram-canvas/src/hit.ts', 'export function hitTestRegion', 'diagram-canvas hitTestRegion answers the region query over SceneFrame items; JointJS findViewsInArea returns ElementViews whose getBBox intersects (or is contained with opt.strict) the rect, so the view-returning contract is only partially matched.');
    }
    if (MODEL_CLASSES.has(o)) {
      return partial('COMMAND_KINDS', 'diagram-core holds the semantic document (entities, relations, ports, views, occurrences) and applies 18 transactional commands with inverses; JointJS Cell attribute bags, embedding, and view geometry have no one-to-one counterpart, so every model member is at most partial.');
    }
    if (o === 'Paper') {
      if (/^(render|updateViews|scale|translate|transform|setDimensions|getComputedSize|clientToLocal|localToPaper|paperToLocal|find|fitToContent|getFitToContentArea|transformToFitContent|freeze|unfreeze|isFrozen|drawBackground|setGrid|getGrid|setOrigin|getOrigin)/.test(name)) {
        return partial('export function buildScene', 'diagram-canvas builds a SceneFrame (camera transform, paint order, hit regions) and @sentropic/graph renders buffers with fitView/setCamera; there is no Paper object, no SVG layers, and no async view scheduling, so the analogue is partial.');
      }
      return missing();
    }
    if (o === 'CellViewGeneric' && /highlight|unhighlight/.test(name)) {
      return partial('haloMask', '@sentropic/graph style buffers carry a per-node selection halo mask; there is no CellView highlighter lifecycle, so the analogue is partial.');
    }
    if (/findNode|findMagnet|getBBox|getNodeBBox/.test(name) && /View/.test(o)) {
      return partial('export function hitTest(', 'diagram-canvas hitTest/hitTestRegion answer point and region queries over the scene; JointJS view-node and magnet queries over live SVG have no equivalent, so the analogue is partial.');
    }
    return missing();
  }
  if (family === 'paper-option') {
    if (['width', 'height', 'background', 'gridSize', 'defaultRouter', 'defaultConnector', 'defaultAnchor', 'defaultLinkAnchor', 'defaultConnectionPoint', 'connectionStrategy'].includes(name)) {
      return partial('export interface GraphRendererOptions', 'Our stack has renderer options, a camera, and scene defaults, but no Paper options object; defaults for routing and connection exist only as fixed scene behaviour, so the analogue is partial.');
    }
    return missing();
  }
  if (family === 'event') {
    if (/^(render:done|render:idle|translate|scale|transform|resize)$/.test(name)) {
      return partial('export interface GraphRendererSnapshot', 'The graph renderer reports snapshots and the layout client reports outcomes; there is no Paper render-event bus, so the analogue is partial.');
    }
    if (/^(change|batch:|add$|remove$|reset$|sort$|update$|invalid$)/.test(name) || name.startsWith('<prefix>') || name.startsWith('change:')) {
      return partial('export function applyTransaction', 'diagram-core transactions return effects and a logical inverse and reject atomically; there is no subscribable change or batch event bus, so the analogue is partial.');
    }
    return missing();
  }
  if (family === 'router') {
    if (name === 'metro') return partial('export function octilinearEdgeGeometry', 'graph render-geometry implements an octilinear (45-degree) edge route and a metro layout; it is a per-edge render style over known positions, not a per-link router over anchors and vertices, so the analogue is partial.');
    return missing();
  }
  if (family === 'connector') {
    if (name === 'normal' || name === 'straight') return partial('export function buildEdgePolylinePositions', 'graph edge-geometry builds straight polylines from positions; it emits typed buffers, not SVG path strings, and has no corner or jump handling, so the analogue is partial.');
    if (name === 'curve') return partial('buildEdgePolylinePositions', 'graph edge-geometry supports an arc curve mode over known positions; JointJS curve tangents and direction options have no counterpart, so the analogue is partial.');
    return missing();
  }
  if (family === 'anchor') {
    if (['top', 'bottom', 'left', 'right'].includes(name)) {
      return partial('export function portAnchorPoint', 'diagram-canvas portAnchorPoint computes a side anchor point on an owner rect from a normalised position; JointJS anchors also handle magnets, rotation, percentages, and calc expressions, so the analogue is partial.');
    }
    return missing();
  }
  if (family === 'layout-port') {
    if (['left', 'right', 'top', 'bottom'].includes(name)) {
      return partial('export function portAnchorPoint', 'diagram-canvas places port occurrences on owner-rect sides; JointJS port-group layouts (spacing, ellipse, line, absolute) have no counterpart, so the analogue is partial.');
    }
    return missing();
  }
  if (family === 'shape') {
    if (['Circle', 'Rectangle', 'Ellipse', 'Polygon', 'HeaderedRectangle', 'TextBlock', 'Link'].includes(name)) {
      return partial('export function shapeCode', '@sentropic/graph renders a fixed glyph set (dot, circle, diamond, star, hexagon, box, square, rounded box, triangle) and box labels; JointJS standard shapes carry markup, selectors, and per-part attributes with no counterpart, so the analogue is partial.');
    }
    return missing();
  }
  if (family === 'highlighter') {
    if (r.key === 'stroke') return partialWith('packages/graph/src/webgl-shapes.ts', 'export function haloFalloffAt', 'The WebGL halo (haloFalloffAt and the instanced halo pass in webgl-shapes.ts) renders a radial selection outline around nodes; JointJS stroke highlighting follows the exact SVG node shape or link path with padding/rx/ry, so the analogue is partial.');
    return missing();
  }
  if (family === 'util') {
    if (name === 'breakText') return partial('export function fitLabelToWidth', 'graph gitflow-labels fits and measures label text approximately; JointJS breakText performs SVG-aware multi-line breaking with annotations, so the analogue is partial.');
    return missing();
  }
  if (family === 'vectorizer') {
    if (/transformPoint|transformRect|transformLine|transformPolyline/.test(name) || (extra.owner === 'VElement' && /^(transform|translate|rotate|scale)$/.test(name))) {
      return partial('export function applyPoint', 'diagram-canvas Affine compose/apply/invert and graph mat4 implement matrix application to points and rects; the SVG-node transform API has no counterpart, so the analogue is partial.');
    }
    return missing();
  }
  if (family === 'mvc') {
    if (extra.owner === 'Model' && /^(get|set|toJSON|clone|has|unset|clear)$/.test(name)) {
      return partial('export interface SemanticDocument', 'diagram-core documents are plain validated data read and written through transactions; the Backbone Model API (attributes bag, change tracking, validation hooks) has no counterpart, so the analogue is partial.');
    }
    if (extra.owner === 'Collection' && /^(add|remove|reset|get|at|toJSON)$/.test(name)) {
      return partial('COMMAND_KINDS', 'diagram-core state changes only through transactional commands; the mutable Collection API has no counterpart, so the analogue is partial.');
    }
    return missing();
  }
  if (family === 'presentation-attribute') {
    if (['text', 'text-wrap', 'title', 'source-marker', 'target-marker', 'vertex-marker'].includes(name)) {
      return partial('export function fitLabelToWidth', 'Our stack renders node and edge labels and flow-port arrowheads from buffers; JointJS selector attributes, markers as SVG defs, and text wrapping have no counterpart, so the analogue is partial.');
    }
    return missing();
  }
  if (family === 'package') {
    if (name === '@joint/layout-directed-graph') {
      return missingWith('docs/graph-dataviz-reference-catalog.md', 'org.eclipse.elk.layered', 'No Sugiyama/DirectedGraph analogue: graph typed-layer only groups nodes by type string and never reads edges; the catalogue records typed-layer as not covered for Sugiyama. The DirectedGraph (dagre) ranking, ordering, coordinate and cluster contract is missing.');
    }
    if (name === '@joint/layout-msagl') {
      return partial('computeLayout', '@sentropic/graph processing computes force-fa2 and hierarchy-aware positions and the root registry offers grid, radial, metro, git-flow, and typed-layer layouts; neither the dagre nor the MSAGL Sugiyama algorithm is present, so the analogue is partial.');
    }
    if (name === '@joint/shapes-general') {
      return partial('export function shapeCode', 'A few general figures overlap the graph glyph set; the shapes-general element types, markup, and tools have no counterpart, so the analogue is partial.');
    }
    if (name === '@joint/core') {
      return partial('COMMAND_KINDS', 'Our stack covers fragments of the core contract across diagram-core, diagram-canvas, and graph (see the per-family rows); the library as a whole is not covered, so the package row is partial.');
    }
    return missing();
  }
  if (family === 'package-api') {
    if (extra.package === '@joint/layout-directed-graph') {
      return missingWith('docs/graph-dataviz-reference-catalog.md', 'org.eclipse.elk.layered', 'No DirectedGraph analogue: computeTypedLayerPositions(nodeTypes) takes no edges and only buckets nodes by type string; the dagre Sugiyama contract (ranks, in-layer order, coordinates, edge vertices, clusters over a dia.Graph) is missing, and the catalogue records typed-layer as not covered for Sugiyama.');
    }
    if (extra.package === '@joint/layout-msagl' && name === 'layout') {
      return partial('computeHierarchyAwarePositions', 'graph hierarchy-aware layout computes layered positions; the MSAGL Sugiyama pipeline, edge routing, and cluster handling have no counterpart, so the analogue is partial.');
    }
    return missing();
  }
  if (family === 'catalog-app') {
    const p = { path: 'docs/graph-dataviz-reference-catalog.json', line: r.line, note: `Existing catalogue row for this application; catalogue coverage: ${extra.catalogueCoverage}. ${extra.currentEquivalent}` };
    return extra.catalogueCoverage === 'partial'
      ? { status: 'partial', proof: p }
      : { status: 'missing', proof: p };
  }
  return missing();
}

export function buildEntries() {
  const raw = extractRaw();
  const usedIds = new Set();
  const entries = [];
  for (const r of raw.values()) {
    const target = targetFor(r);
    const { status, proof } = assess(r, target);
    let id = `jointjs:${r.family}:${slug(r.key)}`;
    if (usedIds.has(id)) {
      let i = 2;
      while (usedIds.has(`${id}-${i}`)) i++;
      id = `${id}-${i}`;
    }
    usedIds.add(id);
    const source = r.family === 'catalog-app'
      ? `docs/graph-dataviz-reference-catalog.json:${r.line}`
      : `${repoRel(r.sourceAbs)}:${r.line}`;
    const entry = {
      id,
      family: r.family,
      name: r.name,
      source,
      behaviour: behaviourFor(r),
      acceptance: acceptanceFor(r),
      target,
      status,
      proof,
      priority: priorityFor(r, target),
    };
    if (r.extra.owner) entry.owner = r.extra.owner;
    if (r.extra.kind) entry.kind = r.extra.kind;
    if (r.extra.signature) entry.signature = r.extra.signature;
    if (r.extra.enumMembers) entry.enumMembers = r.extra.enumMembers;
    if (r.extra.subpath) entry.subpath = r.extra.subpath;
    if (r.extra.alias) entry.alias = true;
    if (r.extra.dynamic) entry.dynamic = true;
    if (r.extra.deprecated) entry.deprecated = true;
    if (r.extra.internal) entry.internal = true;
    if (r.family === 'package') {
      entry.packageVersion = r.extra.version;
      entry.license = r.extra.license;
      entry.packagePrivate = r.extra.private;
    }
    if (r.family === 'package-api') entry.package = r.extra.package;
    if (r.family === 'catalog-app') {
      entry.licenseMarker = r.extra.licenseMarker;
      entry.catalogueCoverage = r.extra.catalogueCoverage;
      entry.capabilities = r.extra.capabilities;
      entry.tags = r.extra.tags;
      entry.referenceUrl = r.extra.referenceUrl;
    }
    entries.push(entry);
  }
  entries.sort((a, b) => a.id.localeCompare(b.id));
  return entries;
}

const COUNTING_CONVENTIONS = {
  'dia-api': 'Distinct public/protected member names per export class in types/dia.d.ts via the TypeScript AST (generic methods and required properties included, [Symbol.iterator] included); overloads collapsed; private and underscore-prefixed excluded; inherited members counted on the declaring class only; plus the namespace enums CellView.Highlighting, ElementView.Flags, LinkView.Flags, Paper.sorting, Paper.Layers (one entry per enum).',
  'paper-option': 'Declared property fields of the Paper.Options interface in types/dia.d.ts via AST; inherited mvc.ViewOptions fields excluded.',
  event: 'Union of dia.Paper.EventMap keys, trigger() literals in src/**, and dynamic change:/eventPrefix patterns (flagged dynamic).',
  router: 'Keys of RouterArgumentsMap in types/routers.d.ts, plus routers.rightAngle.Directions (RightAngleDirections enum, one entry).',
  connector: 'Keys of ConnectorArgumentsMap in types/connectors.d.ts, plus connectors.curve.Directions and connectors.curve.TangentDirections (one entry per enum).',
  anchor: 'export const names in src/anchors/index.mjs.',
  'link-anchor': 'Exported anchor names in src/linkAnchors/index.mjs (resolveRef helper excluded).',
  'connection-point': 'export const names in src/connectionPoints/index.mjs.',
  'connection-strategy': 'export const names in src/connectionStrategies/index.mjs.',
  highlighter: 'export const names in src/highlighters/*.mjs, plus declared members of the highlighter classes and the list.Directions/list.Positions enums in types/highlighters.d.ts.',
  'link-tool': 'Export classes in types/linkTools.d.ts (top-level plus nested handle classes such as Vertices.VertexHandle), plus their declared members (constructors excluded).',
  'element-tool': 'Export classes in types/elementTools.d.ts (top-level plus nested classes), plus their declared members (constructors excluded).',
  shape: 'export class names in types/shapes-standard.d.ts (standard.*), plus their declared members (e.g. Cylinder.topRy; constructors excluded).',
  'layout-port': 'export var names under the Port namespace of types/layout.d.ts.',
  'layout-port-label': 'export var names under the PortLabel namespace of types/layout.d.ts.',
  geometry: 'Distinct declared member names per export class in types/geometry.d.ts via AST, plus the g.Segment interface members, the g.types enum (one entry), standalone functions and bezier/scale/intersection namespace members.',
  vectorizer: 'VElement member names plus VStatic interface members (prefix V.) and the V callable signature, in types/vectorizer.d.ts via AST.',
  util: 'export function/var names in types/util.d.ts, including timing/interpolate/filter/format namespace members.',
  mvc: 'Distinct declared member names per export class in types/mvc.d.ts via AST, plus Data (with its JS methods has/create/get/set/remove) and the single $ facade entry from src/mvc/index.mjs.',
  'presentation-attribute': 'Top-level keys of the attribute namespaces in src/dia/attributes/*.mjs, plus bracket-assigned aliases (ref-d, ref-points, at-connection-*, refX/refY/ref-*2/ref-r), the calc evaluator (evalAttributes, evalAttribute), use-no-break-space, the five CellView selector attributes (event, magnet, magnetSelector, highlighterSelector, containerSelector) and the props shorthand.',
  'core-config': 'Keys of src/config/index.mjs, plus env.addTest, env.test, setTheme, version.',
  alg: 'The exported rightAnglePath function of types/alg.d.ts (upstream-flagged internal).',
  package: 'Directories of packages/* in the monorepo carrying a package.json.',
  'package-api': 'Entry-point exports per package (see the enumerate.mjs header), including @joint/router-avoid RouterService with its members and events and the @joint/react subpath ./internal; @joint/core excluded.',
  'catalog-app': 'Rows of jointjs_apps_and_recipes in docs/graph-dataviz-reference-catalog.json (186 rows tracked; the 109 JointJS+ rows are greenfield GD-M5-APPS tracking excluded from the parity denominator).',
};

function main() {
  const entries = buildEntries();
  const byFamily = {};
  const byStatus = { covered: 0, partial: 0, missing: 0 };
  const byTarget = {};
  const byPriority = {};
  for (const e of entries) {
    byFamily[e.family] = (byFamily[e.family] || 0) + 1;
    byStatus[e.status]++;
    byTarget[e.target] = (byTarget[e.target] || 0) + 1;
    byPriority[e.priority] = (byPriority[e.priority] || 0) + 1;
  }
  const demoPlus = entries.filter((e) => e.family === 'catalog-app' && e.licenseMarker === 'JointJS+').length;
  const parityEntries = entries.filter((e) => !(e.family === 'catalog-app' && e.licenseMarker === 'JointJS+'));
  const parityByStatus = { covered: 0, partial: 0, missing: 0 };
  for (const e of parityEntries) parityByStatus[e.status]++;
  const doc = {
    schema_version: 2,
    generated_at: GENERATED_AT,
    generator: 'tools/re-jointjs/enumerate.mjs',
    jointjs: {
      package: '@joint/core',
      version: JOINT_VERSION,
      commit: JOINT_COMMIT,
      source_root: '.ds-scrap/re-sources/joint',
      licence: 'MPL-2.0 (@joint/core and most monorepo packages; @joint/cli and @joint/eslint-config are MIT; JointJS+ is commercial and has no source in this checkout)',
    },
    target_stack: {
      graph: '@sentropic/graph 0.3.0 (packages/graph)',
      diagramCore: '@sentropic/diagram-core 0.1.0, private (packages/diagram-core)',
      diagramCanvas: '@sentropic/diagram-canvas 0.1.0, private (packages/diagram-canvas)',
    },
    counting_conventions: COUNTING_CONVENTIONS,
    counts: { total: entries.length, byFamily, byStatus, byTarget, byPriority, parityTotal: parityEntries.length, parityByStatus, demoPlusTracked: demoPlus },
    entries,
  };
  const outPath = join(wtRoot, 'docs', 're', 'jointjs-inventory.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(doc, null, 2) + '\n');
  console.log(`wrote ${wtRel(outPath)}: ${entries.length} entries`);
  console.log(`byStatus: covered=${byStatus.covered} partial=${byStatus.partial} missing=${byStatus.missing}`);
  for (const [k, v] of Object.entries(byFamily).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
