import ts from 'typescript';
import { sfcSafety } from '../vue-vapor-source.mjs';

export function checkTemplateSource(source, file, compilers) {
  const problems = sfcSafety(source, file);
  const { descriptor, errors } = compilers.classic.parse(source, { filename: file });
  if (errors.length) throw new Error(errors.map(String).join('; '));
  if (!descriptor.scriptSetup || descriptor.scriptSetup.lang !== 'ts') problems.push('Requires <script setup lang="ts">');
  if (!descriptor.template || descriptor.template.src) problems.push('Requires an inline template');
  if (descriptor.scriptSetup?.src) problems.push('Only inline script setup is permitted');
  if (descriptor.script && (descriptor.script.lang !== 'ts' || descriptor.script.src)) problems.push('Companion script must be inline TypeScript');
  if (descriptor.scriptSetup?.attrs.vapor !== undefined) problems.push('Build injects vapor; do not author it');
  const script = [descriptor.script?.content, descriptor.scriptSetup?.content].filter(Boolean).join('\n');
  const ast = ts.createSourceFile(file + '.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const banned = new Set(['h', 'defineComponent', 'render']);
  for (const node of ast.statements) {
    if (ts.isImportDeclaration(node) && node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
      for (const item of node.importClause.namedBindings.elements) {
        if (!node.importClause.isTypeOnly && !item.isTypeOnly && banned.has((item.propertyName ?? item.name).text)) {
          banned.add(item.name.text);
          problems.push(`Forbidden runtime import: ${(item.propertyName ?? item.name).text}`);
        }
      }
    }
  }
  const walk = node => {
    if (ts.isCallExpression(node)) {
      const called = ts.isIdentifier(node.expression) ? node.expression.text
        : ts.isPropertyAccessExpression(node.expression) ? node.expression.name.text : '';
      if (banned.has(called)) problems.push(`Forbidden call: ${called}()`);
      if (called === 'defineOptions' && node.arguments[0] && ts.isObjectLiteralExpression(node.arguments[0])) {
        for (const property of node.arguments[0].properties) {
          if (!property.name || !['name', 'inheritAttrs'].includes(property.name.getText().replace(/['"]/g, ''))) {
            problems.push('defineOptions is limited to name and inheritAttrs; Options API behavior is forbidden');
          }
        }
      }
    }
    if (ts.isExportAssignment(node)) problems.push('Runtime default/Options API export is forbidden');
    const name = node.name && ts.isComputedPropertyName(node.name) ? node.name.expression : node.name;
    if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isPropertyAssignment(node)
      || ts.isVariableDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node))
      && name?.getText().replace(/['"]/g, '') === 'render') problems.push('Render function is forbidden');
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) problems.push('JSX is forbidden');
    ts.forEachChild(node, walk);
  };
  if (descriptor.script) {
    const companion = ts.createSourceFile(file + '.ts', descriptor.script.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    if (companion.parseDiagnostics.length) problems.push('Invalid companion TypeScript');
    for (const node of companion.statements) {
      const exported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
      const defaulted = node.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword);
      const allowed = ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)
        || (exported && !defaulted && (ts.isFunctionDeclaration(node)
          || (ts.isVariableStatement(node) && (node.declarationList.flags & ts.NodeFlags.Const))))
        || (ts.isExportDeclaration(node) && node.isTypeOnly)
        || (ts.isImportDeclaration(node) && node.importClause?.isTypeOnly);
      if (!allowed) problems.push('Companion script permits only types and named const/function exports');
    }
  }
  walk(ast);
  // Also inspect template expressions: a forbidden render call must not hide
  // in interpolation, v-bind, v-on or a directive expression.
  const templateWalk = node => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 4 && !node.isStatic && typeof node.content === 'string') {
      walk(ts.createSourceFile('template.ts', node.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS));
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'loc') continue;
      if (Array.isArray(value)) value.forEach(templateWalk);
      else if (value && typeof value === 'object') templateWalk(value);
    }
  };
  templateWalk(descriptor.template?.ast);
  // TSX parse is separate so JSX cannot hide in malformed TS input.
  const jsxAst = ts.createSourceFile(file + '.tsx', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const jsxWalk = node => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) problems.push('JSX is forbidden');
    ts.forEachChild(node, jsxWalk);
  };
  jsxWalk(jsxAst);
  if (problems.length) throw new Error([...new Set(problems)].join('; '));
}
