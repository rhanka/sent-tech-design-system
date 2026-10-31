/**
 * The minimal F1→XML adapter of the `<st-bpmn-canvas>` element (§6.2, §10.2,
 * §14 L2): a moddle-JSON tree (`bpmn:Definitions`) becomes BPMN 2.0 XML at the
 * edge of the element — the owner rule « un seul modèle JSON moddle de bout
 * en bout, XML seulement en sortie » (§10.2).
 *
 * The adapter is MINIMAL and is REPLACED by the real F1 `hydrate`/`project`
 * once `@sentropic/bpmn-canvas` publishes it (§3.3 F1, U-7). It covers the
 * BPMN + DI subset bpmn-moddle's meta-model knows (MIT, devDependency, no
 * network) and refuses everything else with the F1 codes measured on the
 * unpushed workbench (`BC-WB:src/io/muddle-json.ts`): `unknown-type` on an
 * unregistered `$type`, `unresolved-reference` on a reference that names no
 * element of the document, `missing-$type` on a tree node without `$type`,
 * and `unsupported-extension` on a non-data value (§4.1: functions never
 * ride in an envelope).
 *
 * Pure orchestration over bpmn-moddle: one fresh moddle instance per call
 * (no global lookup state — the same tree twice yields the same XML), and
 * the JSON pointers of every refusal locate the offending node exactly.
 */

import { BpmnModdle, type ModdleElement } from "bpmn-moddle";

/** The refusal codes of the minimal adapter (F1's own vocabulary). */
export type F1RefusalCode = "unknown-type" | "unresolved-reference" | "missing-$type" | "unsupported-extension";

/** A non-blocking fact the adapter surfaces (kept empty by the minimal set). */
export interface F1Warning {
  readonly code: string;
  readonly message: string;
}

export type F1ToXmlResult =
  | { readonly ok: true; readonly xml: string; readonly warnings: readonly F1Warning[] }
  | { readonly ok: false; readonly code: F1RefusalCode; readonly message: string; readonly pointer?: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Type guard: one F1 result is a refusal when `ok` is false. */
function isRefusal(value: unknown): value is F1ToXmlResult {
  return isPlainObject(value) && value.ok === false;
}

function refusal(code: F1RefusalCode, message: string, pointer?: string): F1ToXmlResult {
  return pointer === undefined
    ? { ok: false, code, message }
    : { ok: false, code, message, pointer };
}

function appendToken(pointer: string, token: string | number): string {
  return `${pointer}/${String(token).replace(/~/g, "~0").replace(/\//g, "~1")}`;
}

/** §4.1: the tree is data — a function anywhere is an unsupported extension. */
function assertDataOnly(value: unknown, pointer: string): F1ToXmlResult | undefined {
  if (typeof value === "function") {
    return refusal("unsupported-extension", "the F1 tree carries a non-data value (§4.1)", pointer);
  }
  return undefined;
}

/**
 * One JSON walk that (1) refuses non-data and `$type`-less objects with the
 * exact pointer, (2) creates every node through the meta-model (unknown
 * `$type` refused), and (3) indexes every element by id for the reference
 * pass. Returns the created root and the index, or a refusal.
 */
function createTree(
  moddle: BpmnModdle,
  value: unknown,
  pointer: string,
  index: Map<string, ModdleElement>,
): { root: ModdleElement } | { refused: F1ToXmlResult } {
  const dataRefusal = assertDataOnly(value, pointer);
  if (dataRefusal !== undefined) return { refused: dataRefusal };
  if (!isPlainObject(value)) {
    return { refused: refusal("missing-$type", `the F1 tree node at ${pointer || "/"} is not an object`, pointer) };
  }
  const type = value.$type;
  if (typeof type !== "string" || type.length === 0) {
    return { refused: refusal("missing-$type", `the F1 tree node at ${pointer || "/"} has no $type`, appendToken(pointer, "$type")) };
  }
  const attrs: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === "$type") continue;
    const childPointer = appendToken(pointer, key);
    const childRefusal = assertDataOnly(child, childPointer);
    if (childRefusal !== undefined) return { refused: childRefusal };
    if (Array.isArray(child)) {
      const items: unknown[] = [];
      for (let itemIndex = 0; itemIndex < child.length; itemIndex += 1) {
        const itemPointer = appendToken(childPointer, itemIndex);
        if (isPlainObject(child[itemIndex])) {
          const nested = createTree(moddle, child[itemIndex], itemPointer, index);
          if ("refused" in nested) return nested;
          items.push(nested.root);
        } else {
          const itemRefusal = assertDataOnly(child[itemIndex], itemPointer);
          if (itemRefusal !== undefined) return { refused: itemRefusal };
          items.push(child[itemIndex]);
        }
      }
      attrs[key] = items;
    } else if (isPlainObject(child)) {
      const nested = createTree(moddle, child, childPointer, index);
      if ("refused" in nested) return nested;
      attrs[key] = nested.root;
    } else {
      attrs[key] = child;
    }
  }
  let element: ModdleElement;
  try {
    element = moddle.create(type, attrs);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { refused: refusal("unknown-type", message, appendToken(pointer, "$type")) };
  }
  if (typeof value.id === "string") index.set(value.id, element);
  return { root: element };
}

