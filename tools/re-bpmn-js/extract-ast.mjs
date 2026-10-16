#!/usr/bin/env node
/**
 * extract-ast.mjs — second enumeration of the bpmn-js / diagram-js surface,
 * used only by the completeness guard in verify.mjs.
 *
 * Method: every library file is parsed once with the TypeScript compiler
 * (a ts.Program over the pinned checkouts, per-file parsing as fallback)
 * and each family is collected by walking syntax trees. The generator in
 * enumerate.mjs works from line text instead; the two programs were
 * written separately, read the pinned sources through different
 * mechanisms, and derive their perimeters differently:
 *  - library roots are located here through the `name` field of each
 *    checkout's package.json, not through path construction;
 *  - didi modules are recognised by the shape of their default export,
 *    palette / context-pad / popup providers by the provider-registration
 *    calls and entry methods they contain, and renderer maps by the
 *    constructor that assigns `this.handlers`;
 *  - the public-API perimeter is rebuilt from didi service registrations
 *    (service name -> implementation file) plus the entry classes that
 *    sit directly in each `lib/` root;
 *  - moddle descriptors are found by scanning the moddle checkout for
 *    JSON documents that declare `types`, taking each document's own
 *    `prefix` as the key namespace;
 *  - examples are recognised by the markdown heading of their README.
 * Counting conventions are those of SPEC_RE_BPMN_JS_PARITY.md section 3.1.
 *
 * Usage (debugging): node tools/re-bpmn-js/extract-ast.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ownDir = dirname(fileURLToPath(import.meta.url));
const treeRoot = resolve(ownDir, '..', '..');

function checkoutDir() {
  if (process.env.RE_SOURCES && existsSync(join(process.env.RE_SOURCES, 'MANIFEST.md'))) {
    return resolve(process.env.RE_SOURCES);
  }
  let cursor = treeRoot;
  for (let depth = 0; depth < 6; depth++) {
    const probe = join(cursor, '.ds-scrap', 're-sources');
    if (existsSync(join(probe, 'MANIFEST.md'))) return probe;
    const parent = dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  throw new Error('pinned sources (MANIFEST.md) not found above ' + treeRoot);
}

const checkout = checkoutDir();

function packageDir(wanted) {
  for (const entry of readdirSync(checkout, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (!entry.isDirectory()) continue;
    const dir = join(checkout, entry.name);
    const manifest = join(dir, 'package.json');
    if (!existsSync(manifest)) continue;
    try {
      if (JSON.parse(readFileSync(manifest, 'utf8')).name === wanted) return dir;
    } catch { /* not a package root */ }
  }
  throw new Error('checkout package not found: ' + wanted);
}

const libRoots = [
  { tag: 'bpmn-js', home: packageDir('bpmn-js') },
  { tag: 'diagram-js', home: packageDir('diagram-js') },
];
const moddleHome = packageDir('bpmn-moddle');
const examplesHome = packageDir('bpmn-js-examples');

function typescriptApi() {
  const load = createRequire(import.meta.url);
  let cursor = treeRoot;
  for (let depth = 0; depth < 6; depth++) {
    const candidate = join(cursor, 'node_modules', 'typescript');
    if (existsSync(join(candidate, 'package.json'))) return load(candidate);
    const parent = dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  throw new Error('typescript package not found above ' + treeRoot);
}

const ts = typescriptApi();

// ---------------------------------------------------------- syntax access
function jsUnder(dir) {
  const pending = [dir];
  const found = [];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) pending.push(full);
      else if (entry.isFile() && entry.name.endsWith('.js')) found.push(full);
    }
  }
  return found.sort();
}

const libFiles = libRoots.flatMap(({ home }) => jsUnder(join(home, 'lib'))).sort();
const parsedByFile = new Map();
{
  let programFiles = [];
  try {
    const program = ts.createProgram(libFiles, {
      allowJs: true, checkJs: false, noLib: true, noResolve: true,
      skipLibCheck: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
    });
    programFiles = program.getSourceFiles().map((f) => f.fileName);
    for (const sf of program.getSourceFiles()) {
      if (libFiles.includes(sf.fileName)) parsedByFile.set(sf.fileName, sf);
    }
  } catch { /* per-file parsing below covers every input */ }
  for (const file of libFiles) {
    if (!parsedByFile.has(file)) {
      parsedByFile.set(file, ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS));
    }
  }
  void programFiles;
}

function treeOf(file) {
  return parsedByFile.get(file);
}
function lineOfNode(sf, node) {
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}
function walkTree(root, action) {
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    action(node);
    const children = [];
    ts.forEachChild(node, (child) => { children.push(child); });
    for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
  }
}
function literalText(node) {
  return node && ts.isStringLiteral(node) ? node.text : null;
}
function keyText(nameNode) {
  if (!nameNode) return null;
  if (ts.isStringLiteral(nameNode) || ts.isNumericLiteral(nameNode)) return nameNode.text;
  if (ts.isIdentifier(nameNode)) return nameNode.text;
  return null;
}
function memberLabel(node) {
  if (ts.isIdentifier(node)) return node.text;
  if (ts.isPropertyAccessExpression(node)) return node.name.text;
  return null;
}
function entriesOf(objectLiteral, sf) {
  const out = [];
  for (const prop of objectLiteral.properties) {
    if (ts.isPropertyAssignment(prop) || ts.isShorthandPropertyAssignment(prop)) {
      const key = keyText(prop.name);
      if (key) out.push({ key, line: lineOfNode(sf, prop), node: prop });
    }
  }
  return out;
}
function libTagOf(file) {
  for (const { tag, home } of libRoots) {
    if (file.startsWith(join(home, 'lib'))) return tag;
  }
  return 'bpmn-js';
}
function ordered(found) {
  return [...found.entries()]
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}
function fromLib(file) {
  for (const { home } of libRoots) {
    const lib = join(home, 'lib');
    if (file.startsWith(lib)) return relative(lib, file).split('\\').join('/');
  }
  return basename(file);
}

