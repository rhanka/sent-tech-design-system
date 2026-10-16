#!/usr/bin/env node
/**
 * extract-ast.mjs — SECOND, independent extractor for the bpmn-js / diagram-js
 * completeness guard. It shares no code and no import with enumerate.mjs:
 * enumerate.mjs is line/regex based, this module parses every source file
 * with the TypeScript compiler API (ts.createProgram over the pinned
 * checkouts, ts.createSourceFile fallback, AST visitors only — no regex
 * extraction) and enumerates the same families under the counting
 * conventions stated in SPEC_RE_BPMN_JS_PARITY.md section 3.1.
 *
 * verify.mjs compares the inventory (produced by enumerate.mjs) against
 * THIS extraction. Any key present on one side and absent on the other is
 * printed and fails the guard, so an omission in either extractor is
 * visible instead of tautologically confirmed.
 *
 * Usage (debugging): node tools/re-bpmn-js/extract-ast.mjs
 * Prints per-family counts and the sorted key lists as JSON.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
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

function loadTypeScript() {
  const require = createRequire(import.meta.url);
  const candidates = [
    process.env.RE_TYPESCRIPT,
    resolve(wtRoot, '..', 'node_modules', 'typescript'),
    resolve(wtRoot, 'node_modules', 'typescript'),
    resolve(scriptDir, '..', '..', '..', 'node_modules', 'typescript'),
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      if (existsSync(join(c, 'package.json'))) return require(c);
    } catch { /* try next candidate */ }
  }
  throw new Error(`typescript package not found; tried: ${candidates.join(', ')}`);
}

const ts = loadTypeScript();

// ------------------------------------------------------------ file access
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
function jsFiles(root) {
  return walk(join(root, 'lib'), (p) => p.endsWith('.js'));
}
const allJsFiles = [...jsFiles(bpmnRoot), ...jsFiles(diagramRoot)].sort();

// ------------------------------------------- TypeScript program + AST map
const sourceFileByPath = new Map();
(function buildAstMap() {
  try {
    const program = ts.createProgram(allJsFiles, {
      allowJs: true,
      checkJs: false,
      noLib: true,
      noResolve: true,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    });
    for (const sf of program.getSourceFiles()) {
      if (allJsFiles.includes(sf.fileName)) sourceFileByPath.set(sf.fileName, sf);
    }
  } catch { /* fall through to per-file parsing */ }
  for (const f of allJsFiles) {
    if (!sourceFileByPath.has(f)) {
      sourceFileByPath.set(f, ts.createSourceFile(f, readFileSync(f, 'utf8'), ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS));
    }
  }
})();

function astOf(abs) {
  return sourceFileByPath.get(abs);
}
function lineOf(sf, node) {
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}
function visit(node, cb) {
  cb(node);
  ts.forEachChild(node, (child) => visit(child, cb));
}
function propName(nameNode) {
  if (!nameNode) return null;
  if (ts.isStringLiteral(nameNode) || ts.isNumericLiteral(nameNode)) return nameNode.text;
  if (ts.isIdentifier(nameNode)) return nameNode.text;
  return null;
}
function strVal(node) {
  return node && ts.isStringLiteral(node) ? node.text : null;
}
function calleeName(node) {
  if (ts.isIdentifier(node)) return node.text;
  if (ts.isPropertyAccessExpression(node)) return node.name.text;
  return null;
}
function objectKeys(objLit, sf) {
  const out = [];
  for (const p of objLit.properties) {
    if (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) {
      const k = propName(p.name);
      if (k) out.push({ key: k, line: lineOf(sf, p) });
    }
  }
  return out;
}
function relKey(label, root, abs) {
  return `${label}:${relative(join(root, 'lib'), abs).split('\\').join('/')}`;
}
function sortedItems(map) {
  return [...map.entries()].map(([key, v]) => ({ key, ...v })).sort((a, b) => a.key.localeCompare(b.key));
}

