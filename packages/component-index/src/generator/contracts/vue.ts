import * as ts from "typescript";

import { convertSignatureParams, isFunctionType } from "./convert.js";
import {
  absorbState,
  collectMembers,
  convertMember,
  finalizeCompleteness,
  findPropsType,
  freshBody,
  partitionPropsType,
  populateGenericDefaults,
  sortBody,
  stripUndefined,
} from "./shared.js";
import type { FrameworkBody, FrameworkInput, JsonSchema } from "./types.js";
import { NO_PROPS_LIMITATION, VUE_SLOTS_LIMITATION } from "./types.js";

/**
 * Vue extractor (spec 7.4): exported XProps is authoritative; events come
 * from the emits string union and onX members of the DefineComponent type;
 * SFC slots come from public $slots or generic setup contexts;
 * update:<name> emits pair to bindable.
 */

const ON_PATTERN = /^on[A-Z]/;

function valueOfLiteral(type: ts.Type): string | undefined {
  const value = (type as unknown as { value?: unknown }).value;
  return typeof value === "string" ? value : undefined;
}

/** String-literal union members, or undefined when the type is not one. */
function literalUnion(checker: ts.TypeChecker, type: ts.Type): string[] | undefined {
  void checker;
  if ((type.flags & ts.TypeFlags.Union) === 0) {
    const single = valueOfLiteral(type);
    return single === undefined ? undefined : [single];
  }
  const names: string[] = [];
  for (const part of (type as ts.UnionType).types) {
    const value = valueOfLiteral(part);
    if (value === undefined) return undefined;
    names.push(value);
  }
  return names;
}

interface ScannedEvents {
  emits: string[];
  onHandlers: { name: string; type: ts.Type }[];
}

function scanTypeArguments(checker: ts.TypeChecker, type: ts.Type, scanned: ScannedEvents, visited: Set<ts.Type>, readEmits = true): void {
  if (visited.has(type)) return;
  visited.add(type);
  if ((type.flags & ts.TypeFlags.Union) !== 0) {
    for (const part of (type as ts.UnionType).types) scanTypeArguments(checker, part, scanned, visited, readEmits);
    return;
  }
  const reference = type as ts.TypeReference;
  if (reference.target !== undefined) {
    // Array of string literals: the emits surface.
    const targetName = reference.target.symbol?.name;
    if (readEmits && (targetName === "Array" || targetName === "ReadonlyArray")) {
      const args = checker.getTypeArguments(reference);
      if (args.length === 1 && args[0] !== undefined) {
        const names = literalUnion(checker, args[0]);
        if (names !== undefined) {
          for (const name of names) {
            if (!scanned.emits.includes(name)) scanned.emits.push(name);
          }
          return;
        }
      }
    }
    for (const argument of checker.getTypeArguments(reference)) {
      scanTypeArguments(checker, argument, scanned, visited, readEmits);
    }
  }
  // onX handler members live on any object type, including mapped-type
  // applications (Readonly<...>) that still carry a reference target.
  if ((type.flags & ts.TypeFlags.Object) !== 0) {
    for (const member of checker.getPropertiesOfType(type)) {
      if (!ON_PATTERN.test(member.name)) continue;
      const memberType = stripUndefined(checker, checker.getTypeOfSymbol(member));
      if (!isFunctionType(checker, memberType)) continue;
      if (!scanned.onHandlers.some((handler) => handler.name === member.name)) {
        scanned.onHandlers.push({ name: member.name, type: memberType });
      }
    }
  }
  if ((type.flags & ts.TypeFlags.Intersection) !== 0) {
    for (const constituent of (type as ts.IntersectionType).types) {
      scanTypeArguments(checker, constituent, scanned, visited, readEmits);
    }
  }
}

function exportedSymbol(input: FrameworkInput, name: string): ts.Symbol | undefined {
  const module = input.checker.getSymbolAtLocation(input.declFile);
  const symbol = module && input.checker.getExportsOfModule(module).find(symbol => symbol.name === name);
  return symbol && ((symbol.flags & ts.SymbolFlags.Alias) !== 0 ? input.checker.getAliasedSymbol(symbol) : symbol);
}

function componentValueType(input: FrameworkInput): ts.Type | undefined {
  const module = input.checker.getSymbolAtLocation(input.declFile);
  const hasOtherValues = module && input.checker.getExportsOfModule(module).some(exported => {
    const symbol = exportedSymbol(input, exported.name);
    return exported.name !== "default" && symbol && (symbol.flags & ts.SymbolFlags.Value) !== 0;
  });
  // A shared .d.ts can export many unrelated values. Its default is not an
  // oracle for an absent named component. SFC files have a known default.
  const symbol = exportedSymbol(input, input.identifier)
    ?? (input.repoDeclPath.endsWith(".vue.d.ts") || !hasOtherValues ? exportedSymbol(input, "default") : undefined);
  return symbol && input.checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration ?? input.declFile);
}

