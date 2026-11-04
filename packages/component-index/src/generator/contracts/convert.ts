import * as ts from "typescript";

import type { JsonSchema, Loss, LossKind, Replacement } from "./types.js";

/**
 * Structural type walker (spec 6.2): ts.TypeChecker only. Regex over
 * declaration text for type structure and typeToTypeNode as an oracle are
 * both forbidden; checker.typeToString is used only for verbatim source-type
 * text in loss rows.
 */
export interface ConvertState {
  checker: ts.TypeChecker;
  /** Hoisted named-type schemas, by type name. */
  defs: Map<string, JsonSchema>;
  /** Types currently being built (recursion guard). */
  active: Set<string>;
  warnings: string[];
  dropped: Loss[];
  replaced: Replacement[];
  unresolved: Loss[];
  /** Type-parameter name to its default type (generic instantiation). */
  genericDefaults: Map<string, ts.Type>;
  genericWarned: Set<string>;
  /** Dotted owner prefix for nested loss names ("" at the member level). */
  path: string;
  /**
   * Payload/params mode (event payloads, slot params): any/unknown map to
   * {} inline without a replacement row. A representable type that cannot be
   * converted still records unresolved (GEN-C2).
   */
  payloadMode: boolean;
}

export function createConvertState(checker: ts.TypeChecker): ConvertState {
  return {
    checker,
    defs: new Map(),
    active: new Set(),
    warnings: [],
    dropped: [],
    replaced: [],
    unresolved: [],
    genericDefaults: new Map(),
    genericWarned: new Set(),
    path: "",
    payloadMode: false,
  };
}

/**
 * Verbatim source-type text for loss rows (checker-derived, never regex).
 * Some library types (svelte element attributes) recurse in ways the
 * checker's own printer cannot linearize; a stack overflow there is caught
 * and replaced by a deterministic symbol-named marker so generation stays
 * loud (the loss row still forces partial) instead of crashing.
 */
export function typeText(checker: ts.TypeChecker, type: ts.Type): string {
  try {
    return checker.typeToString(type);
  } catch {
    const symbol = type.aliasSymbol ?? type.symbol;
    const name = symbol?.name;
    return name !== undefined && name !== "__type" ? `[unprintable:${name}]` : "[unprintable type]";
  }
}

/** JSDoc comment of a symbol, verbatim, or undefined when absent. */
export function symbolDoc(checker: ts.TypeChecker, symbol: ts.Symbol): string | undefined {
  const text = ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
  return text.length > 0 ? text : undefined;
}

function lossName(state: ConvertState, name: string): string {
  return state.path === "" ? name : `${state.path}.${name}`;
}

function recordDropped(state: ConvertState, name: string, kind: LossKind, sourceType: string, reason: string): void {
  state.dropped.push({ name: lossName(state, name), kind, sourceType, reason });
}

function recordReplaced(state: ConvertState, name: string, sourceType: string, replacement: string, reason: string): void {
  state.replaced.push({ name: lossName(state, name), sourceType, replacement, reason });
}

function recordUnresolved(state: ConvertState, name: string, kind: LossKind, sourceType: string, reason: string): void {
  state.unresolved.push({ name: lossName(state, name), kind, sourceType, reason });
}

export type ConvertOutcome = { outcome: "schema"; schema: JsonSchema } | { outcome: "omitted" };

/**
 * Instantiate generic defaults for a props (or hoisted) type: every type
 * parameter with a default is entered in the conversion state and warned
 * once, naming the owner.
 */
