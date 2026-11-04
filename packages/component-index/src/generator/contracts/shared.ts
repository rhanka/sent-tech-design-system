import * as ts from "typescript";

import {
  convertObjectMembers,
  convertType,
  createConvertState,
  isDomBaseType,
  populateGenericDefaults,
  symbolDoc,
  typeText,
  type ConvertState,
} from "./convert.js";
import type { Completeness, FrameworkBody, FrameworkInput, JsonSchema, Passthrough } from "./types.js";
import { DEFAULTS_LIMITATION } from "./types.js";

/**
 * Shared extractor machinery (spec 7.1): props-type discovery, DOM
 * partitioning, generic-default instantiation, member helpers and the
 * GEN-C1…C3 completeness rule.
 */

export interface PropsTypeFound {
  /** Checker type of the props object. */
  propsType: ts.Type;
  /** Name recorded in source.propsType. */
  propsTypeName: string;
  /** The alias/type node when the props type is declared inline (for partitioning). */
  typeNode: ts.TypeNode | undefined;
  /** Non-fatal discovery notes. */
  warnings: string[];
}

function propsTypeByName(
  checker: ts.TypeChecker,
  declFile: ts.SourceFile,
  name: string,
): { type: ts.Type; node: ts.TypeNode | undefined } | undefined {
  for (const statement of declFile.statements) {
    if (ts.isTypeAliasDeclaration(statement) && statement.name.text === name) {
      return { type: checker.getTypeFromTypeNode(statement.type), node: statement.type };
    }
    if (ts.isInterfaceDeclaration(statement) && statement.name.text === name) {
      const symbol = checker.getSymbolAtLocation(statement.name);
      if (symbol === undefined) continue;
      return { type: checker.getDeclaredTypeOfSymbol(symbol), node: undefined };
    }
  }
  return undefined;
}

/** Find `<Identifier>Props` in the declaration file (no fallback). */
export function findPropsType(input: FrameworkInput): PropsTypeFound | undefined {
  const name = `${input.identifier}Props`;
  const found = propsTypeByName(input.checker, input.declFile, name);
  if (found === undefined) return undefined;
  const roots = new Set(input.program.getRootFileNames());
  const typeNode = found.node === undefined ? undefined : normalizeAliasNode(input.checker, roots, found.node);
  return { propsType: found.type, propsTypeName: name, typeNode, warnings: [] };
}

/**
 * Walk a props type node through local type aliases to its structural form
 * (`CheckboxProps = ChoiceProps = Omit<…> & {…}` normalizes to the
 * intersection). Only aliases declared in the program roots (built
 * component declarations) are followed; library utilities (Omit, Partial,
 * Component, …) and non-alias references stop the walk. Bounded.
 */
function normalizeAliasNode(
  checker: ts.TypeChecker,
  roots: Set<string>,
  node: ts.TypeNode,
): ts.TypeNode {
  const STOP = new Set(["Omit", "Pick", "Partial", "Required", "Record", "NonNullable", "Component", "Snippet"]);
  let current = node;
  for (let depth = 0; depth < 10; depth++) {
    if (!ts.isTypeReferenceNode(current)) return current;
    const typeName = current.typeName;
    const name = ts.isIdentifier(typeName) ? typeName.text : typeName.right.text;
    if (STOP.has(name)) return current;
    const symbol = checker.getSymbolAtLocation(typeName);
    if (symbol === undefined) return current;
    const target = (symbol.flags & ts.SymbolFlags.Alias) !== 0 ? checker.getAliasedSymbol(symbol) : symbol;
    const declaration = target.declarations?.[0];
    if (declaration === undefined || !ts.isTypeAliasDeclaration(declaration)) return current;
    if (!roots.has(declaration.getSourceFile().fileName)) return current;
    current = declaration.type;
  }
  return current;
}

export { populateGenericDefaults };

/**
 * Strip `undefined` from an optional member's type before classification.
 * Under strictNullChecks every `x?` member reads as `T | undefined`, a
 * union with no signatures and no alias — classifiers must see the `T`.
 */
