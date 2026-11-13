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