export function populateGenericDefaults(state: ConvertState, type: ts.Type, ownerName: string): void {
  const checker = state.checker;
  const record = (name: string, defaultNode: ts.TypeNode | undefined): void => {
    if (state.genericDefaults.has(name)) return;
    if (defaultNode === undefined) return;
    const def = checker.getTypeFromTypeNode(defaultNode);
    state.genericDefaults.set(name, def);
    state.warnings.push(
      `generic type parameter "${name}" of "${ownerName}" instantiated with its default (${typeText(checker, def)})`,
    );
  };
  // Usages: reference target type parameters.
  const target = (type as ts.TypeReference).target;
  if (target?.typeParameters !== undefined) {
    for (const parameter of target.typeParameters) {
      const name = parameter.symbol?.name;
      if (name === undefined) continue;
      const declaration = parameter.symbol?.getDeclarations()?.[0];
      record(
        name,
        declaration !== undefined && ts.isTypeParameterDeclaration(declaration)
          ? declaration.default
          : undefined,
      );
    }
    return;
  }
  // Declarations: interface, alias and class type parameter lists.
  const symbol = type.aliasSymbol ?? type.symbol;
  const declaration = symbol?.getDeclarations()?.[0];
  const lists =
    declaration !== undefined &&
    (ts.isInterfaceDeclaration(declaration) ||
      ts.isTypeAliasDeclaration(declaration) ||
      ts.isClassDeclaration(declaration))
      ? declaration.typeParameters
      : undefined;
  if (lists === undefined) return;
  for (const parameter of lists) record(parameter.name.text, parameter.default);
}

/**
 * Convert one type to a JSON Schema. Non-representable members are recorded
 * in the state loss lists (dotted names) and report "omitted"; any/unknown
 * record a replacement row except in payload mode.
 */