export function stripUndefined(checker: ts.TypeChecker, type: ts.Type): ts.Type {
  void checker;
  if ((type.flags & ts.TypeFlags.Union) === 0) return type;
  const parts = (type as ts.UnionType).types.filter(
    (part) => (part.flags & ts.TypeFlags.Undefined) === 0,
  );
  if (parts.length === 1 && parts[0] !== undefined) return parts[0];
  return type;
}

/**
 * Declared type name of a props member, from its declaration syntax.
 * Union aliases flatten under strictNullChecks (`ReactNode | undefined`
 * loses its aliasSymbol), so the written `ReactNode` reference is recovered
 * here. Compiler nodes only, never regex.
 */
export function declaredTypeName(symbol: ts.Symbol): string | undefined {
  for (const declaration of symbol.getDeclarations() ?? []) {
    if (
      (ts.isPropertySignature(declaration) || ts.isPropertyDeclaration(declaration)) &&
      declaration.type !== undefined
    ) {
      const written = declaration.type;
      if (ts.isTypeReferenceNode(written)) return qualifiedName(written.typeName);
      if (ts.isUnionTypeNode(written)) {
        for (const part of written.types) {
          if (ts.isTypeReferenceNode(part)) return qualifiedName(part.typeName);
        }
      }
    }
  }
  return undefined;
}

function qualifiedName(name: ts.EntityName): string {
  return ts.isIdentifier(name) ? name.text : name.right.text;
}

/** A symbol is optional, or its type admits undefined. */
export function memberRequired(checker: ts.TypeChecker, symbol: ts.Symbol, type: ts.Type): boolean {
  if ((symbol.flags & ts.SymbolFlags.Optional) !== 0) return false;
  if ((type.flags & ts.TypeFlags.Undefined) !== 0) return false;
  if ((type.flags & ts.TypeFlags.Union) !== 0) {
    const hasUndefined = (type as ts.UnionType).types.some((part) => (part.flags & ts.TypeFlags.Undefined) !== 0);
    if (hasUndefined) return false;
  }
  return true;
}

export interface Partition {
  /** Checker types whose members form the props object. */
  ownTypes: ts.Type[];
  passthrough: Passthrough | undefined;
}

/**
 * Split a props type into own members and an inherited DOM-attribute base
 * (spec 6.2/7.1). The base is recorded once in passthrough with the exact
 * Omit exclusion list, never enumerated from lib.dom.
 */
export function partitionPropsType(
  state: ConvertState,
  propsType: ts.Type,
  typeNode: ts.TypeNode | undefined,
): Partition {
  const checker = state.checker;
  if (typeNode !== undefined && ts.isIntersectionTypeNode(typeNode)) {
    const ownTypes: ts.Type[] = [];
    let passthrough: Passthrough | undefined;
    for (const constituentNode of typeNode.types) {
      const parsed = parseOmitLike(checker, constituentNode);
      if (parsed !== undefined && (isDomBaseName(parsed.baseName, parsed.baseType) || isDomBaseType(checker, parsed.baseType))) {
        if (passthrough !== undefined) {
          state.warnings.push(`multiple DOM bases, the first is recorded (${passthrough.base})`);
          continue;
        }
        passthrough = { base: parsed.baseText, omitted: parsed.omitted };
        continue;
      }
      ownTypes.push(checker.getTypeFromTypeNode(constituentNode));
    }
    return { ownTypes, passthrough };
  }
  if (typeNode !== undefined && ts.isTypeReferenceNode(typeNode)) {
    const parsed = parseOmitLike(checker, typeNode);
    if (parsed !== undefined && (isDomBaseName(parsed.baseName, parsed.baseType) || isDomBaseType(checker, parsed.baseType))) {
      return { ownTypes: [], passthrough: { base: parsed.baseText, omitted: parsed.omitted } };
    }
  }
  return { ownTypes: [propsType], passthrough: undefined };
}

interface OmitLike {
  /** Verbatim base text from the declaration node (never printed by the checker). */
  baseText: string;
  baseName: string;
  baseType: ts.Type;
  omitted: string[];
}

