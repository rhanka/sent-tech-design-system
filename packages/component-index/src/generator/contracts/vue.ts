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
 * slots stay declaration-derived ([]) with the limitation string;
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

function scanTypeArguments(checker: ts.TypeChecker, type: ts.Type, scanned: ScannedEvents, visited: Set<ts.Type>): void {
  if (visited.has(type)) return;
  visited.add(type);
  if ((type.flags & ts.TypeFlags.Union) !== 0) {
    for (const part of (type as ts.UnionType).types) scanTypeArguments(checker, part, scanned, visited);
    return;
  }
  const reference = type as ts.TypeReference;
  if (reference.target !== undefined) {
    // Array of string literals: the emits surface.
    const targetName = reference.target.symbol?.name;
    if (targetName === "Array" || targetName === "ReadonlyArray") {
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
      scanTypeArguments(checker, argument, scanned, visited);
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
      scanTypeArguments(checker, constituent, scanned, visited);
    }
  }
}

function componentValueType(input: FrameworkInput): ts.Type | undefined {
  for (const statement of input.declFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== input.identifier) continue;
      if (declaration.type === undefined) continue;
      return input.checker.getTypeFromTypeNode(declaration.type);
    }
  }
  return undefined;
}

export function extractVue(input: FrameworkInput): FrameworkBody {
  const checker = input.checker;
  const found = findPropsType(input);
  if (found === undefined) return none(input, "no-props-type");
  const { body, state } = freshBody(input, found.propsTypeName);
  body.limitations.push(VUE_SLOTS_LIMITATION);
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
  if (componentType !== undefined) scanTypeArguments(checker, componentType, scanned, new Set());
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
    body.events.push({ name });
    body.warnings.push(`emit "${name}": payload not in declaration`);
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

  if (Object.keys(properties).length > 0 || body.passthrough !== undefined) {
    const schema: JsonSchema = { type: "object", properties, additionalProperties: false };
    if (required.length > 0) schema["required"] = [...required].sort();
    body.props = schema;
  }
  absorbState(body, state);
  const forcedPartial = (input.expectedSlots ?? []).length > 0;
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