// ------------------------------------------------------------- extractors
function collectModules() {
  const items = [];
  for (const file of libFiles) {
    if (basename(file) !== 'index.js') continue;
    const sf = treeOf(file);
    if (!sf) continue;
    let moduleObject = null;
    walkTree(sf, (node) => {
      if (ts.isExportAssignment(node) && ts.isObjectLiteralExpression(node.expression)) moduleObject = node.expression;
    });
    const services = [];
    let startLine = 1;
    if (moduleObject) {
      for (const prop of moduleObject.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        const name = keyText(prop.name);
        if (!name) continue;
        if (name === '__init__') startLine = lineOfNode(sf, prop);
        if (name.startsWith('_')) continue;
        if (ts.isArrayLiteralExpression(prop.initializer)) services.push(name);
      }
    }
    items.push({
      key: libTagOf(file) + ':' + fromLib(file),
      sourceAbs: file,
      line: startLine,
      detail: services.length ? 'services: ' + services.join(', ') : 'didi module (no inline service map matched)',
    });
  }
  return items;
}

function collectCommands() {
  // Candidates carry a precedence rank so that handler-map definitions
  // win over call sites, matching the inventory's source choice.
  const candidates = [];
  for (const file of libFiles) {
    const sf = treeOf(file);
    if (!sf) continue;
    walkTree(sf, (node) => {
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
        && ts.isPropertyAccessExpression(node.left) && node.left.name.text === 'getHandlers') {
        walkTree(node.right, (inner) => {
          if (ts.isReturnStatement(inner) && inner.expression && ts.isObjectLiteralExpression(inner.expression)) {
            for (const entry of entriesOf(inner.expression, sf)) {
              if (/^[a-z][\w.]*$/.test(entry.key) && (entry.key.includes('.') || entry.key === 'spaceTool')) {
                candidates.push({ key: entry.key, file, line: entry.line, rank: 0 });
              }
            }
          }
        });
      }
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
        && ts.isElementAccessExpression(node.left) && ts.isIdentifier(node.left.expression)
        && node.left.expression.text === 'handlers') {
        const value = literalText(node.left.argumentExpression);
        if (value && /^[a-z]/.test(value)) candidates.push({ key: value, file, line: lineOfNode(sf, node), rank: 1 });
      }
      if (ts.isCallExpression(node)) {
        const label = memberLabel(node.expression);
        if ((label === 'registerHandler' || label === 'execute') && node.arguments.length) {
          const value = literalText(node.arguments[0]);
          if (value) candidates.push({ key: value, file, line: lineOfNode(sf, node), rank: 2 });
        }
      }
    });
  }
  candidates.sort((a, b) => a.rank - b.rank);
  const found = new Map();
  for (const c of candidates) {
    if (!found.has(c.key)) found.set(c.key, { sourceAbs: c.file, line: c.line });
  }
  return ordered(found).map((item) => ({ ...item, detail: 'CommandStack command id' }));
}

function collectRules() {
  const found = new Map();
  for (const file of libFiles) {
    const sf = treeOf(file);
    if (!sf) continue;
    walkTree(sf, (node) => {
      if (!ts.isCallExpression(node) || memberLabel(node.expression) !== 'addRule' || !node.arguments.length) return;
      const first = node.arguments[0];
      const single = literalText(first);
      if (single && !found.has(single)) found.set(single, { sourceAbs: file, line: lineOfNode(sf, node) });
      if (ts.isArrayLiteralExpression(first)) {
        for (const element of first.elements) {
          const value = literalText(element);
          if (value && !found.has(value)) found.set(value, { sourceAbs: file, line: lineOfNode(sf, node) });
        }
      }
    });
  }
  return ordered(found).map((item) => ({ ...item, detail: 'RuleProvider action (canExecute gate)' }));
}

function filesDeclaring(methodNames) {
  const out = [];
  for (const file of libFiles) {
    const sf = treeOf(file);
    if (!sf) continue;
    let hit = false;
    walkTree(sf, (node) => {
      if (ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left)
        && methodNames.includes(node.left.name.text)) hit = true;
    });
    if (hit) out.push(file);
  }
  return out;
}
function bagKeysIn(file, methodNames) {
  const sf = treeOf(file);
  const found = new Map();
  if (!sf) return found;
  walkTree(sf, (node) => {
    const isTargetMethod = ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left)
      && methodNames.includes(node.left.name.text);
    if (!isTargetMethod) return;
    walkTree(node.right, (inner) => {
      if (ts.isCallExpression(inner) && memberLabel(inner.expression) === 'assign' && inner.arguments.length >= 2
        && ts.isIdentifier(inner.arguments[0])
        && ts.isObjectLiteralExpression(inner.arguments[1])) {
        for (const entry of entriesOf(inner.arguments[1], sf)) {
          if (!found.has(entry.key)) found.set(entry.key, { sourceAbs: file, line: entry.line });
        }
      }
    });
  });
  return found;
}

function collectPalette() {
  const items = [];
  for (const file of filesDeclaring(['getPaletteEntries'])) {
    for (const [key, value] of bagKeysIn(file, ['getPaletteEntries'])) {
      items.push({ key, ...value, detail: 'Palette entry (group/className/title in source)' });
    }
  }
  return items;
}

function collectContextPad() {
  const found = new Map();
  const methods = ['getContextPadEntries', 'getMultiElementContextPadEntries'];
  for (const file of filesDeclaring(methods)) {
    for (const [key, value] of bagKeysIn(file, methods)) {
      if (!found.has(key)) found.set(key, value);
    }
    const sf = treeOf(file);
    if (!sf) continue;
    walkTree(sf, (node) => {
      if (ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left) && node.left.name.text === '_getEntries') {
        walkTree(node.right, (inner) => {
          if (ts.isReturnStatement(inner) && inner.expression && ts.isObjectLiteralExpression(inner.expression)) {
            for (const entry of entriesOf(inner.expression, sf)) {
              if (!found.has(entry.key)) found.set(entry.key, { sourceAbs: file, line: entry.line });
            }
          }
        });
      }
    });
  }
  return ordered(found).map((item) => ({ ...item, detail: 'Context-pad entry key' }));
}