/** Rightmost name of a (possibly qualified) type reference. */
function typeReferenceName(node: ts.TypeNode): string | undefined {
  if (!ts.isTypeReferenceNode(node)) return undefined;
  if (ts.isIdentifier(node.typeName)) return node.typeName.text;
  return node.typeName.right.text;
}

function parseOmitLike(checker: ts.TypeChecker, node: ts.TypeNode): OmitLike | undefined {
  if (!ts.isTypeReferenceNode(node)) return undefined;
  const name = typeReferenceName(node);
  if (name === undefined) return undefined;
  const baseArg = node.typeArguments?.[0];
  if (baseArg === undefined) return undefined;
  const baseType = checker.getTypeFromTypeNode(baseArg);
  const baseSymbol = baseType.aliasSymbol ?? baseType.symbol;
  // Verbatim declaration text (exact compiler node slice, never regex and
  // never the checker's printer, which cannot linearize recursive
  // element-attribute types).
  const baseText = baseArg.getText();
  const baseName = baseSymbol?.name ?? baseText;
  if (name === "Omit" || name === "Pick") {
    const exclusionsArg = node.typeArguments?.[1];
    const omitted = exclusionsArg === undefined ? [] : stringLiterals(checker, exclusionsArg);
    return { baseText, baseName, baseType, omitted };
  }
  if (name === "Partial" || name === "Required") {
    return { baseText, baseName, baseType, omitted: [] };
  }
  // A direct (non-Omit) base reference: the whole reference text is the base.
  if (isDomBaseName(baseName, baseType) || isDomBaseType(checker, baseType)) {
    return { baseText: node.getText(), baseName, baseType, omitted: [] };
  }
  return undefined;
}

function stringLiterals(checker: ts.TypeChecker, node: ts.TypeNode): string[] {
  const type = checker.getTypeFromTypeNode(node);
  if ((type.flags & ts.TypeFlags.Union) !== 0) {
    const values: string[] = [];
    for (const part of (type as ts.UnionType).types) {
      const value = (part as unknown as { value?: unknown }).value;
      if (typeof value !== "string") return [];
      values.push(value);
    }
    return [...values].sort();
  }
  const value = (type as unknown as { value?: unknown }).value;
  return typeof value === "string" ? [value] : [];
}

function isDomBaseName(name: string, type?: ts.Type): boolean {
  const last = name.includes(".") ? (name.split(".").pop() as string) : name;
  if (!/(Attributes|AriaAttributes)$/.test(last)) return false;
  // Gate on declaration origin like hoistName: a future design-system type
  // that happens to end in Attributes must not become a passthrough. Only
  // library (lib / node_modules) declarations count as DOM bases.
  if (type === undefined) return true;
  const symbol = (type as ts.TypeReference).target?.symbol ?? type.symbol ?? type.aliasSymbol;
  const declarations = symbol?.getDeclarations() ?? [];
  if (declarations.length === 0) return true;
  return declarations.every((declaration) => {
    const file = declaration.getSourceFile().fileName;
    return file.includes("/typescript/lib/") || file.includes("/node_modules/");
  });
}

export interface CollectedMembers {
  byName: Map<string, ts.Symbol>;
}

/** Members of the own types, grouped by name; conflicts are unresolved. */
export function collectMembers(state: ConvertState, ownTypes: ts.Type[], owner: string): CollectedMembers {
  const checker = state.checker;
  const byName = new Map<string, ts.Symbol[]>();
  for (const own of ownTypes) {
    for (const member of checker.getPropertiesOfType(own)) {
      const list = byName.get(member.name) ?? [];
      list.push(member);
      byName.set(member.name, list);
    }
  }
  const resolved = new Map<string, ts.Symbol>();
  for (const [name, symbols] of byName) {
    if (symbols.length === 1 && symbols[0] !== undefined) {
      resolved.set(name, symbols[0]);
      continue;
    }
    const texts = new Set((symbols as ts.Symbol[]).map((symbol) => typeText(checker, checker.getTypeOfSymbol(symbol))));
    if (texts.size === 1 && symbols[0] !== undefined) {
      resolved.set(name, symbols[0]);
      continue;
    }
    state.unresolved.push({
      name: state.path === "" ? name : `${state.path}.${name}`,
      kind: "other",
      sourceType: [...texts].join(" | "),
      reason: "intersection members disagree",
    });
    void owner;
  }
  return { byName: resolved };
}