// ------------------------------------------------------------- extractors
function extractModules() {
  const items = [];
  for (const [label, root] of [['bpmn-js', bpmnRoot], ['diagram-js', diagramRoot]]) {
    for (const f of walk(join(root, 'lib'), (p) => p.endsWith('index.js'))) {
      const sf = astOf(f);
      let line = 1;
      const services = [];
      if (sf) {
        visit(sf, (n) => {
          if (ts.isObjectLiteralExpression(n)) {
            for (const k of objectKeys(n, sf)) {
              // didi services are declared as `name: [ 'type', Impl ]`.
            }
            for (const p of n.properties) {
              if (ts.isPropertyAssignment(p) && ts.isArrayLiteralExpression(p.initializer)) {
                const k = propName(p.name);
                if (k === '__init__') line = lineOf(sf, p);
                else if (k && k !== '__depends__') services.push(k);
              }
            }
          }
        });
      }
      items.push({
        key: relKey(label, root, f), sourceAbs: f, line,
        detail: services.length ? `services: ${services.join(', ')}` : 'didi module (no inline service map matched)',
      });
    }
  }
  return items;
}

function extractCommands() {
  const found = new Map();
  const add = (key, abs, line) => { if (key && !found.has(key)) found.set(key, { sourceAbs: abs, line }); };
  for (const f of allJsFiles) {
    const sf = astOf(f);
    if (!sf) continue;
    visit(sf, (n) => {
      if (ts.isCallExpression(n)) {
        const cn = calleeName(n.expression);
        if ((cn === 'registerHandler' || cn === 'execute') && n.arguments.length) {
          const v = strVal(n.arguments[0]);
          if (v) add(v, f, lineOf(sf, n));
        }
      }
      // Modeling.getHandlers only: returned object literal keys.
      if (f.endsWith('features/modeling/Modeling.js') && ts.isReturnStatement(n) && n.expression && ts.isObjectLiteralExpression(n.expression)) {
        for (const k of objectKeys(n.expression, sf)) {
          if (/^[a-z][\w.]*$/.test(k.key) && (k.key.includes('.') || k.key === 'spaceTool')) add(k.key, f, k.line);
        }
      }
      // handlers['x'] = ... assignments (bpmn-js Modeling only).
      if (f.endsWith('features/modeling/Modeling.js') && ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken
        && ts.isElementAccessExpression(n.left)) {
        const v = strVal(n.left.argumentExpression);
        if (v && /^[a-z]/.test(v)) add(v, f, lineOf(sf, n));
      }
    });
  }
  return [...found.entries()].map(([key, v]) => ({ key, ...v, detail: 'CommandStack command id' })).sort((a, b) => a.key.localeCompare(b.key));
}

function extractRules() {
  const found = new Map();
  for (const f of allJsFiles) {
    const sf = astOf(f);
    if (!sf) continue;
    visit(sf, (n) => {
      if (ts.isCallExpression(n) && calleeName(n.expression) === 'addRule' && n.arguments.length) {
        const a = n.arguments[0];
        const single = strVal(a);
        if (single && !found.has(single)) found.set(single, { sourceAbs: f, line: lineOf(sf, n) });
        if (ts.isArrayLiteralExpression(a)) {
          for (const el of a.elements) {
            const v = strVal(el);
            if (v && !found.has(v)) found.set(v, { sourceAbs: f, line: lineOf(sf, n) });
          }
        }
      }
    });
  }
  return [...found.entries()].map(([key, v]) => ({ key, ...v, detail: 'RuleProvider action (canExecute gate)' })).sort((a, b) => a.key.localeCompare(b.key));
}

