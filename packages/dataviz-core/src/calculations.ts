import type { Aggregation, Cell, DataModel, DimensionType, Row } from './model.js';

export type CalculationVariable = {
  id: string;
  label: string;
  value: Cell;
};

export type CalculatedFieldKind = 'dimension' | 'measure';

export type CalculatedFieldConfig = {
  id: string;
  label: string;
  kind: CalculatedFieldKind;
  expression: string;
  aggregation?: Aggregation;
  dimensionType?: DimensionType;
};

export type CalculationSuggestionKind = 'field' | 'variable';

export type CalculationSuggestion = {
  kind: CalculationSuggestionKind;
  value: string;
  label: string;
  detail: string;
};

export type CalculationBinConfig = {
  id: string;
  label: string;
  field: string;
  size: number;
  origin?: number;
  fallbackLabel?: string;
};

export type CalculationGroup = {
  label: string;
  values: readonly Cell[];
};

export type CalculationGroupConfig = {
  id: string;
  label: string;
  field: string;
  groups: readonly CalculationGroup[];
  fallbackLabel?: string;
};

export type CalculationSetConfig = {
  id: string;
  label: string;
  field: string;
  values: readonly Cell[];
  inLabel?: string;
  outLabel?: string;
};

export type TableCalculationKind = 'running-total' | 'percent-of-total' | 'rank-desc';

type Token =
  | { kind: 'number'; value: number }
  | { kind: 'field'; id: string }
  | { kind: 'variable'; id: string }
  | { kind: 'operator'; value: '+' | '-' | '*' | '/' }
  | { kind: 'paren'; value: '(' | ')' };

function isDigit(char: string): boolean {
  return char >= '0' && char <= '9';
}

function isIdentifierStart(char: string): boolean {
  return /[A-Za-z_]/.test(char);
}

function isIdentifierPart(char: string): boolean {
  return /[A-Za-z0-9_-]/.test(char);
}

function toFiniteNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : Number.NaN;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string' && value.trim() !== '') {
    const next = Number(value);
    return Number.isFinite(next) ? next : Number.NaN;
  }
  return Number.NaN;
}

function variablesById(variables: readonly CalculationVariable[]): Map<string, Cell> {
  return new Map(variables.map((variable) => [variable.id, variable.value]));
}

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < expression.length) {
    const char = expression[index]!;

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (isDigit(char) || char === '.') {
      const start = index;
      index += 1;
      while (index < expression.length && (isDigit(expression[index]!) || expression[index] === '.')) index += 1;
      const value = Number(expression.slice(start, index));
      if (!Number.isFinite(value)) throw new Error(`Invalid number at ${start}`);
      tokens.push({ kind: 'number', value });
      continue;
    }

    if (char === '[') {
      const end = expression.indexOf(']', index + 1);
      if (end === -1) throw new Error(`Unclosed field reference at ${index}`);
      const id = expression.slice(index + 1, end).trim();
      if (!id) throw new Error(`Empty field reference at ${index}`);
      tokens.push({ kind: 'field', id });
      index = end + 1;
      continue;
    }

    if (char === '$') {
      let end = index + 1;
      if (!isIdentifierStart(expression[end] ?? '')) throw new Error(`Invalid variable reference at ${index}`);
      while (end < expression.length && isIdentifierPart(expression[end]!)) end += 1;
      tokens.push({ kind: 'variable', id: expression.slice(index + 1, end) });
      index = end;
      continue;
    }

    if (char === '+' || char === '-' || char === '*' || char === '/') {
      tokens.push({ kind: 'operator', value: char });
      index += 1;
      continue;
    }

    if (char === '(' || char === ')') {
      tokens.push({ kind: 'paren', value: char });
      index += 1;
      continue;
    }

    throw new Error(`Unexpected character "${char}" at ${index}`);
  }

  return tokens;
}

class ExpressionParser {
  private index = 0;

  constructor(
    private readonly tokens: readonly Token[],
    private readonly row: Row,
    private readonly variables: Map<string, Cell>,
  ) {}

  parse(): number {
    const value = this.parseAddSub();
    if (this.index < this.tokens.length) throw new Error('Unexpected token after expression');
    return value;
  }

  private current(): Token | undefined {
    return this.tokens[this.index];
  }

  private consume(): Token | undefined {
    const token = this.tokens[this.index];
    this.index += 1;
    return token;
  }

  private parseAddSub(): number {
    let value = this.parseMulDiv();
    while (true) {
      const operator = this.current();
      if (operator?.kind !== 'operator' || (operator.value !== '+' && operator.value !== '-')) break;
      this.consume();
      const right = this.parseMulDiv();
      value = operator.value === '+' ? value + right : value - right;
    }
    return value;
  }

  private parseMulDiv(): number {
    let value = this.parseUnary();
    while (true) {
      const operator = this.current();
      if (operator?.kind !== 'operator' || (operator.value !== '*' && operator.value !== '/')) break;
      this.consume();
      const right = this.parseUnary();
      value = operator.value === '*' ? value * right : value / right;
    }
    return value;
  }