function collectReplaceMenu() {
  const found = new Map();
  for (const file of libFiles) {
    const sf = treeOf(file);
    if (!sf) continue;
    walkTree(sf, (node) => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'replaceWith' && node.arguments.length) {
        const id = literalText(node.arguments[0]);
        if (!id) return;
        let action = 'replace-with-' + id;
        const extra = node.arguments[1];
        if (extra && ts.isObjectLiteralExpression(extra)) {
          for (const prop of extra.properties) {
            if (ts.isPropertyAssignment(prop) && keyText(prop.name) === 'actionName') {
              const value = literalText(prop.initializer);
              if (value) action = value;
            }
          }
        }
        if (!found.has(action)) found.set(action, { sourceAbs: file, line: lineOfNode(sf, node) });
      }
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'SEQUENCE_FLOW' && node.initializer) {
        walkTree(node.initializer, (inner) => {
          if (ts.isPropertyAssignment(inner) && keyText(inner.name) === 'actionName') {
            const value = literalText(inner.initializer);
            if (value && !found.has(value)) found.set(value, { sourceAbs: file, line: lineOfNode(sf, inner) });
          }
        });
      }
    });
  }
  return ordered(found).map((item) => ({ ...item, detail: 'ReplaceOptions actionName (ReplaceMenuProvider entry)' }));
}

function receiverMentions(node, word) {
  let text = '';
  walkTree(node, (inner) => { if (ts.isIdentifier(inner)) text += inner.text + ' '; });
  return text.includes(word);
}
function popupProviderFiles() {
  const out = [];
  for (const file of libFiles) {
    const sf = treeOf(file);
    if (!sf) continue;
    let hit = false;
    walkTree(sf, (node) => {
      if (ts.isCallExpression(node) && memberLabel(node.expression) === 'registerProvider'
        && ts.isPropertyAccessExpression(node.expression) && receiverMentions(node.expression.expression, 'popupMenu')) hit = true;
    });
    if (hit) out.push(file);
  }
  return out;
}
function collectPopupMenu() {
  const found = new Map();
  const note = (key, file, line, detail) => { if (key && !found.has(key)) found.set(key, { sourceAbs: file, line, detail }); };
  const files = popupProviderFiles();
  const registrations = [];
  for (const file of files) {
    const sf = treeOf(file);
    if (!sf) continue;
    walkTree(sf, (node) => {
      if (ts.isCallExpression(node) && memberLabel(node.expression) === 'registerProvider' && node.arguments.length
        && ts.isPropertyAccessExpression(node.expression) && receiverMentions(node.expression.expression, 'popupMenu')) {
        const value = literalText(node.arguments[0]);
        if (value) registrations.push({ id: value, sourceAbs: file, line: lineOfNode(sf, node) });
      }
    });
  }
  const tally = new Map();
  for (const reg of registrations) tally.set(reg.id, (tally.get(reg.id) || 0) + 1);
  for (const reg of registrations) {
    const stem = basename(reg.sourceAbs).replace(/\.js$/, '');
    note(tally.get(reg.id) > 1 ? reg.id + ' (' + stem + ')' : reg.id, reg.sourceAbs, reg.line, 'Popup-menu provider id');
  }
  for (const file of files) {
    const sf = treeOf(file);
    if (!sf) continue;
    walkTree(sf, (node) => {
      if (ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left) && node.left.name.text.includes('HeaderEntries')) {
        walkTree(node.right, (inner) => {
          if (ts.isReturnStatement(inner) && inner.expression && ts.isObjectLiteralExpression(inner.expression)) {
            for (const entry of entriesOf(inner.expression, sf)) note(entry.key, file, entry.line, 'Popup-menu header entry (ReplaceMenuProvider)');
          }
        });
      }
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
        && ts.isElementAccessExpression(node.left)
        && ts.isBinaryExpression(node.left.argumentExpression)
        && node.left.argumentExpression.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        const prefix = literalText(node.left.argumentExpression.left);
        const iterated = node.left.argumentExpression.right;
        if (prefix && ts.isIdentifier(iterated)) {
          walkTree(sf, (candidate) => {
            if (ts.isCallExpression(candidate) && ts.isIdentifier(candidate.expression) && candidate.expression.text === 'forEach'
              && candidate.arguments.length && ts.isIdentifier(candidate.arguments[0]) && candidate.arguments[0].text === iterated.text) {
              void candidate;
            }
          });
          // The iterated values live in the string array handed to forEach
          // through the loop variable's origin: resolve the array variable
          // whose elements the enclosing forEach consumes by name lookup.
          let values = [];
          walkTree(sf, (candidate) => {
            if (ts.isVariableDeclaration(candidate) && candidate.initializer && ts.isArrayLiteralExpression(candidate.initializer)) {
              const elements = candidate.initializer.elements.map((el) => literalText(el)).filter(Boolean);
              if (elements.length >= 2 && candidate.name.getText(sf).length) {
                // Keep the array that the _getEntries body actually iterates:
                // it is referenced as the first forEach argument in that body.
                void elements;
              }
            }
          });
          // Direct resolution: find forEach(<arrayVar>, ...) enclosing this
          // assignment by scanning the file for that call shape.
          walkTree(sf, (candidate) => {
            if (ts.isCallExpression(candidate) && memberLabel(candidate.expression) === 'forEach' && candidate.arguments.length >= 1) {
              const head = candidate.arguments[0];
              // forEach imported helper is called as forEach(array, fn).
              void head;
            }
          });
          void values;
        }
      }
    });
    // Align entries: '<prefix>' + <loop value> over each string-array
    // variable consumed by a forEach inside the entry builder.
    const arraysByName = new Map();
    walkTree(sf, (node) => {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
        arraysByName.set(node.name.text, node.initializer.elements.map((el) => literalText(el)).filter(Boolean));
      }
    });
    walkTree(sf, (node) => {
      if (!ts.isCallExpression(node) || !ts.isIdentifier(node.expression) || node.expression.text !== 'forEach') return;
      if (!node.arguments.length || !ts.isIdentifier(node.arguments[0])) return;
      const values = arraysByName.get(node.arguments[0].text);
      if (!values || !values.length) return;
      walkTree(node, (inner) => {
        if (ts.isBinaryExpression(inner) && inner.operatorToken.kind === ts.SyntaxKind.EqualsToken
          && ts.isElementAccessExpression(inner.left) && ts.isBinaryExpression(inner.left.argumentExpression)) {
          const prefix = literalText(inner.left.argumentExpression.left);
          if (prefix) for (const value of values) note(prefix + value, file, lineOfNode(sf, inner), 'Align-elements popup entry');
        }
      });
    });
    // Distribute entries: a returned entries object literal in the builder.
    walkTree(sf, (node) => {
      if (ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left) && node.left.name.text === '_getEntries') {
        walkTree(node.right, (inner) => {
          if (ts.isVariableDeclaration(inner) && inner.initializer && ts.isObjectLiteralExpression(inner.initializer)) {
            for (const entry of entriesOf(inner.initializer, sf)) {
              if (entry.key.includes('distribute-elements-')) note(entry.key, file, entry.line, 'Distribute-elements popup entry');
            }
          }
          if (ts.isReturnStatement(inner) && inner.expression && ts.isObjectLiteralExpression(inner.expression)) {
            for (const entry of entriesOf(inner.expression, sf)) {
              if (entry.key.includes('distribute-elements-')) note(entry.key, file, entry.line, 'Distribute-elements popup entry');
            }
          }
        });
      }
    });
  }
  return ordered(found);
}