function extractPalette() {
  const f = join(bpmnRoot, 'lib/features/palette/PaletteProvider.js');
  const sf = astOf(f);
  const items = [];
  if (sf) {
    visit(sf, (n) => {
      // Entries are composed as assign(actions, { 'key': entry, ... }).
      if (ts.isCallExpression(n) && calleeName(n.expression) === 'assign' && n.arguments.length >= 2
        && ts.isIdentifier(n.arguments[0]) && n.arguments[0].text === 'actions'
        && ts.isObjectLiteralExpression(n.arguments[1])) {
        for (const k of objectKeys(n.arguments[1], sf)) {
          if (!items.some((x) => x.key === k.key)) items.push({ key: k.key, sourceAbs: f, line: k.line, detail: 'Palette entry (group/className/title in source)' });
        }
      }
    });
  }
  return items;
}

function extractContextPad() {
  const found = new Map();
  const collectFrom = (f) => {
    const sf = astOf(f);
    if (!sf) return;
    visit(sf, (n) => {
      // assign(actions, { 'key': {...} }) entry literals (target must be the entries bag).
      if (ts.isCallExpression(n) && calleeName(n.expression) === 'assign' && n.arguments.length >= 2
        && ts.isIdentifier(n.arguments[0]) && (n.arguments[0].text === 'actions' || n.arguments[0].text === 'entries')
        && ts.isObjectLiteralExpression(n.arguments[1])) {
        for (const k of objectKeys(n.arguments[1], sf)) {
          if (!found.has(k.key)) found.set(k.key, { sourceAbs: f, line: k.line });
        }
      }
      // Returned entry literals (deleteAction helper, align _getEntries).
      if (ts.isReturnStatement(n) && n.expression && ts.isObjectLiteralExpression(n.expression)) {
        for (const k of objectKeys(n.expression, sf)) {
          if (/^(append\.|connect|delete|replace|lane-|align-elements)/.test(k.key) && !found.has(k.key)) {
            found.set(k.key, { sourceAbs: f, line: k.line });
          }
        }
      }
    });
  };
  collectFrom(join(bpmnRoot, 'lib/features/context-pad/ContextPadProvider.js'));
  collectFrom(join(bpmnRoot, 'lib/features/align-elements/AlignElementsContextPadProvider.js'));
  return [...found.entries()].map(([key, v]) => ({ key, ...v, detail: 'Context-pad entry key' })).sort((a, b) => a.key.localeCompare(b.key));
}