export function convertType(state: ConvertState, type: ts.Type, name: string): ConvertOutcome {
  const checker = state.checker;

  // Generic type parameter: instantiate the default, or record unresolved.
  if ((type.flags & ts.TypeFlags.TypeParameter) !== 0) {
    // Instantiation (with its single populateGenericDefaults warning site);
    // a parameter with no default is unresolved.
    const paramName = type.symbol?.name ?? typeText(checker, type);
    const def = state.genericDefaults.get(paramName);
    if (def !== undefined) return convertType(state, def, name);
    recordUnresolved(state, name, "generic", typeText(checker, type), "no default type argument to instantiate");
    return { outcome: "omitted" };
  }

  if ((type.flags & ts.TypeFlags.Union) !== 0) {
    return convertUnion(state, type as ts.UnionType, name);
  }

  if ((type.flags & ts.TypeFlags.StringLiteral) !== 0) {
    return { outcome: "schema", schema: { const: literalValue(type) ?? typeText(checker, type) } };
  }
  if ((type.flags & ts.TypeFlags.NumberLiteral) !== 0) {
    return { outcome: "schema", schema: { const: literalValue(type) ?? typeText(checker, type) } };
  }
  if ((type.flags & ts.TypeFlags.BooleanLiteral) !== 0) {
    const value = literalValue(type);
    if (typeof value === "boolean") return { outcome: "schema", schema: { const: value } };
    recordUnresolved(state, name, "other", typeText(checker, type), "boolean literal without a value");
    return { outcome: "omitted" };
  }
  if ((type.flags & ts.TypeFlags.EnumLiteral) !== 0) {
    const value = literalValue(type);
    return { outcome: "schema", schema: { const: value ?? typeText(checker, type) } };
  }
  if ((type.flags & ts.TypeFlags.String) !== 0) return { outcome: "schema", schema: { type: "string" } };
  if ((type.flags & ts.TypeFlags.Number) !== 0) return { outcome: "schema", schema: { type: "number" } };
  if ((type.flags & ts.TypeFlags.Boolean) !== 0) return { outcome: "schema", schema: { type: "boolean" } };
  if ((type.flags & ts.TypeFlags.BigInt) !== 0) return { outcome: "schema", schema: { type: "integer" } };
  if ((type.flags & ts.TypeFlags.Null) !== 0) return { outcome: "schema", schema: { type: "null" } };
  if ((type.flags & ts.TypeFlags.Undefined) !== 0 || (type.flags & ts.TypeFlags.Void) !== 0) {
    return { outcome: "schema", schema: {} };
  }
  if ((type.flags & ts.TypeFlags.TemplateLiteral) !== 0) {
    return { outcome: "schema", schema: { type: "string" } };
  }
  if ((type.flags & ts.TypeFlags.Any) !== 0 || (type.flags & ts.TypeFlags.Unknown) !== 0) {
    if (!state.payloadMode) {
      recordReplaced(state, name, typeText(checker, type), "{}", "any JSON value, stated in the row");
    }
    return { outcome: "schema", schema: {} };
  }
  if ((type.flags & ts.TypeFlags.NonPrimitive) !== 0) {
    // Bare object / {} / Record<string, unknown>-shaped: any JSON.
    if (!state.payloadMode) {
      recordReplaced(state, name, typeText(checker, type), "{}", "any JSON value, stated in the row");
    }
    return { outcome: "schema", schema: {} };
  }
  if ((type.flags & ts.TypeFlags.Intersection) !== 0) {
    // `string & {}` (and number/boolean twins) is the open-primitive
    // idiom: the object side carries no members, so the intersection IS
    // the primitive. Branded intersections keep their loss below.
    const reduced = reduceOpenPrimitive(checker, type as ts.IntersectionType);
    if (reduced !== undefined) return convertType(state, reduced, name);
  }

  // Snippet/node/emitter checks precede the function check: render-function
  // types are callable, but they drop under their own kind.
  if (isSnippetType(type)) {
    recordDropped(state, name, "snippet", typeText(checker, type), "render-function surface has no JSON Schema form");
    return { outcome: "omitted" };
  }
  if (isNodeType(type)) {
    recordDropped(state, name, "node", typeText(checker, type), "renderable-node surface has no JSON Schema form");
    return { outcome: "omitted" };
  }
  if (isFunctionType(checker, type)) {
    recordDropped(state, name, "function", typeText(checker, type), "function surface has no JSON Schema form");
    return { outcome: "omitted" };
  }
  if (isEventEmitterType(type)) {
    recordDropped(state, name, "other", typeText(checker, type), "emitter surface is events, not props");
    return { outcome: "omitted" };
  }
  if (isDateType(checker, type)) {
    if (!state.payloadMode) {
      recordReplaced(state, name, typeText(checker, type), '{"type":"string","format":"date-time"}', "runtime value is an object; JSON form is a string");
    }
    return { outcome: "schema", schema: { type: "string", format: "date-time" } };
  }

  // Index-signature maps (Record<...>) convert structurally even when the
  // alias lives in lib: the table mandates additionalProperties plus a row.
  if (
    (type.flags & ts.TypeFlags.Object) !== 0 &&
    checker
      .getIndexInfosOfType(type)
      .some((info) => (info.keyType.flags & ts.TypeFlags.String) !== 0)
  ) {
    return convertObject(state, type, name);
  }

  if (isArrayType(checker, type)) {
    const element = checker.getTypeArguments(type as ts.TypeReference)[0];
    if (element === undefined) {
      recordUnresolved(state, name, "other", typeText(checker, type), "array without an element type");
      return { outcome: "omitted" };
    }
    const converted = convertType(state, element, `${name}[]`);
    if (converted.outcome === "omitted") return { outcome: "omitted" };
    return { outcome: "schema", schema: { type: "array", items: converted.schema } };
  }

  if (isTupleType(checker, type)) {
    return convertTuple(state, type as ts.TypeReference, name);
  }

  // Library types (DOM, framework internals) are never expanded: their
  // member graphs recurse through lib declarations the contracts must not
  // inline. Props record a replaced row; payloads record unresolved (GEN-C2).
  // Arrays and tuples are structural and handled above (their Array/Tuple
  // symbols live in lib but their elements convert normally).
  if (isLibraryType(type)) {
    if (state.payloadMode) {
      recordUnresolved(state, name, "other", typeText(checker, type), "library type has no JSON Schema form");
    } else {
      recordReplaced(state, name, typeText(checker, type), "{}", "library type not expanded");
    }
    return { outcome: "schema", schema: {} };
  }

  if ((type.flags & ts.TypeFlags.Object) !== 0) {
    return convertObject(state, type, name);
  }

  if ((type.flags & ts.TypeFlags.Enum) !== 0) {
    const values = enumValues(checker, type);
    if (values === null) {
      recordUnresolved(state, name, "other", typeText(checker, type), "enum members not readable");
      return { outcome: "omitted" };
    }
    return values.length === 1
      ? { outcome: "schema", schema: { const: values[0] } }
      : { outcome: "schema", schema: { enum: values } };
  }

  recordUnresolved(state, name, "other", typeText(checker, type), "type form has no conversion rule");
  return { outcome: "omitted" };
}