/**
 * The reference pass: every meta-model `isReference` property that still
 * holds a string must name an element of THIS document — moddle serializes
 * resolved elements back to their ids, so an unresolved name is refused,
 * never silently dropped.
 */
function resolveReferences(
  source: Record<string, unknown>,
  element: ModdleElement,
  index: Map<string, ModdleElement>,
  pointer: string,
): F1ToXmlResult | undefined {
  for (const property of element.$descriptor.properties) {
    if (!property.isReference) continue;
    const propertyPointer = appendToken(pointer, property.name);
    const value = element[property.name];
    /** Resolve one string to its element, or refuse with the pointer. */
    const resolveOne = (item: unknown, itemPointer: string): ModdleElement | unknown | F1ToXmlResult => {
      if (typeof item !== "string") return item;
      const target = index.get(item);
      if (target === undefined) {
        return refusal(
          "unresolved-reference",
          `the reference "${item}" names no element of the document`,
          itemPointer,
        );
      }
      return target;
    };
    if (property.isMany) {
      if (Array.isArray(value)) {
        const resolved: unknown[] = [];
        for (let itemIndex = 0; itemIndex < value.length; itemIndex += 1) {
          const item = resolveOne(value[itemIndex], appendToken(propertyPointer, itemIndex));
          if (isRefusal(item)) return item;
          resolved.push(item);
        }
        element[property.name] = resolved;
      }
    } else if (value !== undefined) {
      const item = resolveOne(value, propertyPointer);
      if (isRefusal(item)) return item;
      element[property.name] = item;
    }
  }
  for (const [key, child] of Object.entries(source)) {
    if (key === "$type") continue;
    const childElement = element[key];
    const childValue = child;
    const childPointer = appendToken(pointer, key);
    if (Array.isArray(childValue) && Array.isArray(childElement)) {
      for (let itemIndex = 0; itemIndex < childValue.length; itemIndex += 1) {
        if (isPlainObject(childValue[itemIndex]) && childValue[itemIndex].$type !== undefined) {
          const nested = resolveReferences(
            childValue[itemIndex],
            childElement[itemIndex] as ModdleElement,
            index,
            appendToken(childPointer, itemIndex),
          );
          if (nested !== undefined) return nested;
        }
      }
    } else if (isPlainObject(childValue) && childValue.$type !== undefined) {
      const nested = resolveReferences(childValue, childElement as ModdleElement, index, childPointer);
      if (nested !== undefined) return nested;
    }
  }
  return undefined;
}

/**
 * The minimal semantic hydrate of one F1 tree: the meta-model walk with the
 * exact refusal codes and pointers, WITHOUT the XML serialization — the
 * synchronous validation the `bpmn-canvas` semantic port is built from
 * (`createBpmnCanvasPort`, `src/ports`), per §4.3 item 2: the owning
 * runtime validates the payload.
 */
export function hydrateF1(input: unknown): F1ToXmlResult {
  if (!isPlainObject(input)) {
    return refusal("missing-$type", "the F1 document is not a JSON object");
  }
  const moddle = new BpmnModdle();
  const index = new Map<string, ModdleElement>();
  const created = createTree(moddle, input, "", index);
  if ("refused" in created) return created.refused;
  const referenceRefusal = resolveReferences(input, created.root, index, "");
  if (referenceRefusal !== undefined) return referenceRefusal;
  return { ok: true, xml: "", warnings: [] };
}

/**
 * Turn one F1 moddle-JSON tree into BPMN 2.0 XML. Never throws: every
 * refusal comes back as `{ ok: false, code, message, pointer? }`.
 */
export async function f1ToXml(input: unknown): Promise<F1ToXmlResult> {
  if (!isPlainObject(input)) {
    return refusal("missing-$type", "the F1 document is not a JSON object");
  }
  const moddle = new BpmnModdle();
  const index = new Map<string, ModdleElement>();
  const created = createTree(moddle, input, "", index);
  if ("refused" in created) return created.refused;
  const referenceRefusal = resolveReferences(input, created.root, index, "");
  if (referenceRefusal !== undefined) return referenceRefusal;
  try {
    const { xml } = await moddle.toXML(created.root, { format: true });
    return { ok: true, xml, warnings: [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return refusal("unsupported-extension", `the F1 tree cannot be serialized: ${message}`);
  }
}
