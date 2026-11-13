#!/usr/bin/env node
/** Reviewable, deliberately bounded codemod. Input is never replaced/deleted. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

export function convertModule(source, filename = 'Component.ts') {
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const unsupported = [], migrations = [], reminders = [];
  const text = node => node.getText(ast);
  const key = node => node && (ts.isIdentifier(node) || ts.isStringLiteral(node)) ? node.text : undefined;
  const property = (object, name) => object?.properties.find(p => key(p.name) === name);
  const initializer = (object, name) => property(object, name)?.initializer;
  const kebab = value => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  const imports = [], lucide = new Map(), hNames = new Set(['h']), componentNames = new Set(['defineComponent']), instanceNames = new Set(['getCurrentInstance']);
  for (const node of ast.statements.filter(ts.isImportDeclaration)) {
    const bindings = node.importClause?.namedBindings;
    if (node.moduleSpecifier.text === 'lucide-vue-next') {
      if (!bindings || !ts.isNamedImports(bindings)) unsupported.push('Lucide namespace/default import needs manual K7 mapping');
      else for (const item of bindings.elements) lucide.set(item.name.text, kebab((item.propertyName ?? item.name).text));
      continue;
    }
    if (node.moduleSpecifier.text === 'vue' && bindings && ts.isNamedImports(bindings)) {
      const keep = bindings.elements.filter(item => {
        const name = (item.propertyName ?? item.name).text;
        if (name === 'getCurrentInstance') instanceNames.add(item.name.text);
        if (name === 'h') { hNames.add(item.name.text); return false; }
        if (name === 'defineComponent') { componentNames.add(item.name.text); return false; }
        return true;
      });
      if (keep.length) imports.push(`import ${node.importClause.isTypeOnly ? 'type ' : ''}{ ${keep.map(text).join(', ')} } from 'vue';`);
    } else imports.push(text(node));
  }
  const candidates = ast.statements.filter(ts.isVariableStatement).flatMap(statement =>
    statement.declarationList.declarations.map(declaration => ({ statement, declaration }))).filter(({ declaration }) =>
      declaration.initializer && ts.isCallExpression(declaration.initializer) && componentNames.has(text(declaration.initializer.expression)));
  if (candidates.length !== 1) throw new Error('Expected exactly one named defineComponent declaration');
  const { statement, declaration } = candidates[0];
  if (statement.declarationList.declarations.length !== 1) throw new Error('Split the component variable declaration before conversion');
  const name = key(declaration.name);
  if (!name) throw new Error('Component must have an identifier');
  const options = declaration.initializer.arguments[0];
  if (!options || !ts.isObjectLiteralExpression(options)) throw new Error('Component options must be an object literal');
  for (const option of options.properties) {
    if (!['name', 'props', 'emits', 'setup', 'inheritAttrs'].includes(key(option.name))) unsupported.push(`Options API/spread: ${text(option).slice(0, 100)}`);
  }
  const propsName = `${name}Props`;
  const propsDeclaration = ast.statements.find(node => (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) && node.name.text === propsName);
  if (!propsDeclaration?.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) throw new Error(`Keep an exported ${propsName} type before conversion`);
  const parameters = propsDeclaration.typeParameters;
  const generic = parameters?.length ? ` generic="${parameters.map(text).join(', ').replaceAll('"', '&quot;')}"` : '';
  const propsType = propsName + (parameters?.length ? `<${parameters.map(p => p.name.text).join(', ')}>` : '');
  const defaults = [];
  const runtimeProps = initializer(options, 'props');
  if (runtimeProps && ts.isObjectLiteralExpression(runtimeProps)) {
    for (const prop of runtimeProps.properties) {
      if (!ts.isPropertyAssignment(prop) || !ts.isObjectLiteralExpression(prop.initializer)) { unsupported.push(`Runtime prop needs manual default/casting audit: ${text(prop)}`); continue; }
      const value = initializer(prop.initializer, 'default');
      if (value) defaults.push(`${text(prop.name)}: ${text(value)}`);
      else if (initializer(prop.initializer, 'type')?.getText(ast).includes('Boolean')) reminders.push(`Audit Boolean casting of ${text(prop.name)} (absent versus undefined)`);
    }
  } else if (runtimeProps) unsupported.push('Nonliteral runtime props');
  const setup = property(options, 'setup');
  if (!setup?.body || !ts.isBlock(setup.body)) throw new Error('Expected setup method with a block body');
  const propsBinding = setup.parameters[0]?.name;
  if (propsBinding && (!ts.isIdentifier(propsBinding) || propsBinding.text !== 'props')) unsupported.push('Rename/destructured setup props manually; reactive reads must remain reactive');
  const context = setup.parameters[1]?.name;
  if (context && (!ts.isObjectBindingPattern(context) || context.elements.some(e => e.propertyName || !['slots', 'emit', 'attrs', 'expose'].includes(text(e.name))))) unsupported.push('Aliased/destructured setup context needs manual mapping');
  const contextNames = context && ts.isObjectBindingPattern(context) ? context.elements.map(e => text(e.name)) : [];
  const runtimeEmits = initializer(options, 'emits');
  let emits = '';
  if (runtimeEmits && ts.isArrayLiteralExpression(runtimeEmits)) {
    const entries = runtimeEmits.elements.filter(ts.isStringLiteral);
    emits = `const emit = defineEmits<{ ${entries.map(e => `${JSON.stringify(e.text)}: unknown[]`).join('; ')} }>();`;
    unsupported.push('Array emits: replace unknown[] with verified payload tuples');
    if (entries.length !== runtimeEmits.elements.length) unsupported.push('Dynamic emit names');
  } else if (runtimeEmits && ts.isObjectLiteralExpression(runtimeEmits)) {
    const entries = [];
    for (const event of runtimeEmits.properties) {
      const fn = ts.isPropertyAssignment(event) ? event.initializer : event;
      if (!(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn) || ts.isMethodDeclaration(fn))) { unsupported.push(`Manual emit payload: ${text(event)}`); continue; }
      if (fn.parameters.some(p => !p.type)) unsupported.push(`Verify inferred payload for ${text(event.name)}`);
      entries.push(`${text(event.name)}: [${fn.parameters.map((p, i) => `${key(p.name) ?? `arg${i}`}${p.questionToken ? '?' : ''}: ${p.type ? text(p.type) : 'unknown'}`).join(', ')}]`);
      if (fn.body && fn.body.kind !== ts.SyntaxKind.TrueKeyword) unsupported.push(`Preserve emit validator behavior for ${text(event.name)}`);
    }
    emits = `const emit = defineEmits<{ ${entries.join('; ')} }>();`;
  } else if (runtimeEmits || contextNames.includes('emit')) unsupported.push('Manual emits declaration required');
  const richProps = new Set();
  if (ts.isTypeAliasDeclaration(propsDeclaration) && ts.isTypeLiteralNode(propsDeclaration.type) || ts.isInterfaceDeclaration(propsDeclaration)) {
    for (const member of propsDeclaration.members ?? propsDeclaration.type.members) {
      if (member.type && /\b(unknown|VNode|VNodeChild|Component)\b/.test(text(member.type))) richProps.add(key(member.name));
    }
  }
  const slotNames = new Set();
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  function todo(node, reason) { unsupported.push(`${reason}: ${text(node).slice(0, 160)}`); return '<!-- TODO: translate this render branch; see conversion report -->'; }
  function unwrap(node) { while (ts.isAsExpression(node) || ts.isParenthesizedExpression(node) || ts.isTypeAssertionExpression(node) || ts.isNonNullExpression(node)) node = node.expression; return node; }
  function render(node) {
    node = unwrap(node);
    if (node.kind === ts.SyntaxKind.NullKeyword || node.kind === ts.SyntaxKind.FalseKeyword || node.kind === ts.SyntaxKind.UndefinedKeyword || ts.isIdentifier(node) && node.text === 'undefined') return '';
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return escape(node.text).replaceAll('{{', '&#123;&#123;');
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(render).join('\n');
    if (ts.isConditionalExpression(node)) return `<template v-if="${escape(text(node.condition))}">${render(node.whenTrue)}</template><template v-else>${render(node.whenFalse)}</template>`;
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && text(node.expression.expression) === 'slots') {
      const slot = node.expression.name.text; slotNames.add(slot);
      if (node.arguments.length) return todo(node, 'Scoped slot arguments need explicit defineSlots and bindings');
      return slot === 'default' ? '<slot />' : `<slot name="${escape(slot)}" />`;
    }
    if (ts.isCallExpression(node) && hNames.has(text(node.expression))) {
      const [tagNode, propsNode, children] = node.arguments;
      if (!tagNode) return todo(node, 'Missing tag');
      let tag = ts.isStringLiteral(tagNode) ? tagNode.text : ts.isIdentifier(tagNode) ? tagNode.text : undefined;
      if (!tag || !/^[A-Za-z][A-Za-z0-9:.-]*$/.test(tag)) return todo(node, 'Dynamic component/tag requires an SFC decision');
      const attributes = [];
      if (lucide.has(tag)) { attributes.push(`name="${lucide.get(tag)}"`); tag = 'DSIcon'; migrations.push('K7: Lucide component to DS Icon; verify glyph/name availability in V9'); }
      if (propsNode && propsNode.kind !== ts.SyntaxKind.NullKeyword) {
        if (!ts.isObjectLiteralExpression(propsNode)) return todo(node, 'Two-argument h overload/dynamic props needs manual translation');
        for (const prop of propsNode.properties) {
          if (ts.isSpreadAssignment(prop)) { attributes.push(`v-bind="${escape(text(prop.expression) === 'attrs' ? '$attrs' : text(prop.expression))}"`); reminders.push('Verify attrs/class/style merge and fallthrough at every original destination'); continue; }
          if (!ts.isPropertyAssignment(prop) && !ts.isShorthandPropertyAssignment(prop)) return todo(prop, 'Computed/method VNode prop');
          const propName = key(prop.name), value = ts.isShorthandPropertyAssignment(prop) ? prop.name : prop.initializer;
          if (!propName || ['innerHTML', 'textContent'].includes(propName)) return todo(prop, 'Unsafe/unknown VNode prop');
          const binding = /^on[A-Z]/.test(propName) ? `@${kebab(propName.slice(2))}` : `:${propName}`;
          attributes.push(`${binding}="${escape(text(value))}"`);
        }
      }
      const start = `<${tag}${attributes.length ? ' ' + attributes.join(' ') : ''}`;
      if (['input', 'img', 'br', 'hr', 'area', 'base', 'col', 'embed', 'link', 'meta', 'param', 'source', 'track', 'wbr'].includes(tag)) {
        if (children) return todo(node, 'Void element with children');
        return start + ' />';
      }
      return start + `>${children ? render(children) : ''}</${tag}>`;
    }
    if (ts.isPropertyAccessExpression(node) && text(node.expression) === 'props' && richProps.has(node.name.text)) {
      const slot = kebab(node.name.text); slotNames.add(slot);
      migrations.push(`${node.name.text} → #${slot}; narrow fallback to scalar, migrate VNode callers`);
      return `<slot name="${slot}">{{ ${text(node)} }}</slot>`;
    }
    if (ts.isCallExpression(node) || ts.isBinaryExpression(node) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken].includes(node.operatorToken.kind)) return todo(node, 'Render helper/map/short-circuit needs a reactive template translation');
    return `{{ ${escape(text(node))} }}`;
  }
  const returned = setup.body.statements.find(ts.isReturnStatement)?.expression;
  let template = '<!-- TODO: render tree -->';
  if (returned && ts.isArrowFunction(returned) && !ts.isBlock(returned.body)) template = render(returned.body);
  else unsupported.push('Render closure block: move render-time calculations into computed values before translating markup');
  let uidLocal = '__sfcUseId';
  while (source.includes(uidLocal)) uidLocal += '_';
  let convertedUid = false;
  const logic = setup.body.statements.filter(s => !ts.isReturnStatement(s)).map(statement => {
    const replacements = [];
    function walk(node) {
      if (ts.isPropertyAccessExpression(node) && node.name.text === 'uid') {
        const instance = unwrap(node.expression);
        if (ts.isCallExpression(instance) && instanceNames.has(text(instance.expression))) {
          replacements.push({ start: node.getStart(ast) - statement.getStart(ast), end: node.end - statement.getStart(ast) });
        }
      }
      ts.forEachChild(node, walk);
    }
    walk(statement);
    let result = text(statement);
    for (const replacement of replacements.sort((a, b) => b.start - a.start)) {
      result = result.slice(0, replacement.start) + `${uidLocal}()` + result.slice(replacement.end);
      convertedUid = true;
    }
    return result.replace(/\bexpose\(/g, 'defineExpose(');
  }).join('\n');
  if (convertedUid) migrations.push('Instance uid → useId; verify string identity, explicit consumer IDs and ARIA relationships; remove unused instance import');
  const logicAst = ts.createSourceFile('setup.ts', logic, ts.ScriptTarget.Latest, true);
  function inspectInstance(node) {
    if (ts.isCallExpression(node) && instanceNames.has(node.expression.getText(logicAst))) unsupported.push('getCurrentInstance: useId for identity; typed provide/inject for coordination; explicitly model listener-presence behavior');
    ts.forEachChild(node, inspectInstance);
  }
  inspectInstance(logicAst);
  if (lucide.size) imports.push(`import { Icon as DSIcon } from ${JSON.stringify(filename.includes('dataviz-vue') ? '@sentropic/design-system-vue' : './Icon.js')};`);
  const retained = ast.statements.filter(node => node !== statement && !ts.isImportDeclaration(node) && !(ts.isExportAssignment(node) && text(node.expression) === name)).map(text);
  const script = [...imports, ...retained,
    `defineOptions({ name: ${JSON.stringify(name)}${initializer(options, 'inheritAttrs') ? ', inheritAttrs: ' + text(initializer(options, 'inheritAttrs')) : ''} });`,
    `const props = ${defaults.length ? `withDefaults(defineProps<${propsType}>(), { ${defaults.join(', ')} })` : `defineProps<${propsType}>()`};`, emits,
    contextNames.includes('slots') ? `const slots = useSlots();` : '', contextNames.includes('attrs') ? 'const attrs = useAttrs();' : '',
    slotNames.size ? `defineSlots<{ ${[...slotNames].map(slot => `${JSON.stringify(slot)}?: () => unknown`).join('; ')} }>();` : '', logic].filter(Boolean).join('\n');
  const addedImports = contextNames.filter(n => ['slots', 'attrs'].includes(n)).map(n => n === 'slots' ? 'useSlots' : 'useAttrs');
  if (convertedUid) addedImports.push(`useId as ${uidLocal}`);
  const result = `<script setup lang="ts"${generic}>\n${addedImports.length ? `import { ${addedImports.join(', ')} } from 'vue';\n` : ''}${script}\n</script>\n\n<template>\n${template}\n</template>\n`;
  if (hNames.size && [...hNames].some(h => new RegExp(`\\b${h}\\s*\\(`).test(script))) unsupported.push('Rendering remains in setup/helper code; move it to a compiled template');
  return { source: result, report: { name, status: 'draft', unsupported: [...new Set(unsupported)], migrations: [...new Set(migrations)], reminders: [...new Set(reminders)] } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [input, ...flags] = process.argv.slice(2);
    if (!input || flags.some(flag => !flag.startsWith('--out=') && !flag.startsWith('--report='))) throw new Error('Usage: node scripts/vue-to-sfc.mjs <module.ts> [--out=draft.vue] [--report=report.json]');
    const result = convertModule(readFileSync(input, 'utf8'), input);
    const output = flags.find(f => f.startsWith('--out='))?.slice(6);
    const report = flags.find(f => f.startsWith('--report='))?.slice(9);
    if (output) writeFileSync(output, result.source, { flag: 'wx' }); else process.stdout.write(result.source);
    if (report) writeFileSync(report, JSON.stringify(result.report, null, 2) + '\n', { flag: 'wx' });
    else process.stderr.write(JSON.stringify(result.report, null, 2) + '\n');
    if (result.report.unsupported.length) process.exitCode = 2;
  } catch (error) { console.error(error.message); process.exitCode = 2; }
}