function literalValue(type: ts.Type): string | number | boolean | undefined {
  const value = (type as unknown as { value?: unknown }).value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  // Fresh boolean literals carry no .value; their intrinsicName is the value.
  if ((type.flags & ts.TypeFlags.BooleanLiteral) !== 0) {
    const intrinsic = (type as unknown as { intrinsicName?: string }).intrinsicName;
    if (intrinsic === "true") return true;
    if (intrinsic === "false") return false;
  }
  return undefined;
}

function convertUnion(state: ConvertState, type: ts.UnionType, name: string): ConvertOutcome {
  const checker = state.checker;
  // Undefined members are filtered at every level: JSON has no undefined.
  const parts = type.types.filter((part) => (part.flags & ts.TypeFlags.Undefined) === 0);
  if (parts.length === 0) return { outcome: "schema", schema: {} };
  if (parts.length === 1 && parts[0] !== undefined) return convertType(state, parts[0], name);
  const literalParts = parts.filter(
    (part) =>
      (part.flags &
        (ts.TypeFlags.StringLiteral | ts.TypeFlags.NumberLiteral | ts.TypeFlags.BooleanLiteral | ts.TypeFlags.EnumLiteral)) !==
      0,
  );
  const nullParts = parts.filter((part) => (part.flags & ts.TypeFlags.Null) !== 0);
  const rest = parts.filter((part) => !literalParts.includes(part) && !nullParts.includes(part));
  if (rest.length === 0 && literalParts.length === parts.length - nullParts.length) {
    const values = literalParts.map((part) => literalValue(part));
    if (values.every((value) => typeof value === "boolean")) {
      if (nullParts.length > 0) return { outcome: "schema", schema: { type: ["boolean", "null"] } };
      return { outcome: "schema", schema: { type: "boolean" } };
    }
    const named = values.map((value, index) =>
      value === undefined ? typeText(checker, literalParts[index] as ts.Type) : value,
    );
    const withNull = nullParts.length > 0 ? [...named, null] : named;
    if (withNull.length === 1) return { outcome: "schema", schema: { const: withNull[0] } };
    return { outcome: "schema", schema: { enum: withNull } };
  }
  if (nullParts.length > 0 && rest.length === 1 && rest[0] !== undefined) {
    const converted = convertType(state, rest[0], name);
    if (converted.outcome === "omitted") return { outcome: "omitted" };
    const scalar = (converted.schema as { type?: unknown }).type;
    if (typeof scalar === "string") {
      return { outcome: "schema", schema: { ...converted.schema, type: [scalar, "null"] } };
    }
    return { outcome: "schema", schema: { anyOf: [converted.schema, { type: "null" }] } };
  }
  const schemas: JsonSchema[] = [];
  for (const part of parts) {
    const converted = convertType(state, part, name);
    if (converted.outcome === "omitted") return { outcome: "omitted" };
    if (!schemas.some((schema) => JSON.stringify(schema) === JSON.stringify(converted.schema))) {
      schemas.push(converted.schema);
    }
  }
  if (schemas.length === 1 && schemas[0] !== undefined) return { outcome: "schema", schema: schemas[0] };
  return { outcome: "schema", schema: { anyOf: schemas } };
}