function extractReplaceMenu() {
  const f = join(bpmnRoot, 'lib/features/replace/ReplaceOptions.js');
  const sf = astOf(f);
  const found = new Map();
  if (sf) {
    visit(sf, (n) => {
      // replaceWith('id' [, { actionName: 'x' }]) -> offered replace option.
      if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'replaceWith' && n.arguments.length) {
        const id = strVal(n.arguments[0]);
        if (!id) return;
        let action = `replace-with-${id}`;
        const extra = n.arguments[1];
        if (extra && ts.isObjectLiteralExpression(extra)) {
          for (const p of extra.properties) {
            if (ts.isPropertyAssignment(p) && propName(p.name) === 'actionName') {
              const v = strVal(p.initializer);
              if (v) action = v;
            }
          }
        }
        if (!found.has(action)) found.set(action, { sourceAbs: f, line: lineOf(sf, n) });
      }
      // SEQUENCE_FLOW literal options carry their actionName directly.
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === 'SEQUENCE_FLOW' && n.initializer) {
        visit(n.initializer, (m) => {
          if (ts.isPropertyAssignment(m) && propName(m.name) === 'actionName') {
            const v = strVal(m.initializer);
            if (v && !found.has(v)) found.set(v, { sourceAbs: f, line: lineOf(sf, m) });
          }
        });
      }
    });
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
  // Provider registrations, disambiguated by file when an id repeats.
  const regs = [];
  for (const f of providerFiles) {
    const sf = astOf(f);
    if (!sf) continue;
    visit(sf, (n) => {
      if (ts.isCallExpression(n) && calleeName(n.expression) === 'registerProvider' && n.arguments.length) {
        const v = strVal(n.arguments[0]);
        if (v) regs.push({ id: v, sourceAbs: f, line: lineOf(sf, n) });
      }
    });
  }
  const idCount = {};
  for (const r of regs) idCount[r.id] = (idCount[r.id] || 0) + 1;
  for (const r of regs) {
    const stem = r.sourceAbs.split('/').pop().replace(/\.js$/, '');
    const key = idCount[r.id] > 1 ? `${r.id} (${stem})` : r.id;
    add(key, r.sourceAbs, r.line, 'Popup-menu provider id');
  }
  // Header toggles returned by the ReplaceMenuProvider header helpers.
  const rmp = providerFiles[0];
  const rmpSf = astOf(rmp);
  if (rmpSf) {
    visit(rmpSf, (n) => {
      if (ts.isReturnStatement(n) && n.expression && ts.isObjectLiteralExpression(n.expression)) {
        for (const k of objectKeys(n.expression, rmpSf)) {
          if (k.key.startsWith('toggle-')) add(k.key, rmp, k.line, 'Popup-menu header entry (ReplaceMenuProvider)');
        }
      }
    });
  }
  // Align entries: 'align-elements-' + each ALIGNMENT_OPTIONS value.
  const amp = providerFiles[1];
  const ampSf = astOf(amp);
  if (ampSf) {
    visit(ampSf, (n) => {
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === 'ALIGNMENT_OPTIONS'
        && n.initializer && ts.isArrayLiteralExpression(n.initializer)) {
        for (const el of n.initializer.elements) {
          const v = strVal(el);
          if (v) add(`align-elements-${v}`, amp, lineOf(ampSf, el), 'Align-elements popup entry');
        }
      }
    });
  }
  // Distribute entries composed in DistributeElementsMenuProvider (`var entries = {...}`).
  const dmp = providerFiles[2];
  const dmpSf = astOf(dmp);
  if (dmpSf) {
    visit(dmpSf, (n) => {
      if (ts.isReturnStatement(n) && n.expression && ts.isObjectLiteralExpression(n.expression)) {
        for (const k of objectKeys(n.expression, dmpSf)) {
          if (k.key.startsWith('distribute-elements-')) add(k.key, dmp, k.line, 'Distribute-elements popup entry');
        }
      }
      if (ts.isVariableDeclaration(n) && n.initializer && ts.isObjectLiteralExpression(n.initializer)) {
        for (const k of objectKeys(n.initializer, dmpSf)) {
          if (k.key.startsWith('distribute-elements-')) add(k.key, dmp, k.line, 'Distribute-elements popup entry');
        }
      }
    });
  }
  return [...found.entries()].map(([key, v]) => ({ key, ...v })).sort((a, b) => a.key.localeCompare(b.key));
}

