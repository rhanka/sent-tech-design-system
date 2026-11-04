import * as ts from "typescript";

import { convertSignatureParams, isFunctionType, isNodeType, isSnippetType } from "./convert.js";
import {
  absorbState,
  collectMembers,
  convertMember,
  finalizeCompleteness,
  findPropsType,
  freshBody,
  declaredTypeName,
  partitionPropsType,
  populateGenericDefaults,
  sortBody,
  stripUndefined,
} from "./shared.js";
import { NO_PROPS_LIMITATION } from "./types.js";
import type { FrameworkBody, FrameworkInput, JsonSchema } from "./types.js";

/**
 * React extractor (spec 7.3): exported XProps, generic defaults with a
 * warning, ReactNode slots, onX events. Ref types are ignored.
 */

const EVENT_PATTERN = /^on[A-Z]/;
const REF_NAMES = new Set(["Ref", "RefObject", "RefCallback", "LegacyRef", "MutableRefObject"]);

const NODE_NAMES = new Set(["ReactNode", "ReactElement", "VNode", "TemplateRef", "JSX.Element"]);

function isNodeDeclared(symbol: ts.Symbol): boolean {
  const name = declaredTypeName(symbol);
  return name !== undefined && NODE_NAMES.has(name);
}

function isRefType(symbol: ts.Symbol, type: ts.Type): boolean {
  const declared = declaredTypeName(symbol);
  if (declared !== undefined && REF_NAMES.has(declared)) return true;
  const name = type.aliasSymbol?.name ?? (type as ts.TypeReference).target?.symbol?.name ?? type.symbol?.name;
  return name !== undefined && REF_NAMES.has(name);
}

function returnsNode(checker: ts.TypeChecker, memberType: ts.Type): boolean {
  for (const signature of checker.getSignaturesOfType(memberType, ts.SignatureKind.Call)) {
    if (isNodeType(checker.getReturnTypeOfSignature(signature))) return true;
  }
  return false;
}

export function extractReact(input: FrameworkInput): FrameworkBody {
  const checker = input.checker;
  const found = findPropsType(input);
  if (found === undefined) return none(input, "no-props-type");
  const { body, state } = freshBody(input, found.propsTypeName);
  populateGenericDefaults(state, found.propsType, found.propsTypeName);
  const partition = partitionPropsType(state, found.propsType, found.typeNode);
  if (partition.passthrough !== undefined) body.passthrough = partition.passthrough;
  const { byName } = collectMembers(state, partition.ownTypes, found.propsTypeName);

  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  for (const [name, symbol] of [...byName.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const memberType = stripUndefined(checker, checker.getTypeOfSymbol(symbol));
    if (isRefType(symbol, memberType)) continue;
    // Union aliases flatten under strictNullChecks; the declared name
    // recovers ReactNode after `| undefined` erases the aliasSymbol.
    const nodeLike = isNodeType(memberType) || isNodeDeclared(symbol);
    if (name === "children" && nodeLike) {
      body.slots.push({ name: "children" });
      continue;
    }
    if (name !== "children" && isFunctionType(checker, memberType) && returnsNode(checker, memberType)) {
      const signatures = checker.getSignaturesOfType(memberType, ts.SignatureKind.Call);
      const params = convertSignatureParams(state, checker, signatures, name);
      const slot: FrameworkBody["slots"][number] = { name };
      if (params !== null) {
        if (params.length === 1 && params[0] !== undefined) slot.params = params[0];
        else if (params.length > 1) slot.params = { type: "array", prefixItems: params, items: false };
      } else {
        state.warnings.push(`${name}: slot params not convertible, omitted`);
      }
      body.slots.push(slot);
      continue;
    }
    if (nodeLike) {
      state.dropped.push({
        name,
        kind: "node",
        sourceType: checker.typeToString(memberType),
        reason: "renderable-node surface has no JSON Schema form",
      });
      continue;
    }
    if (isSnippetType(memberType)) {
      state.dropped.push({
        name,
        kind: "snippet",
        sourceType: checker.typeToString(memberType),
        reason: "render-function surface has no JSON Schema form",
      });
      continue;
    }
    if (isFunctionType(checker, memberType) && EVENT_PATTERN.test(name)) {
      const signatures = checker.getSignaturesOfType(memberType, ts.SignatureKind.Call);
      const params = convertSignatureParams(state, checker, signatures, name);
      const event: FrameworkBody["events"][number] = { name };
      if (params !== null) {
        if (params.length === 1 && params[0] !== undefined) event.payload = params[0];
        else if (params.length > 1) event.payload = { type: "array", prefixItems: params, items: false };
      } else {
        state.warnings.push(`${name}: payload not convertible, omitted`);
      }
      body.events.push(event);
      continue;
    }
    convertMember(state, symbol, properties, required);
  }

  if (Object.keys(properties).length > 0 || body.passthrough !== undefined) {
    const schema: JsonSchema = { type: "object", properties };
    if (required.length > 0) schema["required"] = [...required].sort();
    body.props = schema;
  }
  absorbState(body, state);
  body.status = finalizeCompleteness(undefined, body);
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
