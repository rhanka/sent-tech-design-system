// Emit an Angular adapter from a descriptor produced by extract.mjs.
// The emitter is deliberately dumb: everything it needs is in the descriptor, so
// a review reads the descriptor rather than the generator.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const VUE = ROOT + '/packages/dataviz-vue/src/lib';
const NGDS = ROOT + '/packages/components-angular/src';
const OUTDIR = ROOT + '/packages/dataviz-angular/src/lib';

/** Declared type of every @Input of a design-system Angular component. */
function dsInputTypes(component) {
  const src = readFileSync(NGDS + '/' + component + '.ts', 'utf8');
  const out = new Map();
  for (const m of src.matchAll(/^  @NgInput\((?:"([^"]+)")?\)\s*([A-Za-z_$][\w$]*)([!?])?\s*(?::\s*([^=;]+?))?\s*(?:=\s*[^;]+)?;/gm)) {
    const name = m[1] || m[2];
    if (m[4]) out.set(name, m[4].trim());
  }
  return out;
}

/** The Vue Props alias, copied verbatim: it is the cross-framework contract. */
function propsAlias(name) {
  const src = readFileSync(VUE + '/' + name + '.ts', 'utf8');
  const start = src.indexOf('export type ' + name + 'Props = {');
  const end = src.indexOf('\n};', start);
  return src.slice(start, end + 3);
}

function builderLines(d, indent) {
  const pad = ' '.repeat(indent);
  const rows =
    d.derive.kind === 'model-rows'
      ? ['this.signals.store.model,', 'this.signals.store.applyCrossfilter(this.viewId),']
      : ['this.signals.store,', 'this.viewId,'];
  const cfg = Object.entries(d.derive.config).map((e) => pad + '    ' + e[0] + ': this.' + e[1] + ',');
  return [pad + d.derive.builder + '(']
    .concat(rows.map((r) => pad + '  ' + r))
    .concat([pad + '  {'])
    .concat(cfg)
    .concat([pad + '  },', pad + ')']);
}

function assignment(d, field) {
  // Several inputs read members of one derived model: keep the model in the field.
  if (d.derive.multiMember) {
    const inner = builderLines(d, 4);
    inner[0] = '    this.' + field + ' = ' + d.derive.builder + '(';
    inner[inner.length - 1] += ';';
    return inner.join('\n');
  }
  // One member of a derived model feeds the input, optionally through a mapper.
  if (d.derive.member) {
    const inner = builderLines(d, 4);
    inner[0] = '    const ' + d.derive.intermediate + ' = ' + d.derive.builder + '(';
    inner[inner.length - 1] += ';';
    const read = d.derive.intermediate + '.' + d.derive.member;
    return inner
      .concat(['    this.' + field + ' = ' + (d.derive.wrap ? d.derive.wrap + '(' + read + ')' : read) + ';'])
      .join('\n');
  }
  if (d.derive.asArray) {
    const inner = builderLines(d, 6);
    inner[inner.length - 1] += ',';
    return ['    this.' + field + ' = ['].concat(inner).concat(['    ];']).join('\n');
  }
  if (d.derive.wrap) {
    const inner = builderLines(d, 6);
    inner[inner.length - 1] += ',';
    return ['    this.' + field + ' = ' + d.derive.wrap + '('].concat(inner).concat(['    );']).join('\n');
  }
  const inner = builderLines(d, 4);
  inner[0] = '    this.' + field + ' = ' + d.derive.builder + '(';
  inner[inner.length - 1] += ';';
  return inner.join('\n');
}

function emit(d) {
  const dsTypes = dsInputTypes(d.ds.name);
  // With several members consumed, the field holds the model itself, and its type
  // is the builder's return type — mechanical, and exact without knowing the model.
  const derivedInput = d.derive.multiMember
    ? null
    : d.bindings.find((b) => b.expr === d.derive.field).input;
  const derivedType = d.derive.multiMember
    ? 'ReturnType<typeof ' + d.derive.builder + '>'
    : dsTypes.get(derivedInput);
  if (!derivedType) throw new Error(d.name + ': no DS input type for ' + derivedInput);
  const isArray = derivedType.endsWith('[]');
  // A one-element list handed to a plural input reads better under that name.
  const field = d.derive.asArray ? derivedInput : d.derive.field;

  // A prop bound straight through to a DS input takes that input's declared type.
  // Several Vue Props aliases widen it to `string` and then cast with `as any` at
  // the h() call; Angular states the union the DS component actually honours.
  const passthroughType = new Map();
  for (const b of d.bindings) {
    if (b.expr === d.derive.field || b.input === 'class') continue;
    const prop = b.expr.replace(/^props\./, '');
    if (!/^[A-Za-z_$][\w$]*$/.test(prop)) continue;
    const dsType = dsTypes.get(b.input);
    if (dsType) passthroughType.set(prop, dsType.replace(/\s*\|\s*undefined$/, ''));
  }

  const typeNames = new Set();
  for (const t of [derivedType].concat(d.ds.typeImports, [...passthroughType.values()])) {
    for (const m of t.matchAll(/\b([A-Z][A-Za-z0-9]*)\b/g)) typeNames.add(m[1]);
  }

  const inputs = d.props
    .filter((p) => p.name !== 'store' && p.name !== 'class')
    .map((p) => {
      const tsType = passthroughType.get(p.name) || p.tsType;
      if (p.required) return '  @NgInput({ required: true }) ' + p.name + '!: ' + tsType + ';';
      // The annotation is load-bearing: `sort = 'input'` would infer `string`,
      // not the union the DS input declares.
      if (p.default !== undefined) return '  @NgInput() ' + p.name + ': ' + tsType + ' = ' + p.default + ';';
      return '  @NgInput() ' + p.name + '?: ' + tsType + ';';
    })
    .join('\n');

  const bindings = d.bindings
    .map((b) => {
      if (b.input === 'class') return '      [class]="' + (d.classExpr ? 'classValue' : 'classInput') + '"';
      const expr = b.expr === d.derive.field ? field : b.expr.replace(/^props\./, '');
      return '      [' + b.input + ']="' + expr + '"';
    })
    .join('\n');

  const helperImports = Object.entries(d.helpers)
    .map((e) => 'import { ' + e[1].join(', ') + " } from '" + e[0] + "';")
    .join('\n');
  const coreValue = d.coreFns.length ? d.coreFns.join(', ') + ', ' : '';
  const coreTypes = ['DashboardStore']
    .concat(d.coreTypes.filter((t) => t !== 'DashboardStore'))
    .map((t) => 'type ' + t)
    .join(', ');

  const classField = d.classExpr
    ? "  /** Recomputed by `recompute()`; never derived in a template getter. */\n  classValue = '" + d.classExpr.base + "';\n"
    : '';
  const classAssign = d.classExpr
    ? '    this.classValue = ' + d.classExpr.helper + "('" + d.classExpr.base + "', this.classInput);\n"
    : '';
  const dsTypeImport = typeNames.size
    ? ', ' + [...typeNames].sort().map((t) => 'type ' + t).join(', ')
    : '';

  return `import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input as NgInput, inject } from '@angular/core';
import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ${d.ds.name} as ${d.ds.alias}${dsTypeImport} } from '@sentropic/design-system-angular';
import { ${coreValue}${coreTypes} } from '@sentropic/dataviz-core';
import { toSignalStore, type AngularSignalStore } from '../adapter.js';
${helperImports ? helperImports + '\n' : ''}
${propsAlias(d.name)}

/**
 * State wiring for a DS Angular ${d.ds.name}.
 * Generated from tools/dataviz-angular-port/descriptors.json — see that
 * directory's README before editing this file by hand.
 */
@Component({
  selector: '${d.selector}',
  standalone: true,
  imports: [${d.ds.alias}],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <${d.ds.selector}
${bindings}
    ></${d.ds.selector}>
  \`,
})
export class ${d.name} implements OnInit, OnChanges, OnDestroy {
  static readonly stComponentName = '${d.name}';

  private readonly changeDetector = inject(ChangeDetectorRef);
  private signals?: AngularSignalStore;
  private unsubscribe: () => void = () => {};

  @NgInput({ required: true }) set store(value: DashboardStore) {
    if (this.signals) this.signals.replace(value);
    else this.signals = toSignalStore(value);
    this.unsubscribe();
    this.unsubscribe = value.subscribe(() => {
      this.recompute();
      this.changeDetector.markForCheck();
    });
  }

  get store(): DashboardStore {
    if (!this.signals) {
      throw new Error('${d.name}: store is required.');
    }
    return this.signals.store;
  }

${inputs}
  @NgInput('class') classInput?: string;

  /** Recomputed by \`recompute()\`; never derived in a template getter. */
  ${field}${isArray ? ': ' + derivedType + ' = []' : '!: ' + derivedType};
${classField}
  ngOnInit(): void {
    this.recompute();
  }

  ngOnChanges(): void {
    this.recompute();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
    this.signals?.destroy();
  }

  private recompute(): void {
${classAssign}    if (!this.signals) return;
    void this.signals.state();
${assignment(d, field)}
  }
}
`;
}

const descriptors = JSON.parse(readFileSync(ROOT + '/tools/dataviz-angular-port/descriptors.json', 'utf8'));
let written = 0;
for (const d of descriptors) {
  try {
    writeFileSync(OUTDIR + '/' + d.name + '.ts', emit(d));
    written += 1;
  } catch (e) {
    console.error('FAIL ' + d.name + ': ' + e.message);
  }
}
console.log('emitted ' + written + '/' + descriptors.length + ' adapters into packages/dataviz-angular/src/lib');