/** Convert one props member to a schema property (records losses, honors JSDoc). */
export function convertMember(
  state: ConvertState,
  symbol: ts.Symbol,
  properties: Record<string, JsonSchema>,
  required: string[],
): void {
  const checker = state.checker;
  const memberType = checker.getTypeOfSymbol(symbol);
  const converted = convertType(state, memberType, symbol.name);
  if (converted.outcome === "omitted") return;
  const schema: JsonSchema = { ...converted.schema };
  const doc = symbolDoc(checker, symbol);
  if (doc !== undefined) schema["description"] = doc;
  properties[symbol.name] = schema;
  if (memberRequired(checker, symbol, memberType)) required.push(symbol.name);
}

/** GEN-C1…C3 completeness over an emitted framework body. */
export function finalizeCompleteness(status: Completeness | undefined, body: FrameworkBody): Completeness {
  if (status !== undefined) return status;
  if (body.dropped.length > 0 || body.replaced.length > 0 || body.unresolved.length > 0) return "partial";
  return "complete";
}

/** Deterministic ordering for emission: sort every member list by name. */
export function sortBody(body: FrameworkBody): void {
  const byName = (a: { name: string }, b: { name: string }): number =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  body.slots.sort(byName);
  body.events.sort(byName);
  body.bindable.sort();
  body.dropped.sort(byName);
  body.replaced.sort(byName);
  body.unresolved.sort(byName);
  body.limitations.sort();
  body.warnings.sort();
  if (body.props !== undefined) sortSchema(body.props);
  for (const def of Object.values(body.props?.["$defs"] ?? {})) sortSchema(def as JsonSchema);
}

function sortSchema(schema: JsonSchema): void {
  const properties = schema["properties"] as Record<string, JsonSchema> | undefined;
  if (properties !== undefined) {
    const sorted: Record<string, JsonSchema> = {};
    for (const key of Object.keys(properties).sort()) {
      const value = properties[key];
      if (value !== undefined) {
        sortSchema(value);
        sorted[key] = value;
      }
    }
    schema["properties"] = sorted;
  }
  const required = schema["required"];
  if (Array.isArray(required)) required.sort();
  const defs = schema["$defs"] as Record<string, JsonSchema> | undefined;
  if (defs !== undefined) {
    for (const key of Object.keys(defs).sort()) {
      const value = defs[key];
      if (value !== undefined) sortSchema(value);
    }
  }
  const anyOf = schema["anyOf"];
  if (Array.isArray(anyOf)) {
    for (const item of anyOf) sortSchema(item as JsonSchema);
  }
}

/** Fresh body with the K1b-Q5 defaults limitation preinstalled. */
export function freshBody(input: FrameworkInput, propsType: string): {
  body: FrameworkBody;
  state: ConvertState;
} {
  const state = createConvertState(input.checker);
  const body: FrameworkBody = {
    status: "complete",
    source: {
      package: input.packageName,
      version: input.packageVersion,
      declarationPath: input.repoDeclPath,
      declarationDigest: input.declarationDigest,
      propsType,
    },
    slots: [],
    events: [],
    bindable: [],
    dropped: [],
    replaced: [],
    unresolved: [],
    limitations: [DEFAULTS_LIMITATION],
    warnings: [],
  };
  return { body, state };
}

/** Move state losses/warnings into the body and sort for emission. */
export function absorbState(body: FrameworkBody, state: ConvertState): void {
  body.dropped.push(...state.dropped);
  body.replaced.push(...state.replaced);
  body.unresolved.push(...state.unresolved);
  body.warnings.push(...state.warnings);
  if (state.defs.size > 0 && body.props !== undefined) {
    const defs: Record<string, JsonSchema> = {};
    for (const name of [...state.defs.keys()].sort()) {
      const schema = state.defs.get(name);
      if (schema !== undefined) defs[name] = schema;
    }
    body.props["$defs"] = defs;
  }
  sortBody(body);
}

export { convertObjectMembers, convertType, createConvertState };
