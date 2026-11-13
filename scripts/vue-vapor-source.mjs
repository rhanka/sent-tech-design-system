import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

export const packages = ['components-vue', 'dataviz-vue'];
export const excluded = /\.test\.|\.d\.ts$|test-support|fixtures|\/__/;
export function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]).sort();
}

// Report legacy API origins, rather than just calls: once a render API is
// imported or extracted it can be aliased, passed around or called indirectly.
// Namespace escapes are conservative legacy usage too; direct access to known
// non-render members (Vue.ref, for example) remains permitted.
export function renderCalls(source, filename = 'source.ts') {
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const forbidden = new Set(['h', 'defineComponent']);
  const namespaces = new Set();
  const hits = new Set();
  const report = node => hits.add(ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1);
  for (const node of ast.statements) {
    if (!ts.isImportDeclaration(node) || node.moduleSpecifier.text !== 'vue') continue;
    if (node.importClause?.isTypeOnly) continue;
    const bindings = node.importClause?.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) namespaces.add(bindings.name.text);
    if (bindings && ts.isNamedImports(bindings)) for (const item of bindings.elements) {
      if (!item.isTypeOnly && forbidden.has((item.propertyName ?? item.name).text)) report(item);
    }
  }
  function visit(node) {
    // Imports were handled above; type references cannot create VDOM nodes.
    if (ts.isImportDeclaration(node) || ts.isTypeNode(node)) return;
    if (ts.isIdentifier(node) && namespaces.has(node.text)) {
      const parent = node.parent;
      if (ts.isPropertyAccessExpression(parent) && parent.expression === node) {
        if (forbidden.has(parent.name.text)) report(parent);
      } else if (ts.isElementAccessExpression(parent) && parent.expression === node) {
        const key = parent.argumentExpression;
        if (!ts.isStringLiteralLike(key) || forbidden.has(key.text)) report(parent);
      } else {
        // Includes local namespace aliases, destructuring, spreads and escapes
        // through function arguments. No downstream alias can hide the origin.
        report(node);
      }
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && forbidden.has(node.expression.text)) report(node);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return [...hits].sort((a, b) => a - b);
}

export function inventory(root) {
  return packages.map(name => {
    const sources = files(join(root, 'packages', name, 'src')).filter(file => !excluded.test(file));
    return { name, sfc: sources.filter(file => file.endsWith('.vue')),
      legacy: sources.filter(file => /\.[cm]?[jt]sx?$/.test(file) && renderCalls(readFileSync(file, 'utf8'), file).length) };
  });
}

// Process-wide mutable counters are unsafe identities across SSR requests.
export function moduleCounters(source, filename = 'source.ts') {
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const mutable = new Set(ast.statements.filter(ts.isVariableStatement)
    .filter(s => !(s.declarationList.flags & ts.NodeFlags.Const))
    .flatMap(s => s.declarationList.declarations.filter(d => ts.isIdentifier(d.name)).map(d => d.name.text)));
  const errors = [];
  function visit(node) {
    if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node))
      && [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(node.operator)
      && ts.isIdentifier(node.operand) && mutable.has(node.operand.text)) errors.push(`module counter: ${node.operand.text}; use useId()`);
    if (ts.isBinaryExpression(node) && ts.isIdentifier(node.left) && mutable.has(node.left.text)
      && [ts.SyntaxKind.PlusEqualsToken, ts.SyntaxKind.MinusEqualsToken].includes(node.operatorToken.kind)) errors.push(`module counter: ${node.left.text}; use useId()`);
    ts.forEachChild(node, visit);
  }
  visit(ast); return [...new Set(errors)];
}

export function sfcSafety(source, filename = 'Component.vue') {
  const blocks = [...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
  const code = blocks.map(m => m[2]).join('\n');
  const ast = ts.createSourceFile(filename + '.ts', code, ts.ScriptTarget.Latest, true);
  const unwrap = node => { while (node && (ts.isAsExpression(node) || ts.isParenthesizedExpression(node) || ts.isNonNullExpression(node))) node = node.expression; return node; };
  const errors = blocks.filter(m => !/\bsetup\b/.test(m[1])).flatMap(m => moduleCounters(m[2], filename));
  const attrsCalls = new Set(['useAttrs']), computedCalls = new Set(['computed']);
  for (const statement of ast.statements) if (ts.isImportDeclaration(statement) && statement.moduleSpecifier.text === 'vue') {
    for (const entry of statement.importClause?.namedBindings?.elements ?? []) {
      const original = (entry.propertyName ?? entry.name).text;
      if (original === 'useAttrs') attrsCalls.add(entry.name.text);
      if (original === 'computed') computedCalls.add(entry.name.text);
    }
  }
  const attrs = new Set(['$attrs']), emits = new Set(), callbacks = new Set(), events = new Set();
  let usesAttrs = /\$attrs\b/.test(source), inheritFalse = false;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isCallExpression(node.initializer)) {
      const call = node.initializer, called = call.expression.getText(ast);
      if (attrsCalls.has(called)) { usesAttrs = true; attrs.add(node.name.getText(ast)); }
      if (called === 'defineEmits') emits.add(node.name.getText(ast));
    }
    if (ts.isCallExpression(node)) {
      const called = node.expression.getText(ast);
      if (called === 'defineOptions' && node.arguments[0] && ts.isObjectLiteralExpression(node.arguments[0])) {
        inheritFalse ||= node.arguments[0].properties.some(p => p.name?.getText(ast).replace(/['"]/g,'') === 'inheritAttrs' && p.initializer?.kind === ts.SyntaxKind.FalseKeyword);
      }
      if (emits.has(called) && ts.isStringLiteralLike(node.arguments[0] ?? {})) events.add(node.arguments[0].text);
      const fn = node.expression;
      if (ts.isPropertyAccessExpression(fn) && /^on[A-Z]/.test(fn.name.text)) callbacks.add(fn.name.text);
      if (ts.isElementAccessExpression(fn) && ts.isStringLiteralLike(fn.argumentExpression) && /^on[A-Z]/.test(fn.argumentExpression.text)) callbacks.add(fn.argumentExpression.text);
      if (computedCalls.has(called)) {
        function cached(x) {
          if (ts.isSpreadAssignment(x) && attrs.has(x.expression.getText(ast))) errors.push('cached attrs spread; merge $attrs in the template');
          if (ts.isVariableDeclaration(x) && ts.isObjectBindingPattern(x.name) && x.initializer && attrs.has(unwrap(x.initializer).getText(ast))) errors.push('cached attrs destructuring; evaluate during render');
          ts.forEachChild(x,cached);
        }
        node.arguments.forEach(cached);
      }
      if (called === 'defineSlots' && node.typeArguments?.[0] && ts.isTypeLiteralNode(node.typeArguments[0])) for (const slot of node.typeArguments[0].members) {
        const name = slot.name?.getText(ast).replace(/['"]/g,'');
        if (name && /[A-Z]/.test(name) && !ts.getJSDocDeprecatedTag(slot)) errors.push(`slot must use kebab-case: ${name}`);
      }
    }
    ts.forEachChild(node,visit);
  }
  visit(ast);
  if (usesAttrs && !inheritFalse) errors.push('explicit attrs require defineOptions({ inheritAttrs: false })');
  for (const event of events) {
    const callback = 'on' + event.replace(/(^|-)(\w)/g,(_,dash,c)=>c.toUpperCase());
    if (callbacks.has(callback)) errors.push(`double notification: ${callback} and emit('${event}')`);
  }
  return [...new Set(errors)];
}