function convertTuple(state: ConvertState, type: ts.TypeReference, name: string): ConvertOutcome {
  const checker = state.checker;
  // Rest tuples have no fixed element list.
  if (isRestTuple(checker, type)) {
    recordUnresolved(state, name, "other", typeText(checker, type), "rest tuple elements have no fixed form");
    return { outcome: "omitted" };
  }
  const elements = tupleElementTypes(checker, type) ?? [];
  const prefixItems: JsonSchema[] = [];
  for (let index = 0; index < elements.length; index += 1) {
    const element = elements[index];
    if (element === undefined) continue;
    const converted = convertType(state, element, `${name}[${index}]`);
    if (converted.outcome === "omitted") return { outcome: "omitted" };
    prefixItems.push(converted.schema);
  }
  return { outcome: "schema", schema: { type: "array", prefixItems, items: false } };
}

function typeNameOf(type: ts.Type): string | undefined {
  const symbol = type.symbol ?? type.aliasSymbol;
  if (symbol !== undefined && symbol.name !== "__type") return symbol.name;
  return type.aliasSymbol?.name;
}

function hoistName(state: ConvertState, type: ts.Type): string | undefined {
  void state;
  const symbol = type.aliasSymbol ?? type.symbol;
  if (symbol === undefined) return undefined;
  if (symbol.name === "__type") return undefined;
  const declarations = symbol.getDeclarations() ?? [];
  const meaningful = declarations.some(
    (declaration) =>
      ts.isInterfaceDeclaration(declaration) ||
      ts.isTypeAliasDeclaration(declaration) ||
      ts.isClassDeclaration(declaration) ||
      ts.isEnumDeclaration(declaration),
  );
  if (!meaningful) return undefined;
  // Builtin utility and library types (Record, Omit, lib.dom members) are
  // structural, never hoisted under their (meaningless here) names.
  const own = declarations.some(
    (declaration) =>
      !declaration.getSourceFile().fileName.includes("/typescript/lib/") &&
      !declaration.getSourceFile().fileName.includes("/node_modules/"),
  );
  if (!own) return undefined;
  return symbol.name;
}

/**
 * Reduce an open-primitive intersection (`string & {}`, `number & {}`,
 * `boolean & {}`) to its primitive side. Every non-primitive constituent
 * must be member-free (no properties, indexes or signatures); a branded
 * intersection keeps its loss (undefined).
 */
function reduceOpenPrimitive(checker: ts.TypeChecker, type: ts.IntersectionType): ts.Type | undefined {
  let primitive: ts.Type | undefined;
  for (const part of type.types) {
    if (
      part.flags === ts.TypeFlags.String ||
      part.flags === ts.TypeFlags.Number ||
      part.flags === ts.TypeFlags.Boolean
    ) {
      if (primitive !== undefined) return undefined;
      primitive = part;
      continue;
    }
    if ((part.flags & (ts.TypeFlags.Object | ts.TypeFlags.NonPrimitive)) === 0) return undefined;
    if (checker.getPropertiesOfType(part).length !== 0) return undefined;
    if (checker.getIndexInfosOfType(part).length !== 0) return undefined;
    if (checker.getSignaturesOfType(part, ts.SignatureKind.Call).length !== 0) return undefined;
    if (checker.getSignaturesOfType(part, ts.SignatureKind.Construct).length !== 0) return undefined;
  }
  return primitive;
}

