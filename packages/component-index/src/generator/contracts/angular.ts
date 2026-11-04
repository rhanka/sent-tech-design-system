import * as ts from "typescript";

import { convertType, isRestTuple, isTupleType, tupleElementTypes } from "./convert.js";
import {
  absorbState,
  finalizeCompleteness,
  findPropsType,
  freshBody,
  populateGenericDefaults,
  sortBody,
} from "./shared.js";
import { symbolDoc } from "./convert.js";
import { NO_PROPS_LIMITATION } from "./types.js";
import type { FrameworkBody, FrameworkInput, JsonSchema } from "./types.js";

/**
 * Angular extractor (spec 7.5): the static ɵcmp declaration is authoritative
 * for input/output names; EventEmitter payloads; ng-content selectors become
 * slots; XProps is cross-checked and discrepancies force partial.
 */

interface CmpInputs {
  fields: { field: string; alias: string; required: boolean }[];
}

interface CmpOutputs {
  fields: { field: string; alias: string }[];
}

function literalStringValue(type: ts.Type): string | undefined {
  const value = (type as unknown as { value?: unknown }).value;
  return typeof value === "string" ? value : undefined;
}

function literalBooleanValue(type: ts.Type): boolean | undefined {
  if ((type.flags & ts.TypeFlags.BooleanLiteral) === 0) return undefined;
  const intrinsic = (type as unknown as { intrinsicName?: string }).intrinsicName;
  if (intrinsic === "true") return true;
  if (intrinsic === "false") return false;
  return undefined;
}

function isAliasRequiredShape(checker: ts.TypeChecker, type: ts.Type): boolean {
  if ((type.flags & ts.TypeFlags.Object) === 0) return false;
  const members = checker.getPropertiesOfType(type);
  if (members.length === 0) return false;
  return members.every((member) => {
    const shape = checker.getPropertiesOfType(checker.getTypeOfSymbol(member));
    const alias = shape.find((item) => item.name === "alias");
    const required = shape.find((item) => item.name === "required");
    return (
      alias !== undefined &&
      required !== undefined &&
      literalStringValue(checker.getTypeOfSymbol(alias)) !== undefined &&
      literalBooleanValue(checker.getTypeOfSymbol(required)) !== undefined
    );
  });
}

function isOutputsShape(checker: ts.TypeChecker, type: ts.Type): boolean {
  if ((type.flags & ts.TypeFlags.Object) === 0) return false;
  const members = checker.getPropertiesOfType(type);
  if (members.length === 0) return false;
  return members.every((member) => literalStringValue(checker.getTypeOfSymbol(member)) !== undefined);
}

function isSelectorsShape(checker: ts.TypeChecker, type: ts.Type): boolean {
  if (!isTupleType(checker, type) || isRestTuple(checker, type)) return false;
  return (tupleElementTypes(checker, type) ?? []).length > 0;
}

function tupleStrings(checker: ts.TypeChecker, type: ts.Type): string[] | undefined {
  const args = tupleElementTypes(checker, type);
  if (args === undefined) return undefined;
  const values: string[] = [];
  for (const argument of args) {
    if ((argument.flags & ts.TypeFlags.Union) !== 0) {
      for (const part of (argument as ts.UnionType).types) {
        const value = literalStringValue(part);
        if (value === undefined) return undefined;
        values.push(value);
      }
      continue;
    }
    const value = literalStringValue(argument);
    if (value === undefined) return undefined;
    values.push(value);
  }
  return values;
}

function findClass(input: FrameworkInput): ts.ClassDeclaration | undefined {
  for (const statement of input.declFile.statements) {
    if (ts.isClassDeclaration(statement) && statement.name?.text === input.identifier) return statement;
  }
  return undefined;
}

/**
 * Payload-less when the emit parameter carries no representable value:
 * void, undefined, an empty union remainder, or a union whose every
 * non-undefined part is void/undefined (the real `emit(value?: T)` shape
 * for `EventEmitter<void>` reads as `void | undefined`). Spec 7.5.
 */
function isPayloadless(type: ts.Type): boolean {
  if ((type.flags & ts.TypeFlags.Union) !== 0) {
    const parts = (type as ts.UnionType).types.filter(
      (part) => (part.flags & ts.TypeFlags.Undefined) === 0,
    );
    if (parts.length === 0) return true;
    return parts.every((part) => (part.flags & (ts.TypeFlags.Void | ts.TypeFlags.Undefined)) !== 0);
  }
  return (type.flags & (ts.TypeFlags.Void | ts.TypeFlags.Undefined)) !== 0;
}