interface PublicSurface {
  slots: ts.Type[];
  emits: ts.Signature[];
  props: ts.Type[];
}

function publicSurface(checker: ts.TypeChecker, type: ts.Type): PublicSurface {
  const surface: PublicSurface = { slots: [], emits: [], props: [] };
  const property = (owner: ts.Type, name: string): ts.Type | undefined => {
    const symbol = checker.getPropertyOfType(owner, name);
    return symbol && stripUndefined(checker, checker.getTypeOfSymbol(symbol));
  };
  const add = (owner: ts.Type, slotsName: string, emitName: string): void => {
    const slots = property(owner, slotsName);
    if (slots) surface.slots.push(slots);
    const emit = property(owner, emitName);
    if (emit) surface.emits.push(...checker.getSignaturesOfType(emit, ts.SignatureKind.Call));
  };
  for (const signature of checker.getSignaturesOfType(type, ts.SignatureKind.Construct)) {
    const instance = checker.getReturnTypeOfSignature(signature);
    add(instance, "$slots", "$emit");
    const props = property(instance, "$props");
    if (props) surface.props.push(props);
  }
  // vue-tsc generic SFCs are callable: (__props, __ctx?, __expose?, ...)
  // => VNode & { __ctx?: { slots, emit, ... } }. No constructor is emitted.
  for (const signature of checker.getSignaturesOfType(type, ts.SignatureKind.Call)) {
    const props = signature.parameters[0];
    if (props) surface.props.push(checker.getTypeOfSymbol(props));
    const context = signature.parameters[1];
    if (context) add(stripUndefined(checker, checker.getTypeOfSymbol(context)), "slots", "emit");
    const returnedContext = property(checker.getReturnTypeOfSignature(signature), "__ctx");
    if (returnedContext) add(returnedContext, "slots", "emit");
  }
  return surface;
}

function payload(params: JsonSchema[]): JsonSchema | undefined {
  return params.length === 1 ? params[0] : params.length > 1 ? { type: "array", prefixItems: params, items: false } : undefined;
}