function convertObject(state: ConvertState, type: ts.Type, name: string): ConvertOutcome {
  const checker = state.checker;
  if ((type.flags & ts.TypeFlags.Intersection) !== 0) {
    return convertIntersection(state, type as ts.IntersectionType, name);
  }
  const hoist = hoistName(state, type);
  if (hoist !== undefined) {
    if (state.active.has(hoist) || state.defs.has(hoist)) {
      return { outcome: "schema", schema: { $ref: `#/$defs/${hoist}` } };
    }
    populateGenericDefaults(state, type, hoist);
    state.defs.set(hoist, {});
    state.active.add(hoist);
    const previousPath = state.path;
    state.path = hoist;
    const built = buildObjectSchema(state, type, hoist);
    state.path = previousPath;
    state.active.delete(hoist);
    if (built === null) {
      state.defs.delete(hoist);
      return { outcome: "omitted" };
    }
    state.defs.set(hoist, built);
    return { outcome: "schema", schema: { $ref: `#/$defs/${hoist}` } };
  }
  const built = buildObjectSchema(state, type, name);
  if (built === null) return { outcome: "omitted" };
  return { outcome: "schema", schema: built };
}

function convertIntersection(state: ConvertState, type: ts.IntersectionType, name: string): ConvertOutcome {
  const checker = state.checker;
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  const descriptions: Record<string, string> = {};
  for (const constituent of type.types) {
    if (isDomBaseType(checker, constituent)) {
      state.warnings.push(`nested DOM base not enumerated (${typeText(checker, constituent)})`);
      continue;
    }
    const memberType = constituent;
    const out = convertObjectMembers(memberType, state, name);
    for (const [propName, schema] of Object.entries(out.properties)) {
      const existing = properties[propName];
      if (existing !== undefined && JSON.stringify(existing) !== JSON.stringify(schema)) {
        recordUnresolved(state, propName, "other", typeText(checker, memberType), "intersection members disagree");
        delete properties[propName];
        continue;
      }
      properties[propName] = schema;
    }
    for (const propName of out.required) {
      if (!required.includes(propName)) required.push(propName);
    }
    for (const [propName, description] of Object.entries(out.descriptions)) {
      descriptions[propName] = description;
    }
  }
  void descriptions;
  const schema: JsonSchema = { type: "object", properties };
  if (required.length > 0) schema["required"] = [...required].sort();
  return { outcome: "schema", schema };
}

/** Convert the members of an object type; nested losses use owner-prefixed names. */
export function convertObjectMembers(
  type: ts.Type,
  state: ConvertState,
  owner: string,
): { properties: Record<string, JsonSchema>; required: string[]; descriptions: Record<string, string> } {
  const checker = state.checker;
  const previousPath = state.path;
  state.path = owner;
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  const descriptions: Record<string, string> = {};
  const members = [...checker.getPropertiesOfType(type)].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const member of members) {
    const memberType = checker.getTypeOfSymbol(member);
    const optional =
      (member.flags & ts.SymbolFlags.Optional) !== 0 || includesUndefined(checker, memberType);
    const doc = symbolDoc(checker, member);
    const converted = convertType(state, memberType, member.name);
    if (converted.outcome === "omitted") continue;
    const schema: JsonSchema = { ...converted.schema };
    if (doc !== undefined) schema["description"] = doc;
    properties[member.name] = schema;
    if (doc !== undefined) descriptions[member.name] = doc;
    if (!optional) required.push(member.name);
  }
  state.path = previousPath;
  required.sort();
  return { properties, required, descriptions };
}

function buildObjectSchema(state: ConvertState, type: ts.Type, owner: string): JsonSchema | null {
  const checker = state.checker;
  const outerPath = state.path;
  const { properties, required } = convertObjectMembers(type, state, owner);
  const index = checker
    .getIndexInfosOfType(type)
    .find((info) => (info.keyType.flags & ts.TypeFlags.String) !== 0);
  const schema: JsonSchema = { type: "object", properties };
  if (required.length > 0) schema["required"] = required;
  if (index !== undefined) {
    // One replaced row per index signature (kind: index-signature in the
    // reason). The value conversion runs loss-suppressed: its surface is
    // subsumed by the map row, never itemised twice.
    const savedDropped = state.dropped.length;
    const savedReplaced = state.replaced.length;
    const savedUnresolved = state.unresolved.length;
    const savedMode = state.payloadMode;
    state.payloadMode = true;
    const converted = convertType(state, index.type, "value");
    state.payloadMode = savedMode;
    state.dropped.length = savedDropped;
    state.replaced.length = savedReplaced;
    state.unresolved.length = savedUnresolved;
    const additional = converted.outcome === "schema" ? converted.schema : {};
    if (converted.outcome === "omitted") {
      state.warnings.push(`${owner}: index value not convertible, additionalProperties left open`);
    }
    schema["additionalProperties"] = additional;
    const indexName = outerPath === "" || outerPath === owner ? owner : `${outerPath}.${owner}`;
    state.replaced.push({
      name: indexName,
      sourceType: typeText(checker, type),
      replacement: JSON.stringify(additional),
      reason: "index-signature: open-ended map loses key discipline",
    });
  }
  return schema;
}