function extractKeyboard() {
  const items = [];
  const seen = new Set();
  const push = (key, abs, line, detail) => { if (key && !seen.has(key)) { seen.add(key); items.push({ key, sourceAbs: abs, line, detail }); } };
  const bf = join(bpmnRoot, 'lib/features/keyboard/BpmnKeyboardBindings.js');
  const bfSf = astOf(bf);
  if (bfSf) {
    visit(bfSf, (n) => {
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === 'SHORTCUTS_KEY_BINDINGS'
        && n.initializer && ts.isObjectLiteralExpression(n.initializer)) {
        for (const k of objectKeys(n.initializer, bfSf)) push(k.key, bf, k.line, 'bpmn-js shortcut binding');
      }
    });
  }
  const df = join(diagramRoot, 'lib/features/keyboard/KeyboardBindings.js');
  const dfSf = astOf(df);
  const listenerLines = new Map();
  if (dfSf) {
    visit(dfSf, (n) => {
      if (ts.isCallExpression(n) && calleeName(n.expression) === 'addListener' && n.arguments.length) {
        const v = strVal(n.arguments[0]);
        if (v) {
          if (!listenerLines.has(v)) listenerLines.set(v, []);
          listenerLines.get(v).push(lineOf(dfSf, n));
        }
      }
    });
  }
  for (const [action, lines] of listenerLines) {
    push(action, df, lines[0], lines.length > 1 ? `diagram-js default binding (${lines.length} listeners, lines ${lines.join(', ')})` : 'diagram-js default binding (guarded by editorActions.isRegistered)');
  }
  // Every registered editor action (bpmn-js _registerAction, diagram-js register).
  for (const f of [join(bpmnRoot, 'lib/features/editor-actions/BpmnEditorActions.js'), join(diagramRoot, 'lib/features/editor-actions/EditorActions.js')]) {
    const sf = astOf(f);
    if (!sf) continue;
    visit(sf, (n) => {
      if (ts.isCallExpression(n)) {
        const cn = calleeName(n.expression);
        if ((cn === '_registerAction' || cn === 'register') && n.arguments.length) {
          const v = strVal(n.arguments[0]);
          if (v) push(v, f, lineOf(sf, n), 'registered editor action');
        }
      }
    });
  }
  // Search-pad keys handled inside the pad (no editor action).
  const sp = join(diagramRoot, 'lib/features/search-pad/SearchPad.js');
  const spSf = astOf(sp);
  if (spSf) {
    visit(spSf, (n) => {
      if (ts.isCallExpression(n) && calleeName(n.expression) === 'isKey' && n.arguments.length) {
        const v = strVal(n.arguments[0]);
        if (v && ['Escape', 'Enter', 'ArrowUp', 'ArrowDown'].includes(v)) push(`searchPad:${v}`, sp, lineOf(spSf, n), 'search-pad key handling');
      }
    });
  }
  const ku = join(diagramRoot, 'lib/features/keyboard/KeyboardUtil.js');
  const kuSf = astOf(ku);
  if (kuSf) {
    visit(kuSf, (n) => {
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && /^(KEYS_|KEY_)/.test(n.name.text)) {
        push(n.name.text, ku, lineOf(kuSf, n), 'key-group constant');
      }
    });
  }
  return items;
}