export function extractAngular(input: FrameworkInput): FrameworkBody {
  const checker = input.checker;
  const declaration = findClass(input);
  if (declaration === undefined) return none(input, "no-props-type");
  const classSymbol = checker.getSymbolAtLocation(declaration.name as ts.Identifier) as ts.Symbol;
  // Instance side: field types. Static side: the ɵcmp declaration.
  const classType = checker.getDeclaredTypeOfSymbol(classSymbol);
  const staticType = checker.getTypeOfSymbol(classSymbol);
  const fields = new Map(classType.getProperties().map((symbol) => [symbol.name, symbol]));
  const cmpMember = staticType.getProperty("ɵcmp");
  // The published ɵcmp alias targets `unknown`, so the checker cannot carry
  // the generic arguments through it. Read them from the type reference node
  // (compiler AST, never regex) and resolve each argument individually.
  const cmpDeclaration =
    cmpMember?.valueDeclaration !== undefined && ts.isPropertyDeclaration(cmpMember.valueDeclaration)
      ? (cmpMember.valueDeclaration.type as ts.TypeNode | undefined)
      : undefined;
  const cmpReference =
    cmpDeclaration !== undefined && ts.isTypeReferenceNode(cmpDeclaration) ? cmpDeclaration : undefined;
  if (cmpMember !== undefined && cmpReference === undefined) {
    throw new Error(
      `angular: ɵcmp of "${input.identifier}" does not resolve (missing declaration build; never guessed)`,
    );
  }
  if (cmpReference !== undefined) {
    const referenceSymbol = checker.getSymbolAtLocation(cmpReference.typeName);
    const aliased =
      referenceSymbol !== undefined && (referenceSymbol.flags & ts.SymbolFlags.Alias) !== 0
        ? checker.getAliasedSymbol(referenceSymbol)
        : referenceSymbol;
    if (aliased?.name !== "ɵɵComponentDeclaration") {
      throw new Error(
        `angular: ɵcmp of "${input.identifier}" is not an ɵɵComponentDeclaration (missing declaration build; never guessed)`,
      );
    }
  }
  const typeArguments = (cmpReference?.typeArguments ?? []).map((node) =>
    checker.getTypeFromTypeNode(node),
  );

  let inputs: CmpInputs["fields"] | undefined;
  let outputs: CmpOutputs["fields"] | undefined;
  let selectors: string[] | undefined;
  const bodyWarnings: string[] = [];
  for (const argument of typeArguments) {
    if (inputs === undefined && isAliasRequiredShape(checker, argument)) {
      inputs = checker.getPropertiesOfType(argument).map((member) => {
        const shape = checker.getPropertiesOfType(checker.getTypeOfSymbol(member));
        const aliasSymbol = shape.find((item) => item.name === "alias");
        const requiredSymbol = shape.find((item) => item.name === "required");
        return {
          field: member.name,
          alias: aliasSymbol === undefined ? member.name : (literalStringValue(checker.getTypeOfSymbol(aliasSymbol)) ?? member.name),
          required: requiredSymbol === undefined ? false : (literalBooleanValue(checker.getTypeOfSymbol(requiredSymbol)) ?? false),
        };
      });
      continue;
    }
    if (outputs === undefined && isOutputsShape(checker, argument)) {
      outputs = checker.getPropertiesOfType(argument).map((member) => ({
        field: member.name,
        alias: literalStringValue(checker.getTypeOfSymbol(member)) ?? member.name,
      }));
      continue;
    }
    if (selectors === undefined && isSelectorsShape(checker, argument)) {
      const read = tupleStrings(checker, argument);
      if (read === undefined) {
        bodyWarnings.push("ng-content selectors not readable, slots omitted");
      } else {
        selectors = read;
      }
    }
  }
  if (inputs === undefined) inputs = [];
  if (outputs === undefined) outputs = [];

  const xprops = findPropsType(input);
  const { body, state } = freshBody(input, xprops?.propsTypeName ?? `${input.identifier}Props`);
  if (xprops !== undefined) populateGenericDefaults(state, xprops.propsType, xprops.propsTypeName);
  const discrepancies: string[] = [...bodyWarnings];

  // Props: public input aliases, member type from the class field.
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  const aliasSet = new Set(inputs.map((item) => item.alias));
  for (const item of inputs) {
    const field = fields.get(item.field);
    if (field === undefined) {
      state.unresolved.push({
        name: item.alias,
        kind: "other",
        sourceType: "unknown",
        reason: `ɵcmp input "${item.field}" has no class field`,
      });
      continue;
    }
    const memberType = checker.getTypeOfSymbol(field);
    const converted = convertType(state, memberType, item.alias);
    if (converted.outcome === "omitted") continue;
    const schema: JsonSchema = { ...converted.schema };
    const doc = symbolDoc(checker, field);
    if (doc !== undefined) schema["description"] = doc;
    properties[item.alias] = schema;
    if (item.required) required.push(item.alias);
  }

  // Events: outputs only; payload from the EventEmitter type argument.
  for (const item of outputs) {
    const field = fields.get(item.field);
    if (field === undefined) {
      discrepancies.push(`output "${item.field}" has no EventEmitter field`);
      continue;
    }
    const fieldType = checker.getTypeOfSymbol(field);
    // Aliases resolve through aliasSymbol; classes through their target.
    const targetName =
      fieldType.aliasSymbol?.name ??
      (fieldType as ts.TypeReference).target?.symbol?.name ??
      fieldType.symbol?.name;
    if (targetName !== "EventEmitter") {
      discrepancies.push(`output "${item.field}" field is not an EventEmitter`);
      continue;
    }
    // Payload from the emit method's first parameter (alias instantiations
    // report no usable type arguments). The real EventEmitter declares
    // emit(value?: T), so under strictNullChecks a void payload reads as
    // the union void | undefined: strip undefined parts first, and emit no
    // payload when nothing representable remains (spec 7.5).
    const emitMember = checker.getPropertiesOfType(fieldType).find((member) => member.name === "emit");
    const emitSignatures =
      emitMember === undefined ? [] : checker.getSignaturesOfType(checker.getTypeOfSymbol(emitMember), ts.SignatureKind.Call);
    const emitParameters = emitSignatures[0]?.getParameters() ?? [];
    const payloadType =
      emitParameters.length === 1 && emitParameters[0] !== undefined
        ? checker.getTypeOfSymbol(emitParameters[0])
        : undefined;
    const event: FrameworkBody["events"][number] = { name: item.alias };
    if (payloadType === undefined || isPayloadless(payloadType)) {
      body.events.push(event);
      continue;
    }
    const savedMode = state.payloadMode;
    const savedPath = state.path;
    state.payloadMode = true;
    state.path = item.alias;
    const converted = convertType(state, payloadType, "payload");
    state.payloadMode = savedMode;
    state.path = savedPath;
    if (converted.outcome === "schema") event.payload = converted.schema;
    else body.warnings.push(`${item.alias}: payload not convertible, omitted`);
    body.events.push(event);
  }

  // Slots: ng-content projection selectors.
  for (const selector of selectors ?? []) {
    if (selector === "*") {
      body.slots.push({ name: "default" });
      continue;
    }
    const match = /^\[slot='([^']+)'\]$/.exec(selector);
    if (match !== null && match[1] !== undefined) {
      body.slots.push({ name: match[1] });
      continue;
    }
    body.slots.push({ name: selector });
    body.warnings.push(`ng-content selector recorded verbatim: ${selector}`);
  }

  // XProps cross-check: every public alias corresponds to a props member or
  // a class field, and the reverse.
  if (xprops !== undefined) {
    const xpropsMembers = new Set(checker.getPropertiesOfType(xprops.propsType).map((member) => member.name));
    for (const member of xpropsMembers) {
      if (!aliasSet.has(member) && !fields.has(member)) {
        discrepancies.push(`XProps member "${member}" is neither a ɵcmp input alias nor a class field`);
      }
    }
    for (const item of inputs) {
      if (!xpropsMembers.has(item.alias) && !fields.has(item.alias)) {
        discrepancies.push(`ɵcmp input alias "${item.alias}" matches no XProps member`);
      }
    }
  } else {
    body.warnings.push("no exported XProps type to cross-check against ɵcmp");
  }
  for (const discrepancy of discrepancies) body.warnings.push(discrepancy);

  if (Object.keys(properties).length > 0) {
    const schema: JsonSchema = { type: "object", properties, additionalProperties: false };
    if (required.length > 0) schema["required"] = [...required].sort();
    body.props = schema;
  }
  absorbState(body, state);
  body.status = discrepancies.length > 0 ? "partial" : finalizeCompleteness(undefined, body);
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