function includesUndefined(checker: ts.TypeChecker, type: ts.Type): boolean {
  if ((type.flags & ts.TypeFlags.Undefined) !== 0) return true;
  if ((type.flags & ts.TypeFlags.Union) !== 0) {
    return (type as ts.UnionType).types.some((part) => (part.flags & ts.TypeFlags.Undefined) !== 0);
  }
  return false;
}

/** A callable (non-construct) signature makes a function type. */
export function isFunctionType(checker: ts.TypeChecker, type: ts.Type): boolean {
  return checker.getSignaturesOfType(type, ts.SignatureKind.Call).length > 0;
}

function referenceTargetName(type: ts.Type): string | undefined {
  if ((type.flags & ts.TypeFlags.Object) === 0) return undefined;
  const target = (type as ts.TypeReference).target;
  const symbol = target?.symbol ?? type.symbol ?? type.aliasSymbol;
  return symbol?.name;
}

function aliasOrTargetName(type: ts.Type): string | undefined {
  return type.aliasSymbol?.name ?? referenceTargetName(type);
}

/** Snippet/render-function types, by reference name. */
export function isSnippetType(type: ts.Type): boolean {
  const name = aliasOrTargetName(type);
  return name === "Snippet";
}

/** Renderable-node types, by reference name. */
export function isNodeType(type: ts.Type): boolean {
  const name = aliasOrTargetName(type);
  return name === "ReactNode" || name === "ReactElement" || name === "VNode" || name === "TemplateRef";
}

function isEventEmitterType(type: ts.Type): boolean {
  return aliasOrTargetName(type) === "EventEmitter";
}

/**
 * A named type whose declarations all live in node_modules or the
 * TypeScript library: third-party surface the contracts never inline.
 * Component-package declarations (repo .d.ts, including dist) are excluded.
 */
function isLibraryType(type: ts.Type): boolean {
  const symbol = type.aliasSymbol ?? type.symbol;
  if (symbol === undefined || symbol.name === "__type") return false;
  const declarations = symbol.getDeclarations() ?? [];
  if (declarations.length === 0) return false;
  return declarations.every((declaration) => {
    const file = declaration.getSourceFile().fileName;
    return file.includes("/node_modules/") || file.includes("/typescript/lib/");
  });
}

function isDateType(checker: ts.TypeChecker, type: ts.Type): boolean {
  const symbol = type.symbol ?? type.aliasSymbol;
  if (symbol?.name !== "Date") return false;
  void checker;
  const declarations = symbol.getDeclarations() ?? [];
  return declarations.some((declaration) => declaration.getSourceFile().isDeclarationFile);
}

function isArrayType(checker: ts.TypeChecker, type: ts.Type): boolean {
  if ((type.flags & ts.TypeFlags.Object) === 0) return false;
  const target = (type as ts.TypeReference).target;
  if (target === undefined) return false;
  void checker;
  return target.symbol?.name === "Array" || target.symbol?.name === "ReadonlyArray";
}