function extractEvents() {
  const found = new Map();
  const add = (name, abs, line) => { if (name && !found.has(name)) found.set(name, { sourceAbs: abs, line }); };
  for (const f of allJsFiles) {
    const sf = astOf(f);
    if (!sf) continue;
    visit(sf, (n) => {
      if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression)) {
        const cn = n.expression.name.text;
        if ((cn === 'fire' || cn === 'on') && n.arguments.length) {
          const a = n.arguments[0];
          const v = strVal(a);
          if (v) add(v, f, lineOf(sf, n));
          if (ts.isArrayLiteralExpression(a)) {
            for (const el of a.elements) {
              const s = strVal(el);
              if (s) add(s, f, lineOf(sf, n));
            }
          }
          if (ts.isBinaryExpression(a) && a.operatorToken.kind === ts.SyntaxKind.PlusToken) {
            const left = strVal(a.left);
            if (left && left.endsWith('.')) add(left, f, lineOf(sf, n));
          }
        }
      }
    });
  }
  // InteractionEvents: DOM name -> EventBus name table values.
  const ie = join(diagramRoot, 'lib/features/interaction-events/InteractionEvents.js');
  const ieSf = astOf(ie);
  if (ieSf) {
    visit(ieSf, (n) => {
      if (ts.isObjectLiteralExpression(n)) {
        for (const p of n.properties) {
          if (ts.isPropertyAssignment(p)) {
            const v = strVal(p.initializer);
            if (v && v.startsWith('element.')) add(v, ie, lineOf(ieSf, p));
          }
        }
      }
    });
  }
  // CommandStack lifecycle: _fire('changed') and _fire(command, 'qualifier').
  const cs = join(diagramRoot, 'lib/command/CommandStack.js');
  const csSf = astOf(cs);
  if (csSf) {
    visit(csSf, (n) => {
      if (ts.isCallExpression(n) && calleeName(n.expression) === '_fire' && n.arguments.length) {
        if (n.arguments.length >= 3 || (n.arguments.length === 2 && strVal(n.arguments[0]) === 'changed')) {
          const q = strVal(n.arguments[n.arguments.length >= 3 ? 1 : 0]);
          if (q) add(`commandStack.${q}`, cs, lineOf(csSf, n));
        }
        if (n.arguments.length >= 2) {
          const q = strVal(n.arguments[1]);
          if (q && n.arguments.length >= 2 && strVal(n.arguments[0]) !== 'changed') add(`commandStack.${q}`, cs, lineOf(csSf, n));
        }
      }
    });
  }
  // Dragging helper: fire('type') -> drag.<type> (plus prefixed variants at runtime).
  const dg = join(diagramRoot, 'lib/features/dragging/Dragging.js');
  const dgSf = astOf(dg);
  if (dgSf) {
    visit(dgSf, (n) => {
      if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'fire' && n.arguments.length) {
        const v = strVal(n.arguments[0]);
        if (v) add(`drag.${v}`, dg, lineOf(dgSf, n));
      }
    });
  }
  return [...found.entries()]
    .map(([key, v]) => ({ key, ...v, detail: key.endsWith('.') ? 'dynamic prefix (concrete names built at runtime)' : 'EventBus event name', dynamicPrefix: key.endsWith('.') }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

function extractConfig() {
  const items = [];
  const seen = new Set();
  const push = (key, abs, line, detail) => { if (key && !seen.has(key)) { seen.add(key); items.push({ key, sourceAbs: abs, line, detail }); } };
  // BaseViewerOptions typedef fields + options.* reads in BaseViewer.
  const bv = join(bpmnRoot, 'lib/BaseViewer.js');
  const bvSf = astOf(bv);
  if (bvSf) {
    visit(bvSf, (n) => {
      if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'options') {
        push(`viewer.${n.name.text}`, bv, lineOf(bvSf, n), 'options read in BaseViewer');
      }
    });
    visit(bvSf, (n) => {
      const docs = n.jsDoc;
      if (!docs) return;
      for (const d of docs) {
        for (const tag of d.tags || []) {
          if (tag.tagName && tag.tagName.text === 'typedef' && tag.typeExpression
            && ts.isJSDocTypeLiteral(tag.typeExpression)) {
            for (const p of tag.typeExpression.children) {
              if (ts.isJSDocPropertyTag(p) && p.name) push(`viewer.${p.name.text}`, bv, lineOf(bvSf, p), 'BaseViewerOptions field');
              if (ts.isPropertySignature(p)) push(`viewer.${p.name.getText(bvSf)}`, bv, lineOf(bvSf, p), 'BaseViewerOptions field');
            }
          }
        }
      }
    });
  }
  const dgFile = join(diagramRoot, 'lib/Diagram.js');
  const dgSf = astOf(dgFile);
  if (dgSf) {
    visit(dgSf, (n) => {
      const docs = n.jsDoc;
      if (!docs) return;
      for (const d of docs) {
        for (const tag of d.tags || []) {
          if (tag.tagName && tag.tagName.text === 'typedef' && tag.comment
            && String(tag.comment).includes('DiagramOptions')) { /* handled below via text scan of the AST comment */ }
        }
      }
    });
    // DiagramOptions is an inline JSDoc type literal (`modules?`); read it from
    // the parsed JSDoc type expression when present, else from options.modules.
    visit(dgSf, (n) => {
      if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'options') {
        push(`diagram.${n.name.text}`, dgFile, lineOf(dgSf, n), 'DiagramOptions field');
      }
    });
  }
  for (const f of allJsFiles) {
    const sf = astOf(f);
    if (!sf) continue;
    visit(sf, (n) => {
      const v = strVal(n);
      if (v && v.startsWith('config.')) push(v, f, lineOf(sf, n), 'didi config injection');
      if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'config') {
        push(`config.${n.name.text}`, f, lineOf(sf, n), 'feature config read');
      }
      // this._config.<name> reads (injected config held on the instance).
      if (ts.isPropertyAccessExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === '_config') {
        push(`config.${n.name.text}`, f, lineOf(sf, n), 'feature config read');
      }
    });
  }
  return items.sort((a, b) => a.key.localeCompare(b.key));
}