function serviceFileIndex() {
  // service name -> implementation file, rebuilt from module objects:
  // an export-assigned object whose properties pair a service name with
  // an array holding the kind marker and an imported implementation.
  const byServiceFile = new Map();
  const byServiceName = new Map();
  for (const file of libFiles) {
    if (basename(file) !== 'index.js') continue;
    const sf = treeOf(file);
    if (!sf) continue;
    const imported = new Map();
    walkTree(sf, (node) => {
      if (ts.isImportDeclaration(node) && node.importClause && node.importClause.name) {
        imported.set(node.importClause.name.text, node.moduleSpecifier.text);
      }
    });
    walkTree(sf, (node) => {
      if (!ts.isExportAssignment(node) || !ts.isObjectLiteralExpression(node.expression)) return;
      for (const prop of node.expression.properties) {
        if (!ts.isPropertyAssignment(prop) || !ts.isArrayLiteralExpression(prop.initializer)) continue;
        if (prop.initializer.elements.length < 2) continue;
        if (literalText(prop.initializer.elements[0]) !== 'type') continue;
        const implNode = prop.initializer.elements[1];
        if (!ts.isIdentifier(implNode)) continue;
        const spec = imported.get(implNode.text);
        if (!spec) continue;
        const implFile = resolveSpecifier(spec, file);
        if (!implFile) continue;
        const serviceName = keyText(prop.name);
        byServiceFile.set(implFile, serviceName);
        byServiceName.set(libTagOf(file) + ':' + implNode.text, implFile);
      }
    });
  }
  return { byServiceFile, byServiceName };
}
function resolveSpecifier(spec, fromFile) {
  let base;
  if (spec.startsWith('diagram-js/lib/')) {
    const home = libRoots.find((r) => r.tag === 'diagram-js').home;
    base = join(home, 'lib', spec.slice('diagram-js/lib/'.length));
  } else if (spec.startsWith('bpmn-js/lib/')) {
    const home = libRoots.find((r) => r.tag === 'bpmn-js').home;
    base = join(home, 'lib', spec.slice('bpmn-js/lib/'.length));
  } else {
    base = resolve(dirname(fromFile), spec);
  }
  const hit = [base, base + '.js', join(base, 'index.js')]
    .find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
  return hit || null;
}