export function extractVue(input: FrameworkInput): FrameworkBody {
  const checker = input.checker;
  const found = findPropsType(input);
  const propsName = `${input.identifier}Props`;
  const explicitlyExported = input.declFile.statements.some(statement =>
    ((ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) && statement.name.text === propsName && statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) ||
    (ts.isExportDeclaration(statement) && (
      (statement.exportClause && ts.isNamedExports(statement.exportClause) && statement.exportClause.elements.some(element => element.name.text === propsName)) ||
      (!statement.exportClause && statement.moduleSpecifier && exportedSymbol(input, propsName)?.declarations?.some(node => node.getSourceFile() !== input.declFile))
    )));
  if (found === undefined || !explicitlyExported || exportedSymbol(input, propsName) === undefined) return none(input, "no-props-type");
  const { body, state } = freshBody(input, found.propsTypeName);
  populateGenericDefaults(state, found.propsType, found.propsTypeName);
  const partition = partitionPropsType(state, found.propsType, found.typeNode);
  if (partition.passthrough !== undefined) body.passthrough = partition.passthrough;
  const { byName } = collectMembers(state, partition.ownTypes, found.propsTypeName);

  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  for (const [, symbol] of [...byName.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    convertMember(state, symbol, properties, required);
  }
  const propNames = new Set(byName.keys());

  // Events: emits strings plus onX handler members of the component value type.
  const scanned: ScannedEvents = { emits: [], onHandlers: [] };
  const componentType = componentValueType(input);
  if (componentType === undefined) body.warnings.push("component value declaration not found; events and slots unavailable");
  if (componentType !== undefined) {
    for (const signature of checker.getSignaturesOfType(componentType, ts.SignatureKind.Call)) {
      for (const parameter of signature.typeParameters ?? []) {
        const node = parameter.symbol?.declarations?.[0];
        if (parameter.symbol && node && ts.isTypeParameterDeclaration(node) && node.default) {
          state.genericDefaults.set(parameter.symbol, checker.getTypeFromTypeNode(node.default));
        }
      }
    }
    const surface = publicSurface(checker, componentType);
    for (const props of [found.propsType, ...surface.props]) {
      for (const member of checker.getPropertiesOfType(props)) {
        const type = stripUndefined(checker, checker.getTypeOfSymbol(member));
        if (ON_PATTERN.test(member.name) && isFunctionType(checker, type) && !scanned.onHandlers.some(h => h.name === member.name)) {
          scanned.onHandlers.push({ name: member.name, type });
        }
      }
    }
    if (surface.props.length === 0) scanTypeArguments(checker, componentType, scanned, new Set(), surface.emits.length === 0);
    const seenEvents = new Set<string>();
    for (const signature of surface.emits) {
      const first = signature.parameters[0];
      const names = first && literalUnion(checker, checker.getTypeOfSymbol(first));
      if (!names) continue;
      for (const name of names) {
        if (seenEvents.has(name)) continue;
        seenEvents.add(name);
        scanned.emits.push(name);
        const params = convertSignatureParams(state, checker, [signature], name, 1);
        const schema = params && payload(params);
        body.events.push(schema ? { name, payload: schema } : { name });
        if (params === null) body.warnings.push(`${name}: payload not convertible, omitted`);
      }
    }
    const seenSlots = new Set<string>();
    for (const slots of surface.slots) {
      for (const member of checker.getPropertiesOfType(slots)) {
        if (seenSlots.has(member.name)) continue;
        seenSlots.add(member.name);
        const type = stripUndefined(checker, checker.getTypeOfSymbol(member));
        const params = convertSignatureParams(state, checker, checker.getSignaturesOfType(type, ts.SignatureKind.Call), `slot:${member.name}`);
        const slot: FrameworkBody["slots"][number] = { name: member.name };
        const schema = params && payload(params);
        if (schema) slot.params = schema;
        if ((member.flags & ts.SymbolFlags.Optional) === 0) slot.required = true;
        if (params === null) state.unresolved.push({ name: `slot:${member.name}`, kind: "other", sourceType: checker.typeToString(type), reason: "slot parameters not convertible" });
        body.slots.push(slot);
      }
    }
  }
  const handlerByName = new Map(scanned.onHandlers.map((handler) => [handler.name, handler.type]));
  const emitted = new Set<string>();
  for (const name of scanned.emits) {
    if (emitted.has(name)) continue;
    emitted.add(name);
    if (name.startsWith("update:") && propNames.has(name.slice("update:".length))) {
      body.bindable.push(name.slice("update:".length));
      body.warnings.push(`two-way binding: prop "${name.slice("update:".length)}" paired with emit "${name}"`);
    }
    // Both spellings are listed verbatim when both appear (spec 7.4); the
    // handler spelling is listed again below with its signature.
    if (!body.events.some(event => event.name === name)) {
      body.events.push({ name });
      body.warnings.push(`emit "${name}": payload not in declaration`);
    }
  }
  for (const handler of scanned.onHandlers) {
    if (emitted.has(handler.name)) continue;
    emitted.add(handler.name);
    const signatures = checker.getSignaturesOfType(handler.type, ts.SignatureKind.Call);
    const params = convertSignatureParams(state, checker, signatures, handler.name);
    const event: FrameworkBody["events"][number] = { name: handler.name };
    if (params !== null && params.length > 0) {
      event.payload = params.length === 1 && params[0] !== undefined ? params[0] : { type: "array", prefixItems: params, items: false };
    } else if (params === null) {
      body.warnings.push(`${handler.name}: payload not convertible, omitted`);
    }
    body.events.push(event);
  }
  // Both spellings listed verbatim when both appear.
  for (const name of scanned.emits) {
    const paired = `on${name[0]?.toUpperCase() ?? ""}${name.slice(1)}`;
    if (handlerByName.has(paired)) {
      body.warnings.push(`event pair: emits "${name}" and prop "${paired}" both listed verbatim`);
    }
  }

  if (Object.keys(properties).length > 0 || body.passthrough !== undefined || state.defs.size > 0) {
    const schema: JsonSchema = { type: "object", properties, additionalProperties: false };
    if (required.length > 0) schema["required"] = [...required].sort();
    body.props = schema;
  }
  absorbState(body, state);
  if (body.slots.length === 0) body.limitations.push(VUE_SLOTS_LIMITATION);
  const missingSlots = (input.expectedSlots ?? []).filter(name => !body.slots.some(slot => slot.name === name));
  for (const name of missingSlots) body.warnings.push(`expected slot "${name}" not found in declaration`);
  const forcedPartial = missingSlots.length > 0 || componentType === undefined;
  body.status = forcedPartial ? "partial" : finalizeCompleteness(undefined, body);
  sortBody(body);
  return body;
}

function none(input: FrameworkInput, reason: string): FrameworkBody {
  return {
    status: "none",
    reason,
    source: {
      package: input.packageName,
      version: input.packageVersion,
      declarationPath: input.repoDeclPath,
      declarationDigest: input.declarationDigest,
      propsType: `${input.identifier}Props`,
    },
    slots: [],
    events: [],
    bindable: [],
    dropped: [],
    replaced: [],
    unresolved: [],
    limitations: [NO_PROPS_LIMITATION],
    warnings: [],
  };
}

export type { FrameworkInput } from "./types.js";
