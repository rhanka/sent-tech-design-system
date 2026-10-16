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
  // Header only: when the node carries an implementation body (the
  // RouterService .mts surface), cut the text at the body so the stored
  // signature never contains implementation statements.
  const start = node.getStart(sf);
  const end = node.body ? node.body.getStart(sf) : node.end;
  let txt = sf.text.slice(start, end).replace(/\s+/g, ' ').trim();
  txt = txt.replace(/[;{]\s*$/, '').trim();
  if (txt.length > 420) txt = txt.slice(0, 417) + '...';
  return txt;
}
function astJsDoc(sf, node) {
  const docs = ts.getJSDocCommentsAndTags(node) || [];
  for (const d of docs) {
    if (ts.isJSDoc(d) && d.comment) {
      // Rebuild the comment text part by part: a JSDocLink part carries an
      // empty text and the target in `name`, so dropping it would leave
      // holes in the sentence ("i.e.  has been called"). Keep the target.
      const txt = typeof d.comment === 'string'
        ? d.comment
        : d.comment.map((p) => {
          if (ts.isJSDocLink(p) || ts.isJSDocLinkCode(p) || ts.isJSDocLinkPlain(p)) {
            return (p.text && p.text.trim()) || (p.name ? p.name.getText(sf) : '');
          }
          return p.text || '';
        }).join('');
      const clean = txt.replace(/\{@link\s+([^}|]+)(?:\|([^}]+))?\}/g, (m, target, label) => (label || target).trim()).replace(/\s+/g, ' ').trim();
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
      jsDoc: astJsDoc(sf, mem),
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
// Exported names of a JavaScript module (declarations and export blocks),
// resolved with the TypeScript AST over the .mjs source.
function parseJsExportNames(abs) {
  const sf = loadSourceFile(abs);
  const out = new Map();
  const note = (name, node) => { if (name && !out.has(name)) out.set(name, astLine(sf, node)); };
  for (const stmt of sf.statements) {
    if (ts.isExportDeclaration(stmt) && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
      for (const el of stmt.exportClause.elements) note(el.name.text, stmt);
    } else if ((ts.isClassDeclaration(stmt) || ts.isFunctionDeclaration(stmt)) && stmt.name && astHasModifier(stmt, ts.SyntaxKind.ExportKeyword)) {
      note(stmt.name.text, stmt);
    } else if (ts.isVariableStatement(stmt) && astHasModifier(stmt, ts.SyntaxKind.ExportKeyword)) {
      for (const decl of stmt.declarationList.declarations) if (ts.isIdentifier(decl.name)) note(decl.name.text, stmt);
    }
  }
  return out;
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
  // dia.sortingTypes: the runtime values object behind the Paper.sorting
  // type, exported at the top level of the dia namespace
  // (src/dia/Paper.mjs re-exported through src/dia/index.mjs). The typed
  // Paper.sorting enum above is the same contract in type form; this row
  // covers the runtime object applications read as dia.sortingTypes.
  {
    const paperSrc = S('dia/Paper.mjs');
    add('dia-api', 'sortingTypes', 'sortingTypes', paperSrc, findLine(paperSrc, 'export const sortingTypes'),
      { kind: 'enum', enumMembers: ['NONE', 'APPROX', 'EXACT'], signature: 'export const sortingTypes: { NONE, APPROX, EXACT }' });
  }
  // paper-option: fields of Paper.Options (AST interface Paper.Options),
  // plus the fields it inherits from sibling interfaces declared in the
  // same file (CellVisibilityOptions, BeforeRenderOptions,
  // AfterRenderOptions on this checkout). Interfaces inherited from other
  // files (mvc.ViewOptions in types/mvc.d.ts) stay excluded.
  {
    const abs = T('dia.d.ts');
    const opts = interfaceMembers(abs, 'Paper.Options');
    if (opts) {
      for (const mem of opts.members.values()) {
        if (mem.kind !== 'property') continue;
        add('paper-option', mem.name, mem.name, abs, mem.line, { signature: mem.signature, jsDoc: mem.jsDoc });
      }
    }
    const sf = loadSourceFile(abs);
    const allIfaces = parseDtsInterfaces(abs);
    const visitOpts = (node, prefix) => {
      if (ts.isInterfaceDeclaration(node) && prefix === 'Paper' && node.name.text === 'Options') {
        for (const clause of node.heritageClauses || []) {
          if (clause.token !== ts.SyntaxKind.ExtendsKeyword) continue;
          for (const t of clause.types) {
            if (!ts.isIdentifier(t.expression)) continue;
            const parent = allIfaces.get(`Paper.${t.expression.text}`) || allIfaces.get(t.expression.text);
            if (!parent) continue; // declared in another file: excluded
            for (const mem of parent.members.values()) {
              if (mem.kind !== 'property') continue;
              add('paper-option', mem.name, mem.name, abs, mem.line, { signature: mem.signature, jsDoc: mem.jsDoc, inheritedFrom: parent.name });
            }
          }
        }
      }
      if (ts.isModuleDeclaration(node) && node.body) {
        const next = prefix ? `${prefix}.${node.name.text}` : node.name.text;
        if (ts.isModuleBlock(node.body)) for (const s of node.body.statements) visitOpts(s, next);
        else visitOpts(node.body, next);
        return;
      }
      ts.forEachChild(node, (c) => visitOpts(c, prefix));
    };
    for (const s of sf.statements) visitOpts(s, '');
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
  // anchors / link-anchors / connection points / strategies (src exports).
  // The stored source anchors on the typed declaration when one exists
  // (types/*.d.ts `export var`); a runtime-only name keeps its
  // implementation anchor.
  const typedAnchorLine = (typesRel, name) => {
    const abs = T(typesRel);
    const lines = readLines(abs);
    for (let i = 0; i < lines.length; i++) if (new RegExp(`export\\s+var\\s+${name}\\b`).test(lines[i])) return { abs, line: i + 1 };
    return null;
  };
  const addAnchorLike = (family, name, jsAbs, jsLine, typesRel) => {
    const typed = typedAnchorLine(typesRel, name);
    if (typed) add(family, name, name, typed.abs, typed.line, {});
    else add(family, name, name, jsAbs, jsLine, {});
  };
  for (const [k, v] of parseSrcConstExports(S('anchors/index.mjs'))) addAnchorLike('anchor', k, S('anchors/index.mjs'), v.line, 'anchors.d.ts');
  for (const [k, v] of parseSrcConstExports(S('linkAnchors/index.mjs'))) {
    if (k === 'resolveRef') continue; // internal resolver helper, not an anchor name
    addAnchorLike('link-anchor', k, S('linkAnchors/index.mjs'), v.line, 'linkAnchors.d.ts');
  }
  // linkAnchors uses `export { connectionRatio, connectionLength }` — catch brace exports too
  {
    const abs = S('linkAnchors/index.mjs');
    for (const line of readLines(abs)) {
      const m = line.match(/export\s*\{\s*([^}]+)\}/);
      if (m) for (const part of m[1].split(',')) {
        const n = part.trim().split(/\s+as\s+/).pop();
        if (n) addAnchorLike('link-anchor', n, abs, findLine(abs, n), 'linkAnchors.d.ts');
      }
    }
  }
  for (const [k, v] of parseSrcConstExports(S('connectionPoints/index.mjs'))) addAnchorLike('connection-point', k, S('connectionPoints/index.mjs'), v.line, 'connectionPoints.d.ts');
  for (const [k, v] of parseSrcConstExports(S('connectionStrategies/index.mjs'))) addAnchorLike('connection-strategy', k, S('connectionStrategies/index.mjs'), v.line, 'connectionStrategies.d.ts');
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
    // Runtime-only helpers: exported by the implementation modules that
    // src/util/index.mjs re-exports, with no declaration in types/util.d.ts.
    // A name counts here only when it appears nowhere in the type surface.
    const typesText = readFileSync(abs, 'utf8');
    for (const jsFile of [S('util/util.mjs'), S('util/wrappers.mjs')]) {
      for (const [name, line] of parseJsExportNames(jsFile)) {
        if (new RegExp(`\\b${name}\\b`).test(typesText)) continue;
        add('util', name, name, jsFile, line, { owner: 'util', kind: 'runtime-export' });
      }
    }
  }
  // mvc (typed classes + runtime-only Data methods; $ stays a single facade entry)
  {
    const abs = T('mvc.d.ts');
    const typedMemberNames = new Set();
    for (const cls of parseDtsClasses(abs)) {
      for (const mem of cls.members.values()) {
        typedMemberNames.add(mem.name);
        add('mvc', `${cls.name}.${mem.name}`, mem.name, abs, mem.line, { owner: cls.name, kind: mem.kind, signature: mem.signature, jsDoc: mem.jsDoc });
      }
    }
    const idx = S('mvc/index.mjs');
    add('mvc', 'Data', 'Data', idx, findLine(idx, 'Data'), { owner: 'mvc', kind: 'class' });
    add('mvc', '$', '$', idx, findLine(idx, 'Dom/index'), { owner: 'mvc', kind: 'dom-helper' });
    // Module-level exports of the mvc namespace that are not class members:
    // the Events mixin object and its event types, the global view registry,
    // and the View theme-class helpers defined only at runtime.
    add('mvc', 'Events', 'Events', abs, findLine(abs, 'export const Events'), { owner: 'mvc', kind: 'object', signature: 'export const Events: Events' });
    add('mvc', 'Event', 'Event', abs, findLine(abs, 'MVCEvent as Event'), { owner: 'mvc', kind: 'type', signature: 'export { MVCEvent as Event }' });
    add('mvc', 'TriggeredEvent', 'TriggeredEvent', abs, findLine(abs, 'interface TriggeredEvent'), { owner: 'mvc', kind: 'type', signature: 'export interface TriggeredEvent' });
    const viewSrc = S('mvc/View.mjs');
    add('mvc', 'views', 'views', viewSrc, findLine(viewSrc, 'export const views'), { owner: 'mvc', kind: 'registry', signature: 'export const views: { [cid: string]: View }' });
    {
      const sf = loadSourceFile(viewSrc);
      const visitView = (node) => {
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'extend'
          && node.arguments.length > 0 && ts.isObjectLiteralExpression(node.arguments[0])) {
          for (const prop of node.arguments[0].properties) {
            const memberName = prop.name && (ts.isIdentifier(prop.name) || ts.isStringLiteralLike(prop.name)) ? prop.name.text : null;
            if (!memberName || memberName.startsWith('_') || memberName === 'constructor') continue;
            if (typedMemberNames.has(memberName)) continue; // already counted on its typed class
            if (!ts.isMethodDeclaration(prop) && !ts.isPropertyAssignment(prop)) continue;
            add('mvc', `View.${memberName}`, memberName, viewSrc, astLine(sf, prop),
              { owner: 'View', kind: 'method', signature: astSignature(sf, prop) });
          }
        }
        ts.forEachChild(node, visitView);
      };
      visitView(sf);
    }
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
      add('presentation-attribute', 'evalAttribute', 'evalAttribute', evalAbs, findLine(evalAbs, 'export function evalAttribute('), { owner: 'attributes', kind: 'function' });
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
    const jointTypes = T('joint.d.ts');
    add('core-config', 'setTheme', 'setTheme', jointTypes, findLine(jointTypes, 'function setTheme'), { owner: 'core' });
    add('core-config', 'version', 'version', jointTypes, findLine(jointTypes, 'const version'), { owner: 'core' });
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

// Entry-point exports of a TypeScript package, resolved with the AST:
// direct declarations, named export blocks (with per-specifier `type`
// modifiers) and one level of `export *` re-exports. Classes also yield
// their own declared members (constructors, private and underscore-prefixed
// members excluded). Returns [{ name, line, file, kind, memberOf }].
function collectEntryExports(indexAbs) {
  const out = [];
  const seen = new Set();
  const push = (name, file, line, kind, memberOf) => {
    const ck = memberOf ? `${memberOf}.${name}` : name;
    if (seen.has(ck)) return;
    seen.add(ck);
    out.push({ name, file, line, kind, memberOf });
  };
  const resolveTarget = (fromFile, spec) => {
    let target = join(dirname(fromFile), spec);
    if (existsSync(target) && statSync(target).isFile()) return target;
    // A './x.mjs' specifier in a .mts entry usually maps to the x.mts source.
    const swapped = target.replace(/\.m?js$/, (m) => (m === '.mjs' ? '.mts' : '.ts'));
    for (const cand of [swapped, `${target}.ts`, `${target}.tsx`, `${target}.mts`, `${target}.mjs`, `${target}.js`,
      join(target, 'index.ts'), join(target, 'index.mts'), join(target, 'index.mjs')]) {
      if (existsSync(cand)) return cand;
    }
    return null;
  };
  const collectFrom = (file, isEntry) => {
    if (!existsSync(file)) return;
    const sf = loadSourceFile(file);
    for (const stmt of sf.statements) {
      if (ts.isExportDeclaration(stmt) && !stmt.exportClause && stmt.moduleSpecifier) {
        if (!isEntry) continue; // one level of export * only
        const target = resolveTarget(file, stmt.moduleSpecifier.text);
        if (target) collectFrom(target, false);
        continue;
      }
      if (ts.isExportDeclaration(stmt) && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        for (const el of stmt.exportClause.elements) {
          const kind = (stmt.exportClause.isTypeOnly || el.isTypeOnly) ? 'type' : 'runtime';
          push(el.name.text, file, astLine(sf, stmt), kind);
        }
        continue;
      }
      const exported = stmt.modifiers && stmt.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (!exported) continue;
      if (ts.isClassDeclaration(stmt) && stmt.name) {
        push(stmt.name.text, file, astLine(sf, stmt), 'class');
        for (const mem of collectAstMembers(sf, stmt.members).values()) {
          if (mem.kind === 'constructor') continue;
          const entry = { name: mem.name, file, line: mem.line, kind: mem.kind, memberOf: stmt.name.text };
          const ck = `${stmt.name.text}.${mem.name}`;
          if (!seen.has(ck)) { seen.add(ck); out.push({ ...entry, signature: mem.signature, jsDoc: mem.jsDoc }); }
        }
      } else if (ts.isInterfaceDeclaration(stmt) || ts.isTypeAliasDeclaration(stmt)) {
        push(stmt.name.text, file, astLine(sf, stmt), 'type');
      } else if (ts.isEnumDeclaration(stmt)) {
        push(stmt.name.text, file, astLine(sf, stmt), 'enum');
      } else if (ts.isFunctionDeclaration(stmt) && stmt.name) {
        push(stmt.name.text, file, astLine(sf, stmt), 'runtime');
      } else if (ts.isVariableStatement(stmt)) {
        for (const decl of stmt.declarationList.declarations) if (ts.isIdentifier(decl.name)) push(decl.name.text, file, astLine(sf, stmt), 'runtime');
      }
    }
  };
  collectFrom(indexAbs, true);
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
    // A specifier may carry its own `type` modifier inside a value export
    // block (`export { createAtom, type Atom }`): keep that distinction
    // per specifier instead of dropping it.
    const specifierIsType = /^type\s+/.test(part.trim());
    const t = part.trim().replace(/^type\s+/, '');
    if (!t) continue;
    const name = t.split(/\s+as\s+/).pop().trim();
    if (name && !out.has(name)) out.set(name, { name, line: block.line, kind: (block.isType || specifierIsType) ? 'type' : 'runtime', file: abs });
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
  // MSAGL entry-point: the layout function plus everything the entry
  // re-exports from its types and enums modules (Options, LayoutResult,
  // LayerDirectionEnum, EdgeRoutingMode).
  {
    const idx = P('joint-layout-msagl/src/index.mts');
    for (const v of collectEntryExports(idx)) {
      if (v.memberOf) continue;
      add('package-api', `@joint/layout-msagl:${v.name}`, v.name, v.file, v.line,
        { package: '@joint/layout-msagl', ...(v.kind === 'type' ? { kind: 'type' } : {}) });
    }
  }
  // router-avoid: the package entry point (src/index.mts) is the public
  // surface: its exported names, and only those, become rows. Types that
  // RouterService.mts declares without re-exporting them from the entry
  // point are internal and get no row.
  {
    const idx = P('joint-router-avoid/src/index.mts');
    const svc = P('joint-router-avoid/src/RouterService.mts');
    for (const v of parseIndexExportNames(idx).values()) {
      if (v.name === 'RouterService') continue; // the class row below, with its members
      add('package-api', `@joint/router-avoid:${v.name}`, v.name, idx, v.line, { package: '@joint/router-avoid', kind: v.kind });
    }
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
    }
  }
  // shapes-general + shapes-general-tools: every name the entry point
  // re-exports (classes, option/result types, functions), plus the own
  // declared members of each exported class.
  for (const [pkg, label] of [['joint-shapes-general', '@joint/shapes-general'], ['joint-shapes-general-tools', '@joint/shapes-general-tools']]) {
    const idx = P(`${pkg}/src/index.ts`);
    if (!existsSync(idx)) continue;
    for (const v of collectEntryExports(idx)) {
      if (v.memberOf) {
        add('package-api', `${label}:${v.memberOf}.${v.name}`, `${v.memberOf}.${v.name}`, v.file, v.line, { package: label, kind: v.kind, signature: v.signature, jsDoc: v.jsDoc });
      } else {
        add('package-api', `${label}:${v.name}`, v.name, v.file, v.line,
          { package: label, ...(v.kind === 'type' ? { kind: 'type' } : {}) });
      }
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
      // `export * from './state/data-mapping/...'` in internal.ts: resolve
      // one level, including the exported mapper types.
      for (const v of collectEntryExports(internal)) {
        if (v.memberOf) continue;
        add('package-api', `@joint/react/internal:${v.name}`, v.name, v.file, v.line,
          { package: '@joint/react', subpath: '/internal', kind: v.kind === 'type' ? 'type' : 'runtime' });
      }
    }
  }
  // decorators factories and their option types
  {
    const idx = P('joint-decorators/src/index.ts');
    if (existsSync(idx)) {
      for (const v of collectEntryExports(idx)) {
        if (v.memberOf) continue;
        add('package-api', `@joint/decorators:${v.name}`, v.name, v.file, v.line,
          { package: '@joint/decorators', ...(v.kind === 'type' ? { kind: 'type' } : {}) });
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
// The calc-evaluated attribute names, read from the pinned evaluator source
// (src/dia/attributes/eval.mjs) at generation time instead of being restated
// here: only these attributes have their calc(...) values evaluated.
const CALC_ATTRIBUTES = (() => {
  try {
    const text = readFileSync(join(coreRoot, 'src', 'dia', 'attributes', 'eval.mjs'), 'utf8');
    const m = text.match(/calcAttributesList\s*=\s*\[([\s\S]*?)\]/);
    if (!m) return new Set();
    return new Set([...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]));
  } catch { return new Set(); }
})();
// Verified per-name contracts for the compact algorithmic families. Fields
// and defaults below were read from the pinned argument interfaces
// (types/routers.d.ts, types/connectors.d.ts, types/anchors.d.ts,
// types/linkAnchors.d.ts, types/connectionPoints.d.ts, types/layout.d.ts)
// and the runtime defaults in the corresponding src modules.
Object.assign(CONTRACT_DETAILS, {
  'router:normal': 'No routing at all: the intermediate vertices are returned unchanged (the options object is empty), so the rendered connection passes through the given vertices exactly as supplied.',
  'router:orthogonal': 'Orthogonal detour around the two end elements: padding (dia.Sides; elementPadding is the legacy alias, default padding 20) expands both end bounding boxes, and the route leaves and enters orthogonally, running around the padded boxes with axis-aligned segments only.',
  'router:rightAngle': 'Right-angled route computed from the end anchors and boxes: margin clears both ends (sourceMargin/targetMargin override it per end, minPathMargin floors the clearance), sourceDirection/targetDirection select the exit and entry sides (RightAngleDirections; auto derives the side from the anchor or magnet), useVertices honours supplied vertices as via points and useModelGeometry reads model geometry instead of rendered views.',
  'router:oneSide': 'Deprecated in favour of rightAngle: every intermediate vertex is forced to one fixed side of both end elements (side: top, right, bottom or left, default bottom; an invalid side throws), offset outward by padding (default 40, normalised Sides).',
  'connector:normal': 'Plain polyline through [sourcePoint, ...routePoints, targetPoint] with straight segments and no corner treatment; raw returns the g.Path object instead of its serialised string.',
  'connector:rounded': 'Polyline whose interior corners are rounded: delegates to the straight connector with cornerType cubic and cornerRadius = radius (default 10), precision 0; raw returns the g.Path instead of the serialised string.',
  'connector:smooth': 'Smooth curve through [sourcePoint, ...routePoints, targetPoint] rendered as cubic Bezier segments interpolated across the points (no corner rounding and no direction options); raw returns the g.Path instead of its serialised string.',
  'connector:jumpover': 'Polyline that hops over crossing links of the same paper: at each crossing it inserts a jump of size (default 5) drawn as arc, gap or cubic (jump option, default arc), optionally rounding the jump ends with radius (default 0); crossings too close to a segment end are drawn straight instead; raw returns the g.Path.',
  'anchor:center': 'The centre of the end element bounding box (or of the magnet node box), shifted by dx/dy (numbers, percentages of the box, or calc expressions against the box); rotate counter-rotates the point around the element centre for rotated elements, and useModelGeometry reads the model/port box instead of the rendered node.',
  'anchor:top': 'The middle of the top side of the end bounding box, with the dx/dy offset and rotate rules of the bbox anchor family.',
  'anchor:bottom': 'The middle of the bottom side of the end bounding box, with the dx/dy offset and rotate rules of the bbox anchor family.',
  'anchor:left': 'The middle of the left side of the end bounding box, with the dx/dy offset and rotate rules of the bbox anchor family.',
  'anchor:right': 'The middle of the right side of the end bounding box, with the dx/dy offset and rotate rules of the bbox anchor family.',
  'anchor:topLeft': 'The top-left corner (origin) of the end bounding box, with the dx/dy offset and rotate rules of the bbox anchor family.',
  'anchor:topRight': 'The top-right corner of the end bounding box, with the dx/dy offset and rotate rules of the bbox anchor family.',
  'anchor:bottomLeft': 'The bottom-left corner of the end bounding box, with the dx/dy offset and rotate rules of the bbox anchor family.',
  'anchor:bottomRight': 'The bottom-right corner (corner point) of the end bounding box, with the dx/dy offset and rotate rules of the bbox anchor family.',
  'anchor:perpendicular': 'The point on the end bounding box closest to the reference point along a perpendicular: the reference coordinates are projected onto the box centre lines inside the box shrunk by padding, then corrected by the element rotation angle (a zero or right angle skips the tangent correction); rotate and useModelGeometry follow the anchor family rules.',
  'anchor:midSide': 'The middle of the box side selected by mode (auto picks the side nearest the reference point; prefer-horizontal/prefer-vertical use preferenceThreshold Sides, the *-top/bottom-top and left-right/right-left modes pick opposite sides for source and target ends), after inflating the box by padding and optionally rotating the reference point into the element frame.',
  'anchor:modelCenter': 'Resolved from the model instead of the view: the point the element model reports for the connected link end (getPointFromConnectedLink for the given end), offset by dx/dy (plain numbers only).',
  'link-anchor:connectionRatio': 'The point at ratio of the host link connection length (ratio option, default 0.5), measured along the rendered connection from its start.',
  'link-anchor:connectionLength': 'The point at length world units along the host link connection from its start (length option, default 20).',
  'link-anchor:connectionPerpendicular': 'The closest intersection of the host connection with the vertical or horizontal line through the reference point (the nearer of the two axes wins); when there is no intersection it falls back to fallbackAt along the connection, and fixedAt pins the reference resolution for element references.',
  'link-anchor:connectionClosest': 'The closest point of the host link connection to the reference point; an empty connection yields the origin point; fixedAt pins the reference resolution for element references.',
  'connection-point:anchor': 'No trimming: the rendered path end stays exactly at the link end anchor point, shifted only by the optional offset (number along the end segment or an explicit point).',
  'connection-point:bbox': 'The intersection of the end segment with the end element bounding box (stroke includes half the stroke width in the box when requested, useModelGeometry uses the model box); offset then moves the point along the segment.',
  'connection-point:rectangle': 'Like the bbox connection point but computed against the element rectangle geometry (the model box when useModelGeometry is set), honouring stroke and offset the same way.',
  'connection-point:boundary': 'The intersection of the end segment with the actual shape outline of the end node (selector picks the node subtree, precision subdivides curves, sticky keeps the previous side, extrapolate extends the segment past the end, insideout allows intersections from inside the shape); stroke and offset apply as in the bbox rule.',
  'connection-strategy:pinAbsolute': 'On drop, fixes the end to the drop coordinates: on an element it writes anchor topLeft with dx/dy as absolute offsets from the unrotated magnet box (the drop point is first rotated by -angle around the element centre) and rotate: true; on a link it writes connectionLength with the absolute length at the drop point.',
  'connection-strategy:pinRelative': 'On drop, fixes the end proportionally: on an element it writes anchor topLeft with dx/dy as percentages of the magnet box width/height rounded to 3 decimals (for example "12.345%") and rotate: true; on a link it writes connectionRatio with the drop length divided by the total connection length.',
  'connection-strategy:useDefaults': 'Leaves the dropped end definition unchanged (a no-op strategy): the paper default anchor and connection point for the end apply.',
  'layout-port:absolute': 'Each port takes its own declared x/y position (numbers or percentages of the element box), with per-port dx/dy offsets and angle; positions are rounded to integers.',
  'layout-port:line': 'Ports are distributed evenly along the straight line from start to end (positions or points), each then shifted by its dx/dy and given the declared angle; positions are rounded to integers.',
  'layout-port:left': 'Ports are distributed evenly down the left side of the element box from top to bottom ((i + 0.5) / N along the side unless start/end/step options override), each shifted by its dx/dy; positions are rounded to integers.',
  'layout-port:right': 'Ports are distributed evenly down the right side of the element box from top to bottom ((i + 0.5) / N along the side unless overridden), each shifted by its dx/dy; positions are rounded to integers.',
  'layout-port:top': 'Ports are distributed evenly across the top side of the element box from left to right ((i + 0.5) / N along the side unless overridden), each shifted by its dx/dy; positions are rounded to integers.',
  'layout-port:bottom': 'Ports are distributed evenly across the bottom side of the element box from left to right ((i + 0.5) / N along the side unless overridden), each shifted by its dx/dy; positions are rounded to integers.',
  'layout-port:ellipse': 'Ports are placed on the ellipse inscribed in the element box at angles stepping from startAngle by an equal share of the remaining arc (step option overrides), each shifted by its dx/dy; positions are rounded to integers.',
  'layout-port:ellipseSpread': 'Ports are spread over the full ellipse inscribed in the element box, evenly by angle from startAngle (a full turn divided by the port count unless step overrides), each shifted by its dx/dy; positions are rounded to integers.',
  'layout-port:fn': 'Deprecated escape hatch: the group layout function itself is supplied by the application (args carries the function and its parameters); JointJS only applies the returned positions.',
  'layout-port-label:manual': 'The label keeps the position declared in its own arguments (x/y/angle/offset); no automatic placement is computed.',
  'layout-port-label:left': 'The label is placed to the left of its port position, offset outward by the label offset and aligned so the text sits outside the element edge.',
  'layout-port-label:right': 'The label is placed to the right of its port position, offset outward by the label offset.',
  'layout-port-label:top': 'The label is placed above its port position, offset outward by the label offset.',
  'layout-port-label:bottom': 'The label is placed below its port position, offset outward by the label offset.',
  'layout-port-label:outside': 'The label is placed outside the element on the side its port sits on (derived from the port position against the element box), at the declared offset.',
  'layout-port-label:outsideOriented': 'Like the outside label layout, and the label is additionally rotated to follow the orientation of the side it sits on.',
  'layout-port-label:inside': 'The label is placed inside the element on the side its port sits on, at the declared offset from the port position.',
  'layout-port-label:insideOriented': 'Like the inside label layout, and the label is additionally rotated to follow the orientation of the side it sits on.',
  'layout-port-label:radial': 'The label is placed radially outward from the element centre through its port position, at the declared offset.',
  'layout-port-label:radialOriented': 'Like the radial label layout, and the label is rotated along the radial direction through its port.',
  'highlighter:addClass': 'Adds a CSS class to the highlighted node (the className option) for the duration of the highlight and removes it on unhighlight; no geometry is drawn.',
  'highlighter:mask': 'Clips an overlay copy of the node through an SVG mask built from the node shape (getMaskShape), so the emphasis follows the exact node outline; mask child/root attribute blacklists and tag replacements shape the mask content.',
  'highlighter:opacity': 'Dims everything except the highlighted node by setting an opacity class (opacityClassName) on the paper root for the duration of the highlight.',
  'highlighter:stroke': 'Draws a stroke outline around the exact node shape path (getPathData) or around the link connection, expanded by padding and rounded by rx/ry options; highlightNode and highlightConnection are the two entry points.',
  'highlighter:list': 'Renders a stack of list items next to the cell (createListItem per item, position places the stack, Directions and Positions enumerate the allowed placements) used for validation-style callouts.',
  'link-tool:Anchor': 'Draggable handle at a link end that re-anchors that end: dragging moves the end anchor point and commits the new anchor definition to the link on release.',
  'link-tool:Arrowhead': 'Base draggable arrowhead handle shared by the source and target variants: dragging moves the link end along with its arrowhead and re-anchors on release.',
  'link-tool:SourceAnchor': 'The Anchor handle specialised for the link source end.',
  'link-tool:TargetAnchor': 'The Anchor handle specialised for the link target end.',
  'link-tool:SourceArrowhead': 'The Arrowhead handle specialised for the link source end.',
  'link-tool:TargetArrowhead': 'The Arrowhead handle specialised for the link target end.',
  'link-tool:Boundary': 'Non-draggable frame showing the link connection bounding box while the tools are visible; it tracks the connection geometry and takes no edit.',
  'link-tool:Button': 'Clickable button rendered on the link at a declared distance/offset; activating it fires the tool action callback instead of editing geometry.',
  'link-tool:Connect': 'Handle that starts a new link from this link end (magnet-style connect interaction), creating and dragging the new link until release.',
  'link-tool:Control': 'Generic draggable control handle positioned along the connection by ratio or length; subclasses specialise what the drag edits.',
  'link-tool:HoverConnect': 'Connect handle revealed on hover over the link, starting a new link drag from the hovered point.',
  'link-tool:Remove': 'Button that removes the link from the graph when activated.',
  'link-tool:RotateLabel': 'Handle that rotates a link label around its anchor point, committing the label angle on release.',
  'link-tool:Segments': 'Draggable handles on each route segment: dragging a segment moves it orthogonally and rewrites the adjacent vertices on release.',
  'link-tool:Vertices': 'Draggable handles on each route vertex (VertexHandle): dragging moves the vertex, double-click removes it, and dragging a segment midpoint inserts a new vertex; the vertex list is committed on release.',
  'element-tool:Boundary': 'Non-draggable frame showing the element bounding box while the tools are visible; it tracks element geometry and takes no edit.',
  'element-tool:Button': 'Clickable button rendered at a declared position on the element; activating it fires the tool action callback.',
  'element-tool:Connect': 'Handle that starts a new link from the element (optionally from a port magnet) and drags it until it is dropped on a target.',
  'element-tool:Control': 'Generic draggable control handle on the element; subclasses specialise what the drag edits (offsets, radii, dividers).',
  'element-tool:HoverConnect': 'Connect handle revealed on hover over the element, starting a new link drag.',
  'element-tool:Remove': 'Button that removes the element (and its embedded content per the graph rules) when activated.',
  'presentation-attribute:source-marker': 'Defines the marker drawn at the start of a link connection path (an SVG marker definition referenced by the connection); changing it re-renders the link ends.',
  'presentation-attribute:target-marker': 'Defines the marker drawn at the end of a link connection path; changing it re-renders the link ends.',
  'presentation-attribute:vertex-marker': 'Defines the marker drawn at each interior vertex of a link connection path.',
  'presentation-attribute:text': 'Sets the text content of the target node, with wrapping and breaking per the sibling text options (text-wrap, line-height, annotations) measured against the reference box.',
  'presentation-attribute:title': 'Sets the node tooltip by creating or updating an SVG <title> child of the target node; it carries no geometry and no calc evaluation.',
  'presentation-attribute:props': 'Assigns DOM properties (not attributes) from the given name/value map onto the target node.',
  'presentation-attribute:style': 'Applies the given CSS declarations to the target node style.',
  'presentation-attribute:html': 'Replaces the target node inner HTML with the given markup (the node is emptied on unset).',
  'util:addClassNamePrefix': 'Returns the class name prefixed with the given prefix (the global config.classNamePrefix by default); used to namespace theme and view class names.',
  'util:removeClassNamePrefix': 'Inverse of addClassNamePrefix: strips the given prefix (the global config.classNamePrefix by default) from a class name when present.',
  'util:normalizeWheel': 'Normalises a wheel event into a plain delta record (pixel/line/page modes converted to pixel deltas) for zoom handling.',
  'util:cap': 'Caps a numeric value at the given maximum (returns the smaller of value and max).',
  'util:wrapWith': 'Replaces each named method of the object with the named wrapper (or a wrapper function); an unknown wrapper name or a non-function wrapper throws.',
  'util:wrappers': 'The named method wrappers registry; its cells wrapper adapts a function expecting (cells, opt) to one accepting a single cell, a cell list, or trailing options, normalising the arguments before delegating.',
});

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
      return `Element anchor \`${n}\`: input is the end element/port geometry, the magnet shape descriptor and a reference point (plus this anchor's options); output is the link end point on the element. Moving, resizing or rotating the element moves the computed point by the same rule.${detail}${sig}`;
    case 'link-anchor':
      return `Link anchor \`${n}\`: input is the host link's rendered connection and a reference point or ratio/length argument; output is the attachment point on that connection, used when a link end attaches to another link.${detail}${sig}`;
    case 'connection-point':
      return `Connection point \`${n}\`: input is the link end segment and the end element's shape/bounding box; output trims or extends the rendered path end so the visible path starts or ends exactly at the computed boundary point (stroke and offset options honoured as declared).${detail}${sig}`;
    case 'connection-strategy':
      return `Connection strategy \`${n}\`: on a link-end drop over an element, magnet or link it rewrites the end definition (anchor name and arguments, or connection ratio on a link target) before the link model is updated; the rewritten definition is the observable output.${detail}${sig}`;
    case 'highlighter':
      if (r.extra.kind === 'enum') return `Highlighter enum \`${r.key}\`.${enumNote}${sig}`;
      if (o && n !== o) return `\`highlighters.${o}.${n}\` (${r.extra.kind}).${sig}${doc} It contributes to the "${o}" emphasis: applied to a cell view (or link connection) it adds the visible overlay and removes it cleanly on unhighlight, without changing the underlying model.`;
      return `Highlighter \`${n}\`: when applied to a cell view (or a link connection) it adds the visible emphasis named "${n}" (padding, stroke, mask or class as declared for this highlighter) and removes it cleanly on unhighlight, without changing the underlying model.${detail}`;
    case 'link-tool':
      if (r.extra.kind === 'class') return `Link-tool handle class \`${r.key}\`: the draggable handle view used by its parent tool; pointer drags on it produce the parent tool's link edit.${sig}`;
      if (o && r.key !== n) return `\`linkTools.${r.key}\` (${r.extra.kind}).${sig}${doc} Part of the parent tool's interaction: it renders on the link's tools layer and translates its pointer gestures into that tool's link edit, committed to the link model on release.`;
      return `Link tool \`${n}\`: when a link's tools are shown it renders its handle(s) on the link and translates pointer drags into the link edits named by the tool (vertices, segments, arrowheads, anchors, labels or removal), updating the link model on release.${detail}`;
    case 'element-tool':
      if (r.extra.kind === 'class') return `Element-tool handle class \`${r.key}\`: the draggable handle view used by its parent tool.${sig}`;
      if (o && r.key !== n) return `\`elementTools.${r.key}\` (${r.extra.kind}).${sig}${doc} Part of the parent tool's interaction on the element's tools layer.`;
      return `Element tool \`${n}\`: when an element's tools are shown it renders its handle or button on the element and translates pointer interaction into the element or link-creation edits named by the tool, updating the model on release.${detail}`;
    case 'shape':
      if (o && r.key !== n) return `\`standard.${r.key}\` (${r.extra.kind}).${sig}${doc} Member of the standard shape class; reading or setting it follows the declared signature on shape instances.`;
      return `Standard shape \`standard.${n}\`: an element (or link, for the link shapes) type with its own default markup, default selector attributes (including calc(...) sizing such as calc(w)/calc(h) where declared) and default size; creating it renders the named figure and setting its selectors updates the corresponding parts.`;
    case 'layout-port':
      return `Port layout \`${n}\`: input is a port group's ports (with per-port dx/dy) and the element bounding box; output is each port's position and angle. Positions are rounded to integers (p.round()) upstream.${detail}${sig}`;
    case 'layout-port-label':
      return `Port-label layout \`${n}\`: input is a port position and the element bounding box; output is the port label's position, angle and attributes.${detail}${sig}`;
    case 'geometry':
      if (r.extra.kind === 'enum') return `\`g.types\` (enum).${enumNote}${sig} The numeric codes discriminate the geometry classes (Point=1, Line=2, Ellipse=3, Rect=4, Polyline=5, Polygon=6, Curve=7, Path=8).`;
      if (o === 'Segment') return `\`g.Segment.${n}\` (${r.extra.kind}).${sig}${doc} Behavioural contract of one path segment (M/L/C/Z units created through Path.createSegment): a pure geometry operation on the segment, with no rendering side effects. Segment geometry (bbox, length, closest point, tangents, subdivision) follows the declared signature.`;
      return `\`g.${o ? o + '.' : ''}${n}\` (${r.extra.kind || 'function'}).${sig}${doc}${detail} Pure plane-geometry operation: the documented inputs produce the documented points, shapes, distances, intersections or serialised form, with no rendering side effects.`;
    case 'vectorizer':
      if (r.extra.kind === 'callable') return `\`V(svg, attrs, children)\` (callable).${sig} Creates a VElement wrapping the given SVG element/tag, applies attrs and appends children; the result supports the VElement operations of this family.`;
      return `\`${o === 'VStatic' ? 'V.' : 'VElement.'}${n}\` (${r.extra.kind}).${sig}${doc} SVG DOM operation: ${o === 'VStatic' ? 'as a static helper it transforms or inspects SVG nodes, matrices or path data and returns the declared result.' : 'applied to the wrapped SVG node it mutates or inspects that node (attributes, transform, text, tree position or measured box) and returns the declared result.'}`;
    case 'util':
      return `\`util.${o && o !== 'util' ? o + '.' : ''}${n}\`.${sig}${doc}${detail} Pure (or explicitly documented) helper: the documented inputs produce the documented transformed value, cloned structure, formatted string or scheduled callback behaviour, independently of any diagram state.`;
    case 'mvc':
      if (r.key === '$') return '`mvc.$`: the DOM helper facade re-exported from src/mvc/Dom/index.mjs (vendored jQuery-derived implementation, Dom.mjs). It is inventoried as a single facade entry: parity is specified as a DOM-helper replacement contract, not as per-method jQuery parity (see the spec annex).';
      if (r.key === 'Events') return '`mvc.Events`: the event-mixin singleton object (on/off/trigger/bind/unbind/once/listenTo/listenToOnce/stopListening) that is mixed into models, collections, views and the graph; binding, unbinding and triggering follow the Events contract of this family.';
      if (r.key === 'Event') return '`mvc.Event` (type): the normalised event object carried to view and paper handlers (mouse, pointer, keyboard and touch fields, propagation flags and preventDefault/stopPropagation controls). Type-only: parity is the handler argument shape.';
      if (r.key === 'TriggeredEvent') return '`mvc.TriggeredEvent` (type): the event object as delivered to triggered listeners, extending mvc.Event with currentTarget, delegateTarget, target, data, namespace and originalEvent fields. Type-only: parity is the listener argument shape.';
      if (r.key === 'views') return '`mvc.views`: the global registry of live views keyed by cid; a view registers itself at initialisation and its slot is cleared on removal, so lookups observe exactly the mounted view set.';
      if (o === 'Data') return `\`mvc.Data.${n}\` (${r.extra.kind}).${sig} WeakMap-backed per-object data store operation of mvc.Data.`;
      if (o === 'mvc') return `\`mvc.${n}\` (${r.extra.kind || 'member'}).${sig}${doc} Module-level mvc export; see the entry name for the exact role.`;
      return `\`mvc.${o}.${n}\` (${r.extra.kind || 'member'}).${sig}${doc} Backbone-style model, collection, view or event primitive on which dia.Graph, dia.Cell and the views are built; state changes emit the documented change notifications.`;
    case 'presentation-attribute':
      if (n === 'evalAttributes' || n === 'evalAttribute') return `Presentation evaluator \`${n}\`.${detail} ${CALC_GRAMMAR}`;
      if (r.extra.kind === 'selector-attribute') return `Selector attribute \`${n}\`: consumed by CellView outside the presentation-attribute registry to resolve the magnet, event source, highlighter target or port container for a selector; it does not itself paint.`;
      if (n === 'use-no-break-space') return 'Presentation option `use-no-break-space`: when true inside text attributes, spaces are preserved as non-breaking spaces during text wrapping/measurement of the owning text attribute.';
      if (CALC_ATTRIBUTES.has(n)) return `Presentation attribute \`${n}\`: one of the geometry attributes whose calc(...) values are evaluated against the element's reference bounding box by the calc evaluator before the "${n}" rule is applied to the target node, and re-evaluated when the geometry changes. ${CALC_GRAMMAR}`;
      return `Presentation attribute \`${n}\`${r.extra.alias ? ' (bracket-assigned alias of its -keep-gradient/-reset-offset or base variant)' : ''}: when set in a cell's selector attributes it is applied to the target node following the "${n}" rule and re-applied when the geometry changes. This attribute is not one of the calc-evaluated geometry attributes, so a calc(...) value in it is not evaluated by the calc evaluator. ${detail}`;
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
    case 'dia-api':
      if (targetFor(r) === 'diagram-core') return `Differential model oracle for ${label}: apply the same operation sequence to a JointJS graph and to our diagram-core state (via transactions with the JointJS-to-Effect projection of the spec); assert the serialised model, the returned value or rejection and the projected effect/event sequence match, including one invalid-input case that must be rejected without partial state change.`;
      return `Differential scene oracle for ${label}: build the same paper and scripted pointer/option sequence in JointJS and in our diagram-canvas plus renderer harness (playwright-core, headless Chrome); assert the scene/display-list geometry, the camera transform, the emitted paper event sequence and the final model match, with pointer coordinates compared after the shared world transform and pixels compared only where geometry cannot decide.`;
    case 'mvc':
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
  'paper-option': 'Declared property fields of the Paper.Options interface in types/dia.d.ts via AST, plus the fields inherited from the sibling option interfaces declared in the same file (CellVisibilityOptions, BeforeRenderOptions, AfterRenderOptions); fields inherited from interfaces of other files (mvc.ViewOptions) excluded.',
  event: 'Union of dia.Paper.EventMap keys, trigger() literals in src/**, and dynamic change:/eventPrefix patterns (flagged dynamic).',
  router: 'Keys of RouterArgumentsMap in types/routers.d.ts, plus routers.rightAngle.Directions (RightAngleDirections enum, one entry).',
  connector: 'Keys of ConnectorArgumentsMap in types/connectors.d.ts, plus connectors.curve.Directions and connectors.curve.TangentDirections (one entry per enum).',
  anchor: 'export const names in src/anchors/index.mjs, anchored on their typed declaration when one exists (types/anchors.d.ts).',
  'link-anchor': 'Exported anchor names in src/linkAnchors/index.mjs (resolveRef helper excluded), anchored on their typed declaration when one exists.',
  'connection-point': 'export const names in src/connectionPoints/index.mjs, anchored on their typed declaration when one exists.',
  'connection-strategy': 'export const names in src/connectionStrategies/index.mjs, anchored on their typed declaration when one exists.',
  highlighter: 'export const names in src/highlighters/*.mjs, plus declared members of the highlighter classes and the list.Directions/list.Positions enums in types/highlighters.d.ts.',
  'link-tool': 'Export classes in types/linkTools.d.ts (top-level plus nested handle classes such as Vertices.VertexHandle), plus their declared members (constructors excluded).',
  'element-tool': 'Export classes in types/elementTools.d.ts (top-level plus nested classes), plus their declared members (constructors excluded).',
  shape: 'export class names in types/shapes-standard.d.ts (standard.*), plus their declared members (e.g. Cylinder.topRy; constructors excluded).',
  'layout-port': 'export var names under the Port namespace of types/layout.d.ts.',
  'layout-port-label': 'export var names under the PortLabel namespace of types/layout.d.ts.',
  geometry: 'Distinct declared member names per export class in types/geometry.d.ts via AST, plus the g.Segment interface members, the g.types enum (one entry), standalone functions and bezier/scale/intersection namespace members.',
  vectorizer: 'VElement member names plus VStatic interface members (prefix V.) and the V callable signature, in types/vectorizer.d.ts via AST.',
  util: 'export function/var names in types/util.d.ts, including timing/interpolate/filter/format namespace members, plus the runtime-only helpers exported by src/util/*.mjs that the type surface never declares.',
  mvc: 'Distinct declared member names per export class in types/mvc.d.ts via AST, plus the module-level exports that are not class members (Events object, Event and TriggeredEvent types, views registry, runtime-only View theme-class helpers), plus Data (with its JS methods has/create/get/set/remove) and the single $ facade entry from src/mvc/index.mjs.',
  'presentation-attribute': 'Top-level keys of the attribute namespaces in src/dia/attributes/*.mjs, plus bracket-assigned aliases (ref-d, ref-points, at-connection-*, refX/refY/ref-*2/ref-r), the calc evaluator (evalAttributes, evalAttribute), use-no-break-space, the five CellView selector attributes (event, magnet, magnetSelector, highlighterSelector, containerSelector) and the props shorthand.',
  'core-config': 'Keys of src/config/index.mjs, plus env.addTest, env.test, setTheme, version.',
  alg: 'The exported rightAnglePath function of types/alg.d.ts (upstream-flagged internal).',
  package: 'Directories of packages/* in the monorepo carrying a package.json.',
  'package-api': 'Entry-point exports per package (see the enumerate.mjs header), including @joint/router-avoid RouterService with its members and events, the @joint/react subpath ./internal, and the own declared members of the exported @joint/shapes-general and @joint/shapes-general-tools classes; names declared in a package but not re-exported from its entry point are excluded; @joint/core excluded.',
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