function collectKeyboard() {
  const found = new Map();
  const note = (key, file, line, detail) => {
    if (key && !found.has(key)) found.set(key, { sourceAbs: file, line, detail });
  };
  // Key groups declared as exported arrays, keyed by lowered suffix.
  const groups = new Map();
  for (const file of libFiles) {
    const sf = treeOf(file);
    if (!sf) continue;
    walkTree(sf, (node) => {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text.startsWith('KEYS_')
        && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
        const values = node.initializer.elements.map((el) => literalText(el)).filter(Boolean);
        groups.set(node.name.text.slice('KEYS_'.length).toLowerCase(), { name: node.name.text, values });
      }
    });
  }
  // (1) Shortcut map: an exported binding table object.
  for (const file of libFiles) {
    const sf = treeOf(file);
    if (!sf) continue;
    walkTree(sf, (node) => {
      if (!ts.isVariableDeclaration(node) || !ts.isIdentifier(node.name)) return;
      if (!node.name.text.includes('KEY_BINDINGS')) return;
      if (!node.initializer || !ts.isObjectLiteralExpression(node.initializer)) return;
      for (const entry of entriesOf(node.initializer, sf)) {
        const binding = entry.node.initializer;
        if (!binding || !ts.isObjectLiteralExpression(binding)) continue;
        let keyValue = '';
        let modifier = '';
        for (const bp of binding.properties) {
          if (!ts.isPropertyAssignment(bp)) continue;
          if (keyText(bp.name) === 'key') keyValue = literalText(bp.initializer) || '';
          if (keyText(bp.name) === 'modifier') modifier = literalText(bp.initializer) || '';
        }
        note(entry.key, file, entry.line, 'key ' + (modifier ? modifier + '+' : '') + keyValue);
      }
    });
  }
  // (2) Default bindings: calls to a local addListener helper whose
  // first argument names the action; every call line is kept.
  const listenerLines = new Map();
  for (const file of libFiles) {
    const sf = treeOf(file);
    if (!sf) continue;
    walkTree(sf, (node) => {
      if (!ts.isCallExpression(node) || !ts.isIdentifier(node.expression)) return;
      if (node.expression.text !== 'addListener' || !node.arguments.length) return;
      const action = literalText(node.arguments[0]);
      if (!action) return;
      if (!listenerLines.has(action)) listenerLines.set(action, { file, lines: [] });
      listenerLines.get(action).lines.push(lineOfNode(sf, node));
    });
  }
  for (const [action, info] of listenerLines) {
    let detail = info.lines.length > 1
      ? 'diagram-js default binding (' + info.lines.length + ' listeners, lines ' + info.lines.join(', ') + ')'
      : 'diagram-js default binding (guarded by editorActions.isRegistered)';
    const group = groups.get(action);
    if (group) detail += '; ' + group.name + ' = [' + group.values.join(', ') + ']';
    note(action, info.file, info.lines[0], detail);
  }
  // (3) Registered editor actions, wherever a register call names one.
  for (const file of libFiles) {
    const sf = treeOf(file);
    if (!sf) continue;
    walkTree(sf, (node) => {
      if (!ts.isCallExpression(node)) return;
      const label = memberLabel(node.expression);
      if (label !== 'register' && label !== '_registerAction') return;
      if (!node.arguments.length) return;
      const action = literalText(node.arguments[0]);
      if (action) note(action, file, lineOfNode(sf, node), 'registered editor action');
    });
  }
  // (4) Keys handled without an editor action: standalone isKey checks
  // inside keyboard-event callbacks (or their local helpers). The key
  // prefix is the didi service name of the owning implementation file.
  const { byServiceFile } = serviceFileIndex();
  for (const file of libFiles) {
    const sf = treeOf(file);
    if (!sf) continue;
    const prefix = byServiceFile.get(file);
    if (!prefix) continue;
    const helpers = new Set();
    const callbacks = [];
    walkTree(sf, (node) => {
      if (!ts.isCallExpression(node)) return;
      const isListen = ts.isIdentifier(node.expression) && node.expression.text === 'listen'
        && node.arguments.some((a) => literalText(a) === 'keydown' || literalText(a) === 'keyup');
      const isKeyListener = ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'addListener';
      if (!isListen && !isKeyListener) return;
      for (const arg of node.arguments) {
        if (ts.isFunctionExpression(arg) || ts.isArrowFunction(arg)) callbacks.push(arg);
      }
    });
    for (const cb of callbacks) {
      walkTree(cb, (node) => {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) helpers.add(node.expression.text);
      });
    }
    const scanIsKey = (root) => {
      walkTree(root, (node) => {
        if (!ts.isCallExpression(node) || !ts.isIdentifier(node.expression)) return;
        if (node.expression.text !== 'isKey' || !node.arguments.length) return;
        const first = node.arguments[0];
        const single = literalText(first);
        if (single) note(prefix + ':' + single, file, lineOfNode(sf, node), 'key handling without editor action (isKey)');
        if (ts.isArrayLiteralExpression(first)) {
          for (const el of first.elements) {
            const value = literalText(el);
            if (value) note(prefix + ':' + value, file, lineOfNode(sf, node), 'key handling without editor action (isKey)');
          }
        }
      });
    };
    for (const cb of callbacks) scanIsKey(cb);
    walkTree(sf, (node) => {
      if (ts.isFunctionDeclaration(node) && node.name && helpers.has(node.name.text) && node.body) scanIsKey(node.body);
    });
  }
  return ordered(found);
}

