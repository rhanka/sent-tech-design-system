import * as ts from "typescript";

import {
  convertSignatureParams,
  convertType,
  isFunctionType,
  isSnippetType,
  tupleElementTypes,
} from "./convert.js";
import {
  absorbState,
  collectMembers,
  convertMember,
  finalizeCompleteness,
  findPropsType,
  freshBody,
  memberRequired,
  partitionPropsType,
  populateGenericDefaults,
  sortBody,
  stripUndefined,
} from "./shared.js";
import { NO_PROPS_LIMITATION } from "./types.js";
import type { FrameworkBody, FrameworkInput, JsonSchema } from "./types.js";

/**
 * Svelte extractor (spec 7.2): named or Component-first-argument props type,
 * bindable from the third Component argument, Snippet slots, on* events.
 */

const ON_PATTERN = /^on[A-Za-z]/;

type ComponentNode = ts.TypeReferenceNode | ts.ImportTypeNode;

function componentTypeNode(input: FrameworkInput): ComponentNode | undefined {
  for (const statement of input.declFile.statements) {
    if (!ts.isVariableStatement(statement) && !ts.isFunctionDeclaration(statement)) {
      if (!ts.isClassDeclaration(statement)) continue;
    }
    const declarations =
      ts.isVariableStatement(statement) ? statement.declarationList.declarations : [statement as ts.NamedDeclaration];
    for (const declaration of declarations) {
      const name = (declaration as { name?: ts.BindingName }).name;
      if (name === undefined || !ts.isIdentifier(name) || name.text !== input.identifier) continue;
      const typeNode = (declaration as { type?: ts.TypeNode }).type;
      if (typeNode !== undefined && ts.isTypeReferenceNode(typeNode)) {
        const referenceName = ts.isIdentifier(typeNode.typeName) ? typeNode.typeName.text : "";
        if (referenceName === "Component" || referenceName === "SvelteComponent") return typeNode;
      }
      // Built declarations qualify the helper: import("svelte").Component<...>.
      if (typeNode !== undefined && ts.isImportTypeNode(typeNode)) {
        const qualifier = typeNode.qualifier;
        const qualifierName =
          qualifier !== undefined && ts.isIdentifier(qualifier)
            ? qualifier.text
            : qualifier !== undefined && ts.isQualifiedName(qualifier)
              ? qualifier.right.text
              : "";
        if (qualifierName === "Component" || qualifierName === "SvelteComponent") return typeNode;
      }
    }
  }
  return undefined;
}

function bindableNames(checker: ts.TypeChecker, componentNode: ComponentNode | undefined): string[] {
  if (componentNode === undefined) return [];
  const third = componentNode.typeArguments?.[2];
  if (third === undefined) return [];
  const type = checker.getTypeFromTypeNode(third);
  if ((type.flags & ts.TypeFlags.Union) !== 0) {
    const names: string[] = [];
    for (const part of (type as ts.UnionType).types) {
      const value = (part as unknown as { value?: unknown }).value;
      if (typeof value !== "string") return [];
      names.push(value);
    }
    return [...names].sort();
  }
  if ((type.flags & ts.TypeFlags.StringLiteral) !== 0) {
    const value = (type as unknown as { value?: unknown }).value;
    return typeof value === "string" && value.length > 0 ? [value] : [];
  }
  return [];
}