  private parseUnary(): number {
    const token = this.current();
    if (token?.kind === 'operator' && token.value === '-') {
      this.consume();
      return -this.parseUnary();
    }
    if (token?.kind === 'operator' && token.value === '+') {
      this.consume();
      return this.parseUnary();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): number {
    const token = this.consume();
    if (!token) throw new Error('Unexpected end of expression');

    if (token.kind === 'number') return token.value;
    if (token.kind === 'field') return toFiniteNumber(this.row[token.id]);
    if (token.kind === 'variable') {
      if (!this.variables.has(token.id)) throw new Error(`Unknown variable: ${token.id}`);
      return toFiniteNumber(this.variables.get(token.id));
    }
    if (token.kind === 'paren' && token.value === '(') {
      const value = this.parseAddSub();
      const closing = this.consume();
      if (closing?.kind !== 'paren' || closing.value !== ')') throw new Error('Expected closing parenthesis');
      return value;
    }

    throw new Error('Expected expression value');
  }
}

export function evaluateCalculationExpression(
  expression: string,
  row: Row,
  variables: readonly CalculationVariable[] = [],
): number {
  return new ExpressionParser(tokenize(expression), row, variablesById(variables)).parse();
}

export function applyCalculatedFields(
  rows: readonly Row[],
  fields: readonly CalculatedFieldConfig[],
  variables: readonly CalculationVariable[] = [],
): Row[] {
  return rows.map((row) => {
    const next: Row = { ...row };
    for (const field of fields) {
      next[field.id] = evaluateCalculationExpression(field.expression, next, variables);
    }
    return next;
  });
}

export function extendModelWithCalculatedFields(
  model: DataModel,
  fields: readonly CalculatedFieldConfig[],
): DataModel {
  const calculatedIds = new Set(fields.map((field) => field.id));
  const dimensions = model.dimensions.filter((dimension) => !calculatedIds.has(dimension.id)).map((dimension) => ({ ...dimension }));
  const measures = model.measures.filter((measure) => !calculatedIds.has(measure.id)).map((measure) => ({ ...measure }));

  for (const field of fields) {
    if (field.kind === 'dimension') {
      dimensions.push({ id: field.id, label: field.label, type: field.dimensionType ?? 'continuous' });
    } else {
      measures.push({ id: field.id, label: field.label, aggregation: field.aggregation ?? 'sum' });
    }
  }

  return { dimensions, measures };
}

export function suggestCalculationTokens(
  model: DataModel,
  variables: readonly CalculationVariable[] = [],
  query = '',
): CalculationSuggestion[] {
  const normalized = query.trim().replace(/^[\[$]/, '').toLowerCase();
  const suggestions: CalculationSuggestion[] = [
    ...model.dimensions.map((dimension) => ({
      kind: 'field' as const,
      value: `[${dimension.id}]`,
      label: dimension.label,
      detail: 'dimension',
    })),
    ...model.measures.map((measure) => ({
      kind: 'field' as const,
      value: `[${measure.id}]`,
      label: measure.label,
      detail: 'measure',
    })),
    ...variables.map((variable) => ({
      kind: 'variable' as const,
      value: `$${variable.id}`,
      label: variable.label,
      detail: String(variable.value),
    })),
  ];

  if (!normalized) return suggestions;
  return suggestions.filter((suggestion) => {
    const value = suggestion.value.replace(/[\[\]$]/g, '').toLowerCase();
    return value.includes(normalized) || suggestion.label.toLowerCase().includes(normalized);
  });
}

function formatBucket(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(6)));
}

export function applyCalculationBins(rows: readonly Row[], config: CalculationBinConfig): Row[] {
  if (!Number.isFinite(config.size) || config.size <= 0) throw new Error('Bin size must be a positive number');
  const origin = config.origin ?? 0;
  return rows.map((row) => {
    const value = toFiniteNumber(row[config.field]);
    const next: Row = { ...row };
    if (!Number.isFinite(value)) {
      next[config.id] = config.fallbackLabel ?? 'Unknown';
      return next;
    }
    const start = origin + Math.floor((value - origin) / config.size) * config.size;
    next[config.id] = `${formatBucket(start)}-${formatBucket(start + config.size)}`;
    return next;
  });
}

function cellKey(value: Cell | undefined): string {
  return value == null ? 'null' : String(value);
}

export function applyCalculationGroups(rows: readonly Row[], config: CalculationGroupConfig): Row[] {
  const lookup = new Map<string, string>();
  for (const group of config.groups) {
    for (const value of group.values) lookup.set(cellKey(value), group.label);
  }
  return rows.map((row) => ({
    ...row,
    [config.id]: lookup.get(cellKey(row[config.field])) ?? config.fallbackLabel ?? 'Other',
  }));
}

export function applyCalculationSet(rows: readonly Row[], config: CalculationSetConfig): Row[] {
  const values = new Set(config.values.map(cellKey));
  const inLabel = config.inLabel ?? 'In set';
  const outLabel = config.outLabel ?? 'Out of set';
  return rows.map((row) => ({
    ...row,
    [config.id]: values.has(cellKey(row[config.field])) ? inLabel : outLabel,
  }));
}

export function calculateTableValues(values: readonly number[], kind: TableCalculationKind): number[] {
  switch (kind) {
    case 'running-total': {
      let total = 0;
      return values.map((value) => {
        total += value;
        return total;
      });
    }
    case 'percent-of-total': {
      const total = values.reduce((sum, value) => sum + value, 0);
      return values.map((value) => (total === 0 ? Number.NaN : value / total));
    }
    case 'rank-desc':
      return values.map((value) => 1 + values.filter((other) => other > value).length);
    default: {
      const _never: never = kind;
      throw new Error(`Unknown table calculation: ${String(_never)}`);
    }
  }
}