function extractRenderer() {
  const f = join(bpmnRoot, 'lib/draw/BpmnRenderer.js');
  const sf = astOf(f);
  const items = [];
  if (sf) {
    visit(sf, (n) => {
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)
        && (n.name.text === 'taskMarkerRenderers' || n.name.text === 'eventIconRenderers')
        && n.initializer && ts.isObjectLiteralExpression(n.initializer)) {
        const kind = n.name.text === 'taskMarkerRenderers' ? 'task marker renderer' : 'event icon renderer';
        for (const k of objectKeys(n.initializer, sf)) items.push({ key: k.key, sourceAbs: f, line: k.line, detail: `BpmnRenderer ${kind}` });
      }
      if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken
        && ts.isPropertyAccessExpression(n.left) && n.left.name.text === 'handlers'
        && ts.isObjectLiteralExpression(n.right)) {
        for (const k of objectKeys(n.right, sf)) items.push({ key: k.key, sourceAbs: f, line: k.line, detail: 'BpmnRenderer handler (shape/connection drawing)' });
      }
    });
  }
  return items;
}

function jsonProp(obj, name) {
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p) && propName(p.name) === name) return p.initializer;
  }
  return null;
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
    const sf = ts.parseJsonText(abs, readFileSync(abs, 'utf8'));
    const root = sf.statements[0] && ts.isExpressionStatement(sf.statements[0]) && ts.isObjectLiteralExpression(sf.statements[0].expression)
      ? sf.statements[0].expression : null;
    if (!root) continue;
    const lineAt = (node) => sf.getLineAndCharacterOfPosition(node.pos).line + 1;
    const types = jsonProp(root, 'types');
    if (types && ts.isArrayLiteralExpression(types)) {
      for (const el of types.elements) {
        if (!ts.isObjectLiteralExpression(el)) continue;
        const nameNode = jsonProp(el, 'name');
        const name = strVal(nameNode);
        if (!name) continue;
        const absNode = jsonProp(el, 'isAbstract');
        const isAbstract = absNode && absNode.kind === ts.SyntaxKind.TrueKeyword;
        const props = jsonProp(el, 'properties');
        const count = props && ts.isArrayLiteralExpression(props) ? props.elements.length : 0;
        const supers = jsonProp(el, 'superClass');
        const superNames = supers && ts.isArrayLiteralExpression(supers) ? supers.elements.map((e) => strVal(e)).filter(Boolean) : [];
        items.push({
          key: `${prefix}:${name}`, sourceAbs: abs, line: lineAt(el),
          detail: `${isAbstract ? 'abstract' : 'concrete'}; superClass: ${superNames.join(', ') || 'none'}; own properties: ${count}`,
          abstract: !!isAbstract,
        });
      }
    }
    const enums = jsonProp(root, 'enumerations');
    if (enums && ts.isArrayLiteralExpression(enums)) {
      for (const el of enums.elements) {
        if (!ts.isObjectLiteralExpression(el)) continue;
        const name = strVal(jsonProp(el, 'name'));
        if (!name) continue;
        const valuesNode = jsonProp(el, 'values');
        const values = valuesNode && ts.isArrayLiteralExpression(valuesNode)
          ? valuesNode.elements.map((e) => (ts.isObjectLiteralExpression(e) ? strVal(jsonProp(e, 'name')) : strVal(e))).filter(Boolean) : [];
        items.push({
          key: `${prefix}:${name}`, sourceAbs: abs, line: lineAt(el),
          detail: `enumeration; values: ${values.join(', ')}`,
          enumeration: true,
        });
      }
    }
  }
  return items;
}