function snippetParams(
  input: FrameworkInput,
  state: Parameters<typeof convertType>[0],
  memberType: ts.Type,
  owner: string,
): JsonSchema | undefined {
  // The snippet's call signature carries the argument tuple; type arguments
  // are not read (alias instantiations report no usable type arguments).
  const signatures = input.checker.getSignaturesOfType(memberType, ts.SignatureKind.Call);
  const first = signatures[0];
  if (first === undefined) return undefined;
  const parameters = first.getParameters();
  if (parameters.length === 0) return undefined;
  // Spec 7.2: single snippet argument converts to that schema, multiple to
  // a tuple schema, none to no params.
  if (parameters.length === 1 && parameters[0] !== undefined) {
    const argsType = input.checker.getTypeOfSymbol(parameters[0]);
    const elements = tupleElementTypes(input.checker, argsType);
    if (elements !== undefined && elements.length === 0) return undefined;
    if (elements !== undefined && elements.length === 1 && elements[0] !== undefined) {
      const converted = convertType(state, elements[0], `${owner}.params`);
      return converted.outcome === "schema" ? converted.schema : undefined;
    }
    const converted = convertType(state, argsType, `${owner}.params`);
    if (converted.outcome !== "schema") return undefined;
    // An empty fixed tuple is the zero-argument form: omit params.
    if (
      typeof converted.schema["type"] === "string" &&
      converted.schema["type"] === "array" &&
      Array.isArray(converted.schema["prefixItems"]) &&
      (converted.schema["prefixItems"] as unknown[]).length === 0
    ) {
      return undefined;
    }
    return converted.schema;
  }
  const prefixItems: JsonSchema[] = [];
  for (let index = 0; index < parameters.length; index += 1) {
    const parameter = parameters[index];
    if (parameter === undefined) continue;
    const converted = convertType(state, input.checker.getTypeOfSymbol(parameter), `${owner}.params[${index}]`);
    if (converted.outcome === "omitted") return undefined;
    prefixItems.push(converted.schema);
  }
  return { type: "array", prefixItems, items: false };
}

export function extractSvelte(input: FrameworkInput): FrameworkBody {
  const checker = input.checker;
  const found = findPropsType(input);
  let propsType: ts.Type;
  let propsTypeName: string;
  let typeNode: ts.TypeNode | undefined;
  const discoveryWarnings: string[] = [];
  if (found !== undefined) {
    ({ propsType } = found);
    propsTypeName = found.propsTypeName;
    typeNode = found.typeNode;
  } else {
    const componentNode = componentTypeNode(input);
    if (componentNode === undefined || componentNode.typeArguments?.[0] === undefined) {
      return none(input, "no-props-type");
    }
    propsType = checker.getTypeFromTypeNode(componentNode.typeArguments[0] as ts.TypeNode);
    propsTypeName =
      propsType.aliasSymbol?.name ?? propsType.symbol?.name ?? "Component-first-argument";
    typeNode = componentNode.typeArguments[0] as ts.TypeNode;
    discoveryWarnings.push(`fallback: props type read from the Component first type argument (${propsTypeName})`);
  }
  const { body, state } = freshBody(input, propsTypeName);
  body.warnings.push(...discoveryWarnings);
  populateGenericDefaults(state, propsType, propsTypeName);
  const partition = partitionPropsType(state, propsType, typeNode);
  if (partition.passthrough !== undefined) body.passthrough = partition.passthrough;
  const { byName } = collectMembers(state, partition.ownTypes, propsTypeName);

  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  for (const [name, symbol] of [...byName.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const memberType = stripUndefined(checker, checker.getTypeOfSymbol(symbol));
    if (isSnippetType(memberType)) {
      const slot: FrameworkBody["slots"][number] = { name };
      const params = snippetParams(input, state, memberType, name);
      if (params !== undefined) slot.params = params;
      if (memberRequired(checker, symbol, memberType)) slot.required = true;
      body.slots.push(slot);
      continue;
    }
    if (isFunctionType(checker, memberType) && ON_PATTERN.test(name)) {
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

  const componentNode = componentTypeNode(input);
  const bindable = bindableNames(checker, componentNode);
  for (const name of bindable) {
    if (!Object.hasOwn(properties, name)) {
      throw new Error(`svelte: bindable "${name}" is not a props member of "${input.identifier}"`);
    }
  }
  body.bindable = bindable;

  if (Object.keys(properties).length > 0 || body.passthrough !== undefined) {
    const schema: JsonSchema = { type: "object", properties, additionalProperties: false };
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
      propsType: `${input.identifier}Props?`,
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
