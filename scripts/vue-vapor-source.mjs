import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

export const packages = ['components-vue', 'dataviz-vue'];
export const excluded = /\.test\.|\.d\.ts$|test-support|fixtures|\/__/;
export function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]).sort();
}

// Resolve aliases and namespace imports as well as the old unaliased calls.
// defineComponent is forbidden even when its render function is indirect.
export function renderCalls(source, filename = 'source.ts') {
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const names = new Set(['h', 'defineComponent']);
  const namespaces = new Set();
  for (const node of ast.statements) {
    if (!ts.isImportDeclaration(node) || node.moduleSpecifier.text !== 'vue') continue;
    const bindings = node.importClause?.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) namespaces.add(bindings.name.text);
    if (bindings && ts.isNamedImports(bindings)) for (const item of bindings.elements) {
      if (['h', 'defineComponent'].includes((item.propertyName ?? item.name).text)) names.add(item.name.text);
    }
  }
  const hits = [];
  function visit(node) {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if ((ts.isIdentifier(callee) && names.has(callee.text)) ||
          (ts.isPropertyAccessExpression(callee) && namespaces.has(callee.expression.getText(ast)) &&
            ['h', 'defineComponent'].includes(callee.name.text)) ||
          (ts.isElementAccessExpression(callee) && namespaces.has(callee.expression.getText(ast)) &&
            ts.isStringLiteral(callee.argumentExpression) && ['h', 'defineComponent'].includes(callee.argumentExpression.text))) {
        hits.push(ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return hits;
}

export function inventory(root) {
  return packages.map(name => {
    const sources = files(join(root, 'packages', name, 'src')).filter(file => !excluded.test(file));
    return { name, sfc: sources.filter(file => file.endsWith('.vue')),
      legacy: sources.filter(file => /\.[cm]?[jt]sx?$/.test(file) && renderCalls(readFileSync(file, 'utf8'), file).length) };
  });
}