function extractApi() {
  const targets = [
    ['bpmn-js', join(bpmnRoot, 'lib/BaseViewer.js'), 'BaseViewer'],
    ['bpmn-js', join(bpmnRoot, 'lib/Viewer.js'), 'Viewer'],
    ['bpmn-js', join(bpmnRoot, 'lib/NavigatedViewer.js'), 'NavigatedViewer'],
    ['bpmn-js', join(bpmnRoot, 'lib/Modeler.js'), 'Modeler'],
    ['bpmn-js', join(bpmnRoot, 'lib/BaseModeler.js'), 'BaseModeler'],
    ['bpmn-js', join(bpmnRoot, 'lib/features/modeling/Modeling.js'), 'Modeling'],
    ['bpmn-js', join(bpmnRoot, 'lib/features/editor-actions/BpmnEditorActions.js'), 'BpmnEditorActions'],
    ['diagram-js', join(diagramRoot, 'lib/Diagram.js'), 'Diagram'],
    ['diagram-js', join(diagramRoot, 'lib/core/Canvas.js'), 'Canvas'],
    ['diagram-js', join(diagramRoot, 'lib/features/modeling/Modeling.js'), 'Modeling'],
    ['diagram-js', join(diagramRoot, 'lib/core/ElementRegistry.js'), 'ElementRegistry'],
    ['diagram-js', join(diagramRoot, 'lib/core/EventBus.js'), 'EventBus'],
    ['diagram-js', join(diagramRoot, 'lib/command/CommandStack.js'), 'CommandStack'],
    ['diagram-js', join(diagramRoot, 'lib/features/overlays/Overlays.js'), 'Overlays'],
    ['diagram-js', join(diagramRoot, 'lib/features/selection/Selection.js'), 'Selection'],
    ['diagram-js', join(diagramRoot, 'lib/features/editor-actions/EditorActions.js'), 'EditorActions'],
  ];
  const items = [];
  for (const [label, abs, cls] of targets) {
    if (!existsSync(abs)) continue;
    const sf = astOf(abs) || ts.createSourceFile(abs, readFileSync(abs, 'utf8'), ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
    visit(sf, (n) => {
      if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken
        && ts.isPropertyAccessExpression(n.left)
        && ts.isPropertyAccessExpression(n.left.expression)
        && n.left.expression.name.text === 'prototype'
        && ts.isIdentifier(n.left.expression.expression)
        && n.left.expression.expression.text === cls) {
        const method = n.left.name.text;
        if (method.startsWith('_')) return;
        const key = `${label}:${cls}.${method}`;
        if (!items.some((x) => x.key === key)) items.push({ key, sourceAbs: abs, line: lineOf(sf, n), detail: `public method of ${cls}` });
      }
    });
  }
  return items;
}

function extractExamples() {
  const items = [];
  for (const name of readdirSync(examplesRoot).sort()) {
    const dir = join(examplesRoot, name);
    if (!statSync(dir).isDirectory()) continue;
    const readme = join(dir, 'README.md');
    if (!existsSync(readme)) continue;
    const first = (readFileSync(readme, 'utf8').split(/\r?\n/).find((l) => l.trim().length > 0) || '').trim();
    if (/^>\s*Removed as of/.test(first)) continue; // upstream tombstone, no behaviour to replay
    items.push({ key: name, sourceAbs: readme, line: 1, detail: first.slice(0, 120) });
  }
  return items;
}

export function extractAstAll() {
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

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const raw = extractAstAll();
  const counts = {};
  for (const [family, list] of Object.entries(raw)) counts[family] = list.length;
  console.log(JSON.stringify(counts, null, 2));
  console.log(`total=${Object.values(counts).reduce((a, b) => a + b, 0)}`);
}