function collectEvents() {
  const found = new Map();
  const deferredTables = [];
  const deferredBare = [];
  const note = (name, file, line) => {
    if (name && !found.has(name)) found.set(name, { sourceAbs: file, line });
  };
  for (const file of libFiles) {
    const sf = treeOf(file);
    if (!sf) continue;
    // Per-file string and string-array constants.
    const constText = new Map();
    const constList = new Map();
    walkTree(sf, (node) => {
      if (!ts.isVariableDeclaration(node) || !ts.isIdentifier(node.name) || !node.initializer) return;
      const single = literalText(node.initializer);
      if (single) constText.set(node.name.text, single);
      if (ts.isArrayLiteralExpression(node.initializer)) {
        constList.set(node.name.text, node.initializer.elements.map((el) => literalText(el)).filter(Boolean));
      }
    });
    for (const [name, value] of constText) {
      if (name.includes('EVENT') && value.includes('.')) note(value, file, 1);
    }
    // Prefix applied by this file's emit/fire helper, when it defines
    // one as a prototype method: read it from the helper's own fire
    // call (plain forwarding means no prefix).
    let helperPrefix = null;
    let barePrefix = null;
    walkTree(sf, (node) => {
      if (!ts.isBinaryExpression(node) || node.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return;
      if (!ts.isPropertyAccessExpression(node.left)) return;
      const method = node.left.name.text;
      if (method !== '_emit' && method !== '_fire') return;
      walkTree(node.right, (inner) => {
        if (!ts.isCallExpression(inner) || memberLabel(inner.expression) !== 'fire') return;
        if (!inner.arguments.length) return;
        const arg = inner.arguments[0];
        if (ts.isTemplateExpression(arg)) helperPrefix = arg.head.text;
        else if (ts.isBinaryExpression(arg) && ts.isStringLiteral(arg.left)) helperPrefix = arg.left.text;
        else if (ts.isIdentifier(arg)) helperPrefix = '';
      });
    });
    walkTree(sf, (node) => {
      if (!ts.isFunctionDeclaration(node) || !node.name || node.name.text !== 'fire' || !node.body) return;
      walkTree(node.body, (inner) => {
        if (!ts.isCallExpression(inner) || memberLabel(inner.expression) !== 'fire') return;
        if (!inner.arguments.length) return;
        const arg = inner.arguments[0];
        if (ts.isBinaryExpression(arg) && ts.isStringLiteral(arg.left)) barePrefix = arg.left.text;
      });
    });
    walkTree(sf, (node) => {
      // Dotted-name tables: an object whose string values are all
      // event-shaped names sharing one prefix. Deferred until after
      // the direct call-site pass, as in the inventory.
      if (ts.isObjectLiteralExpression(node)) {
        const values = [];
        for (const prop of node.properties) {
          if (ts.isPropertyAssignment(prop)) {
            const value = literalText(prop.initializer);
            if (value && /^[a-z][\w]*\.[\w.]+$/.test(value)) values.push({ value, line: lineOfNode(sf, prop) });
          }
        }
        if (values.length >= 3) {
          const prefix = values[0].value.split('.')[0];
          if (values.every((v) => v.value.split('.')[0] === prefix)) {
            for (const v of values) deferredTables.push({ name: v.value, file, line: v.line });
          }
        }
      }
      if (!ts.isCallExpression(node)) return;
      const label = memberLabel(node.expression);
      const isMemberCall = ts.isPropertyAccessExpression(node.expression);
      const isBareFire = ts.isIdentifier(node.expression) && node.expression.text === 'fire';
      if (isMemberCall && (label === 'fire' || label === 'on' || label === 'once')) {
        if (node.arguments.length) {
          const first = node.arguments[0];
          const single = literalText(first);
          if (single) note(single, file, lineOfNode(sf, node));
          if (ts.isArrayLiteralExpression(first)) {
            for (const el of first.elements) {
              const value = literalText(el);
              if (value) note(value, file, lineOfNode(sf, node));
            }
          }
          if (ts.isTemplateExpression(first) && first.head.text.endsWith('.')) {
            note(first.head.text, file, lineOfNode(sf, node));
          }
          if (ts.isBinaryExpression(first) && ts.isStringLiteral(first.left)) {
            note(first.left.text, file, lineOfNode(sf, node));
          }
          walkTree(first, (inner) => {
            if (!ts.isIdentifier(inner)) return;
            if (constText.has(inner.text)) note(constText.get(inner.text), file, lineOfNode(sf, node));
            if (constList.has(inner.text)) {
              for (const value of constList.get(inner.text)) note(value, file, lineOfNode(sf, node));
            }
          });
        }
      }
      if ((label === '_emit' || label === '_fire') && helperPrefix !== null && node.arguments.length) {
        const firstText = literalText(node.arguments[0]);
        const secondText = node.arguments.length > 1 ? literalText(node.arguments[1]) : null;
        if (secondText) note(helperPrefix + secondText, file, lineOfNode(sf, node));
        else if (firstText) note(helperPrefix + firstText, file, lineOfNode(sf, node));
      }
      if (isBareFire && barePrefix && node.arguments.length) {
        const value = literalText(node.arguments[0]);
        if (value && !value.endsWith('.')) deferredBare.push({ name: barePrefix + value, file, line: lineOfNode(sf, node) });
      }
    });
  }
  for (const d of deferredTables) note(d.name, d.file, d.line);
  for (const d of deferredBare) note(d.name, d.file, d.line);
  return ordered(found).map((item) => ({
    ...item,
    detail: item.key.endsWith('.') ? 'dynamic prefix (concrete names built at runtime)' : 'EventBus event name',
    ...(item.key.endsWith('.') ? { dynamicPrefix: true } : {}),
  }));
}

function isDefaultConstructor(node) {
  if (!ts.isFunctionDeclaration(node)) return false;
  const mods = ts.getModifiers ? ts.getModifiers(node) : node.modifiers;
  if (!mods) return false;
  return mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    && mods.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
}
function paramNames(node) {
  return (node.parameters || []).map((p) => (ts.isIdentifier(p.name) ? p.name.text : ''));
}
function typedefFields(file, typedefName) {
  // Fields of the JSDoc typedef block closed by the given name, read
  // from the block comments of the containing file.
  const sf = treeOf(file);
  if (!sf) return [];
  const text = sf.getFullText();
  const fields = [];
  for (const chunk of text.split('/**')) {
    const end = chunk.indexOf('*/');
    if (end < 0) continue;
    const block = chunk.slice(0, end);
    if (!block.includes(typedefName)) continue;
    const open = block.indexOf('{ {');
    const close = block.indexOf('} &');
    if (open < 0 || close < 0 || close < open) continue;
    const inner = block.slice(open + 3, close);
    for (const line of inner.split('\n')) {
      const m = line.match(/\*\s+([A-Za-z][\w]*)\??:/);
      if (m) fields.push(m[1]);
    }
  }
  return fields;
}
function collectConfig() {
  const found = new Map();
  const note = (key, file, line, detail) => {
    if (key && !found.has(key)) found.set(key, { sourceAbs: file, line, detail });
  };
  // Viewer and diagram option typedefs live in lib-root entry files;
  // locate them by the typedef name in their documentation blocks.
  for (const file of libFiles) {
    const rel = fromLib(file);
    if (rel.includes('/')) continue;
    for (const field of typedefFields(file, 'BaseViewerOptions')) {
      note('viewer.' + field, file, 1, 'BaseViewerOptions field');
    }
    for (const field of typedefFields(file, 'DiagramOptions')) {
      note('diagram.' + field, file, 1, 'DiagramOptions field');
    }
  }
  for (const file of libFiles) {
    const sf = treeOf(file);
    if (!sf) continue;
    const rel = fromLib(file);
    const isViewerFile = !rel.includes('/') && typedefFields(file, 'BaseViewerOptions').length > 0;
    if (isViewerFile) {
      walkTree(sf, (node) => {
        if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'options') {
          const key = 'viewer.' + node.name.text;
          if (!found.has(key)) note(key, file, lineOfNode(sf, node), 'options read in BaseViewer');
        }
      });
    }
    // Feature prefix from this file's injection declaration.
    let feature = null;
    let featureLine = 1;
    walkTree(sf, (node) => {
      if (feature) return;
      if (!ts.isBinaryExpression(node) || node.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return;
      if (!ts.isPropertyAccessExpression(node.left) || node.left.name.text !== '$inject') return;
      if (!ts.isArrayLiteralExpression(node.right)) return;
      for (const el of node.right.elements) {
        const value = literalText(el);
        if (value && value.startsWith('config.')) {
          feature = value.slice('config.'.length);
          featureLine = lineOfNode(sf, node);
        }
      }
    });
    if (!feature) continue;
    const prefix = 'config.' + feature;
    note(prefix, file, featureLine, 'didi config injection');
    // Methods the constructor forwards its own `config` to (called as
    // `this.<method>(config ...)`) read DI config through their
    // parameter; other methods declaring a `config` parameter do not.
    const forwarded = new Set();
    walkTree(sf, (node) => {
      if (!ts.isCallExpression(node) || !ts.isPropertyAccessExpression(node.expression)) return;
      if (node.expression.expression.kind !== ts.SyntaxKind.ThisKeyword) return;
      if (!node.arguments.length) return;
      let mentionsConfig = false;
      walkTree(node.arguments[0], (inner) => {
        if (ts.isIdentifier(inner) && inner.text === 'config') mentionsConfig = true;
      });
      if (mentionsConfig) forwarded.add(node.expression.name.text);
    });
    const methodOfFn = new Map();
    walkTree(sf, (node) => {
      if (ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left)
        && (ts.isFunctionExpression(node.right) || ts.isArrowFunction(node.right))) {
        methodOfFn.set(node.right, node.left.name.text);
      }
    });
    // Reads, with the enclosing function stack: a bare `config` read
    // counts unless the innermost function declares its own `config`
    // parameter without being the constructor or a forwarded method.
    const visit = (node, fnStack) => {
      const isFn = ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node);
      const stack = isFn ? [...fnStack, node] : fnStack;
      if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'config') {
        const inner = stack[stack.length - 1];
        const shadowed = inner && !isDefaultConstructor(inner) && paramNames(inner).includes('config')
          && !forwarded.has(methodOfFn.get(inner));
        if (!shadowed && node.name.text !== feature) {
          note(prefix + '.' + node.name.text, file, lineOfNode(sf, node), 'feature config read');
        }
      }
      if (ts.isPropertyAccessExpression(node) && ts.isPropertyAccessExpression(node.expression)
        && node.expression.name.text === '_config' && node.expression.expression.kind === ts.SyntaxKind.ThisKeyword) {
        note(prefix + '.' + node.name.text, file, lineOfNode(sf, node), 'feature config read');
      }
      if (ts.isElementAccessExpression(node) && ts.isPropertyAccessExpression(node.expression)
        && node.expression.name.text === '_config') {
        const arg = node.argumentExpression;
        const texts = [];
        if (ts.isConditionalExpression(arg)) {
          const a = literalText(arg.whenTrue);
          const b = literalText(arg.whenFalse);
          if (a) texts.push(a);
          if (b) texts.push(b);
        } else {
          const single = literalText(arg);
          if (single) texts.push(single);
        }
        for (const t of texts) note(prefix + '.' + t, file, lineOfNode(sf, node), 'feature config read');
      }
      ts.forEachChild(node, (child) => visit(child, stack));
    };
    visit(sf, []);
  }
  return ordered(found);
}