export function isTupleType(checker: ts.TypeChecker, type: ts.Type): boolean {
  if ((type.flags & ts.TypeFlags.Object) === 0) return false;
  const target = (type as ts.TypeReference).target;
  if (target !== undefined) return (target.objectFlags & ts.ObjectFlags.Tuple) !== 0;
  // Target-less tuple literals as emitted in .d.ts (ng-content selectors):
  // an object type whose length is a numeric literal.
  const lengthProp = checker.getPropertyOfType(type, "length");
  if (lengthProp === undefined) return false;
  return typeof literalValue(checker.getTypeOfSymbol(lengthProp)) === "number";
}

/** A rest tuple has no fixed element list (variadic tail). */
export function isRestTuple(checker: ts.TypeChecker, type: ts.Type): boolean {
  const target = (type as ts.TypeReference).target as unknown as { elementFlags?: number[] } | undefined;
  const flags: number[] | undefined = Array.isArray(target?.elementFlags) ? target?.elementFlags : undefined;
  if (flags !== undefined) return flags.some((flag) => (flag & 12) !== 0);
  // Target-less: fixed exactly when the literal length matches the element count.
  const lengthProp = checker.getPropertyOfType(type, "length");
  const length = lengthProp === undefined ? undefined : literalValue(checker.getTypeOfSymbol(lengthProp));
  const count = checker.getTypeArguments(type as ts.TypeReference).length;
  return !(typeof length === "number" && length === count);
}

/** Element types of a tuple (undefined for non-tuples). */
export function tupleElementTypes(checker: ts.TypeChecker, type: ts.Type): ts.Type[] | undefined {
  if (!isTupleType(checker, type)) return undefined;
  return [...checker.getTypeArguments(type as ts.TypeReference)];
}

function enumValues(checker: ts.TypeChecker, type: ts.Type): (string | number)[] | null {
  const symbol = type.symbol ?? type.aliasSymbol;
  if (symbol === undefined) return null;
  void checker;
  const values: (string | number)[] = [];
  for (const member of symbol.exports?.values() ?? []) {
    const value = checker.getConstantValue(member as unknown as ts.EnumMember);
    if (typeof value !== "string" && typeof value !== "number") return null;
    values.push(value);
  }
  return values;
}

/**
 * DOM-passthrough base detection (spec 6.2/7.1): a reference whose name ends
 * in Attributes, or whose target lives in a DOM library or a known element
 * attribute module.
 */
export function isDomBaseType(checker: ts.TypeChecker, type: ts.Type): boolean {
  void checker;
  const name = aliasOrTargetName(type);
  if (name !== undefined && /(Attributes|AriaAttributes)$/.test(name)) return true;
  const symbol = (type as ts.TypeReference).target?.symbol ?? type.symbol ?? type.aliasSymbol;
  const declarations = symbol?.getDeclarations() ?? [];
  return declarations.some((declaration) => declaration.getSourceFile().fileName.includes("/typescript/lib/"));
}

/**
 * Convert call-signature parameters to schemas. Returns null when a
 * parameter cannot be converted (the caller omits the payload and warns).
 */
export function convertSignatureParams(
  state: ConvertState,
  checker: ts.TypeChecker,
  signatures: readonly ts.Signature[],
  owner: string,
): JsonSchema[] | null {
  if (signatures.length === 0) return null;
  const [first, ...rest] = signatures;
  if (first === undefined) return null;
  if (rest.length > 0) state.warnings.push(`${owner}: ${signatures.length} overloads, the first is used`);
  const schemas: JsonSchema[] = [];
  const previousMode = state.payloadMode;
  const previousPath = state.path;
  state.payloadMode = true;
  state.path = owner;
  for (const parameter of first.getParameters()) {
    const parameterType = checker.getTypeOfSymbol(parameter);
    // Rest parameters (...args: T[]) convert as their array type.
    const converted = convertType(state, parameterType, parameter.name);
    if (converted.outcome === "omitted") {
      state.payloadMode = previousMode;
      state.path = previousPath;
      return null;
    }
    schemas.push(converted.schema);
  }
  state.payloadMode = previousMode;
  state.path = previousPath;
  return schemas;
}