function collectRenderer() {
  const found = new Map();
  const note = (key, file, line, detail) => {
    if (key && !found.has(key)) found.set(key, { sourceAbs: file, line, detail });
  };
  for (const file of libFiles) {
    if (libTagOf(file) !== 'bpmn-js') continue;
    const sf = treeOf(file);
    if (!sf) continue;
    walkTree(sf, (node) => {
      if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
        && ts.isPropertyAccessExpression(node.left) && node.left.name.text === 'handlers'
        && node.left.expression.kind === ts.SyntaxKind.ThisKeyword
        && ts.isObjectLiteralExpression(node.right)) {
        for (const entry of entriesOf(node.right, sf)) {
          note(entry.key, file, entry.line, 'BpmnRenderer handler (shape/connection drawing)');
        }
      }
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer
        && ts.isObjectLiteralExpression(node.initializer)) {
        const detail = node.name.text === 'eventIconRenderers'
          ? 'BpmnRenderer event icon renderer'
          : node.name.text === 'taskMarkerRenderers'
            ? 'BpmnRenderer task marker renderer'
            : null;
        if (detail) {
          for (const entry of entriesOf(node.initializer, sf)) note(entry.key, file, entry.line, detail);
        }
      }
    });
  }
  return ordered(found);
}

function jsonObject(node) {
  const map = new Map();
  if (!node || !ts.isObjectLiteralExpression(node)) return map;
  for (const prop of node.properties) {
    if (ts.isPropertyAssignment(prop)) map.set(keyText(prop.name), prop.initializer);
  }
  return map;
}
function jsonText(node) {
  return node && ts.isStringLiteral(node) ? node.text : null;
}
function jsonTextList(node) {
  if (!node || !ts.isArrayLiteralExpression(node)) return [];
  return node.elements.map((el) => jsonText(el)).filter((v) => v !== null);
}
function descriptorFiles() {
  // Descriptor documents are those the moddle entry files import as
  // JSON packages; test fixtures elsewhere in the checkout are not
  // registered packages and are not descriptors.
  const files = new Set();
  for (const entry of readdirSync(join(moddleHome, 'lib'), { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
    const entryFile = join(moddleHome, 'lib', entry.name);
    const sf = ts.createSourceFile(entryFile, readFileSync(entryFile, 'utf8'), ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
    walkTree(sf, (node) => {
      if (!ts.isImportDeclaration(node)) return;
      const spec = node.moduleSpecifier.text;
      if (!spec.endsWith('.json')) return;
      const resolved = resolve(join(dirname(entryFile), spec));
      if (existsSync(resolved) && statSync(resolved).isFile()) files.add(resolved);
    });
  }
  return [...files].sort();
}
function collectModdleTypes() {
  const items = [];
  for (const file of descriptorFiles()) {
    let parsed;
    try {
      parsed = ts.parseJsonText(file, readFileSync(file, 'utf8'));
    } catch { continue; }
    const rootStatement = parsed.statements && parsed.statements[0];
    const rootObject = rootStatement && ts.isExpressionStatement(rootStatement) ? rootStatement.expression : null;
    const doc = jsonObject(rootObject);
    const prefix = jsonText(doc.get('prefix'));
    const types = doc.get('types');
    if (!prefix || !types || !ts.isArrayLiteralExpression(types)) continue;
    const sf = parsed;
    const lineFor = (objNode) => {
      for (const prop of objNode.properties) {
        if (ts.isPropertyAssignment(prop) && keyText(prop.name) === 'name') return lineOfNode(sf, prop);
      }
      return lineOfNode(sf, objNode);
    };
    for (const el of types.elements) {
      const type = jsonObject(el);
      const name = jsonText(type.get('name'));
      if (!name) continue;
      const supers = jsonTextList(type.get('superClass'));
      const ext = jsonTextList(type.get('extends'));
      const props = type.get('properties');
      const propCount = props && ts.isArrayLiteralExpression(props) ? props.elements.length : 0;
      const abstractNode = type.get('isAbstract');
      const isAbstract = abstractNode && abstractNode.kind === ts.SyntaxKind.TrueKeyword;
      const parts = [isAbstract ? 'abstract' : 'concrete', 'superClass: ' + (supers.join(', ') || 'none')];
      if (ext.length) parts.push('extends: ' + ext.join(', '));
      parts.push('own properties: ' + propCount);
      items.push({
        key: prefix + ':' + name,
        sourceAbs: file,
        line: lineFor(el),
        detail: parts.join('; '),
        abstract: !!isAbstract,
      });
    }
    const enums = doc.get('enumerations');
    if (enums && ts.isArrayLiteralExpression(enums)) {
      for (const el of enums.elements) {
        const entry = jsonObject(el);
        const name = jsonText(entry.get('name'));
        if (!name) continue;
        const raw = entry.get('literalValues') || entry.get('values');
        const values = [];
        if (raw && ts.isArrayLiteralExpression(raw)) {
          for (const v of raw.elements) {
            const asText = jsonText(v);
            if (asText) values.push(asText);
            else {
              const asObj = jsonObject(v);
              const inner = jsonText(asObj.get('name'));
              if (inner) values.push(inner);
            }
          }
        }
        items.push({
          key: prefix + ':' + name,
          sourceAbs: file,
          line: lineFor(el),
          detail: 'enumeration; values: ' + values.join(', '),
          enumeration: true,
        });
      }
    }
  }
  return items.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}

function collectApi() {
  const { byServiceName } = serviceFileIndex();
  const classes = new Map();
  const noteClass = (label, cls, file) => {
    if (cls && file) classes.set(label + ':' + cls, { label, cls, file });
  };
  // Entry classes from prototype assignments in lib-root files.
  for (const file of libFiles) {
    if (fromLib(file).includes('/')) continue;
    const sf = treeOf(file);
    if (!sf) continue;
    walkTree(sf, (node) => {
      if (ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left)
        && ts.isPropertyAccessExpression(node.left.expression)
        && node.left.expression.name.text === 'prototype'
        && ts.isIdentifier(node.left.expression.expression)) {
        noteClass(libTagOf(file), node.left.expression.expression.text, file);
      }
    });
  }
  for (const [labelClass, file] of byServiceName) {
    const splitAt = labelClass.indexOf(':');
    noteClass(labelClass.slice(0, splitAt), labelClass.slice(splitAt + 1), file);
  }
  const found = new Map();
  for (const { label, cls, file } of classes.values()) {
    const sf = treeOf(file);
    if (!sf) continue;
    const declaredFns = new Set();
    walkTree(sf, (node) => {
      if (ts.isFunctionDeclaration(node) && node.name) declaredFns.add(node.name.text);
    });
    const noteMethod = (method, line) => {
      const key = method && !method.startsWith('_') ? label + ':' + cls + '.' + method : null;
      if (key && !found.has(key)) {
        found.set(key, { sourceAbs: file, line, detail: 'public method of ' + cls });
      }
    };
    walkTree(sf, (node) => {
      if (!ts.isBinaryExpression(node) || node.operatorToken.kind !== ts.SyntaxKind.EqualsToken) return;
      const left = node.left;
      if (ts.isPropertyAccessExpression(left) && ts.isPropertyAccessExpression(left.expression)
        && left.expression.name.text === 'prototype'
        && ts.isIdentifier(left.expression.expression)
        && left.expression.expression.text === cls) {
        noteMethod(left.name.text, lineOfNode(sf, node));
      }
      if (ts.isPropertyAccessExpression(left) && left.expression.kind === ts.SyntaxKind.ThisKeyword) {
        const rhs = node.right;
        if (ts.isFunctionExpression(rhs) || ts.isArrowFunction(rhs)) {
          noteMethod(left.name.text, lineOfNode(sf, node));
        } else if (ts.isIdentifier(rhs) && declaredFns.has(rhs.text)) {
          noteMethod(left.name.text, lineOfNode(sf, node));
        }
      }
    });
  }
  return ordered(found);
}

function collectExamples() {
  const items = [];
  for (const entry of readdirSync(examplesHome, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (!entry.isDirectory()) continue;
    const readme = join(examplesHome, entry.name, 'README.md');
    if (!existsSync(readme)) continue;
    let heading = null;
    for (const line of readFileSync(readme, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) { heading = trimmed; break; }
    }
    if (!heading) continue;
    items.push({ key: entry.name, sourceAbs: readme, line: 1, detail: heading.slice(0, 120) });
  }
  return items;
}

export function extractAstAll() {
  return {
    module: collectModules(),
    command: collectCommands(),
    rule: collectRules(),
    palette: collectPalette(),
    'context-pad': collectContextPad(),
    'replace-menu': collectReplaceMenu(),
    'popup-menu': collectPopupMenu(),
    keyboard: collectKeyboard(),
    event: collectEvents(),
    config: collectConfig(),
    renderer: collectRenderer(),
    'moddle-type': collectModdleTypes(),
    api: collectApi(),
    example: collectExamples(),
  };
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const all = extractAstAll();
  const counts = {};
  for (const [family, items] of Object.entries(all)) counts[family] = items.length;
  console.log(JSON.stringify(counts, null, 2));
}
