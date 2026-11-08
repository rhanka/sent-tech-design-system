// BPMN 2.0 counting for the fixture selection (§2.8): namespace-aware start-tag
// counts over the raw XML text, zero dependency. Comments, CDATA and processing
// instructions are skipped; any DTD is refused.
export interface BpmnCounts {
  readonly pools: number; // participant with processRef inside one collaboration (max per collaboration)
  readonly messageFlows: number;
  readonly subProcesses: number; // subProcess | transaction | adHocSubProcess
  readonly diagrams: number; // BPMNDiagram in the DI namespace
  readonly flowNodes: number;
}

export const BPMN_MODEL_NS = "http://www.omg.org/spec/BPMN/20100524/MODEL";
export const BPMN_DI_NS = "http://www.omg.org/spec/BPMN/20100524/DI";

type CountResult = { readonly ok: true; readonly counts: BpmnCounts } | { readonly ok: false; readonly code: "bpmn-xml-unreadable" | "bpmn-dtd-refused" };

interface ScopeEntry {
  readonly ns: string | null; // resolved namespace of the element
  readonly local: string;
  poolCount: number; // participants with processRef inside this collaboration
}

const SUB_PROCESS_LOCALS = new Set(["subProcess", "transaction", "adHocSubProcess"]);
const FLOW_NODE_EXACT = new Set(["task", "subProcess", "transaction", "adHocSubProcess", "callActivity"]);

function isFlowNode(local: string): boolean {
  if (FLOW_NODE_EXACT.has(local)) return true;
  if (local.endsWith("Task")) return true;
  if (local.endsWith("Event") && !local.endsWith("EventDefinition")) return true;
  if (local.endsWith("Gateway")) return true;
  return false;
}

/** Parse one tag starting at xml[i] === "<". Returns the tag end index (after ">") and the parsed content. */
function parseTag(xml: string, start: number): { readonly end: number; readonly name: string; readonly attrs: readonly (readonly [string, string])[]; readonly selfClosing: boolean; readonly isEnd: boolean } | null {
  let i = start + 1;
  let isEnd = false;
  if (xml[i] === "/") {
    isEnd = true;
    i += 1;
  }
  const nameStart = i;
  while (i < xml.length && !/[\s/>]/.test(xml[i] as string)) i += 1;
  const name = xml.slice(nameStart, i);
  if (name.length === 0) return null;
  const attrs: [string, string][] = [];
  let selfClosing = false;
  while (i < xml.length) {
    const ch = xml[i] as string;
    if (ch === ">") {
      i += 1;
      break;
    }
    if (ch === "/" && xml[i + 1] === ">") {
      selfClosing = true;
      i += 2;
      break;
    }
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    // attribute name
    const attrStart = i;
    while (i < xml.length && !/[\s=/>]/.test(xml[i] as string)) i += 1;
    const attrName = xml.slice(attrStart, i);
    while (i < xml.length && /\s/.test(xml[i] as string)) i += 1;
    if (xml[i] !== "=") {
      if (attrName.length > 0) attrs.push([attrName, ""]);
      continue;
    }
    i += 1;
    while (i < xml.length && /\s/.test(xml[i] as string)) i += 1;
    const quote = xml[i];
    if (quote !== '"' && quote !== "'") return null;
    i += 1;
    const valueStart = i;
    while (i < xml.length && xml[i] !== quote) i += 1;
    if (i >= xml.length) return null;
    attrs.push([attrName, xml.slice(valueStart, i)]);
    i += 1;
  }
  return { end: i, name, attrs, selfClosing, isEnd };
}

function splitName(name: string): { readonly prefix: string | null; readonly local: string } {
  const idx = name.indexOf(":");
  if (idx === -1) return { prefix: null, local: name };
  return { prefix: name.slice(0, idx), local: name.slice(idx + 1) };
}

/**
 * Count the BPMN elements of `xml`. Namespace prefixes resolve from the
 * in-scope `xmlns` declarations; the default namespace applies to unprefixed
 * names. DTDs are refused, malformed XML gives `bpmn-xml-unreadable`.
 */
export function countBpmn(xml: string): CountResult {
  // xmlns scopes: stack of maps prefix -> namespace URI ("" = default).
  const scopes: (Map<string, string>)[] = [new Map()];
  const stack: ScopeEntry[] = [];
  let poolsMax = 0;
  let messageFlows = 0;
  let subProcesses = 0;
  let diagrams = 0;
  let flowNodes = 0;

  const resolveNs = (prefix: string | null): string | null => {
    const key = prefix ?? "";
    for (let s = scopes.length - 1; s >= 0; s -= 1) {
      const map = scopes[s] as Map<string, string>;
      if (map.has(key)) return map.get(key) ?? null;
    }
    return null;
  };

  let i = 0;
  while (i < xml.length) {
    const lt = xml.indexOf("<", i);
    if (lt === -1) break;
    if (xml.startsWith("<!--", lt)) {
      const end = xml.indexOf("-->", lt + 4);
      if (end === -1) return { ok: false, code: "bpmn-xml-unreadable" };
      i = end + 3;
      continue;
    }
    if (xml.startsWith("<![CDATA[", lt)) {
      const end = xml.indexOf("]]>", lt + 9);
      if (end === -1) return { ok: false, code: "bpmn-xml-unreadable" };
      i = end + 3;
      continue;
    }
    if (xml.startsWith("<?", lt)) {
      const end = xml.indexOf("?>", lt + 2);
      if (end === -1) return { ok: false, code: "bpmn-xml-unreadable" };
      i = end + 2;
      continue;
    }
    if (xml.startsWith("<!", lt)) {
      // Any markup declaration is DTD territory: refused.
      return { ok: false, code: "bpmn-dtd-refused" };
    }
    const tag = parseTag(xml, lt);
    if (tag === null) return { ok: false, code: "bpmn-xml-unreadable" };
    i = tag.end;
    if (tag.isEnd) {
      // strict: the end tag must close the innermost open element
      const { local } = splitName(tag.name);
      const top = stack[stack.length - 1];
      if (top === undefined || top.local !== local) return { ok: false, code: "bpmn-xml-unreadable" };
      stack.pop();
      scopes.pop();
      continue;
    }
    // collect xmlns declarations of this element into a new scope
    const scope = new Map<string, string>();
    for (const [attrName, value] of tag.attrs) {
      if (attrName === "xmlns") scope.set("", value);
      else if (attrName.startsWith("xmlns:")) scope.set(attrName.slice(6), value);
    }
    scopes.push(scope);
    const { prefix, local } = splitName(tag.name);
    const ns = resolveNs(prefix);
    const entry: ScopeEntry = { ns, local, poolCount: 0 };
    stack.push(entry);

    if (ns === BPMN_MODEL_NS) {
      if (local === "collaboration") {
        // pool counting happens on participants below
      } else if (local === "participant") {
        const hasProcessRef = tag.attrs.some(([a]) => splitName(a).local === "processRef");
        if (hasProcessRef) {
          // nearest collaboration ancestor
          for (let s = stack.length - 2; s >= 0; s -= 1) {
            const anc = stack[s]!;
            if (anc.ns === BPMN_MODEL_NS && anc.local === "collaboration") {
              anc.poolCount += 1;
              poolsMax = Math.max(poolsMax, anc.poolCount);
              break;
            }
          }
        }
      } else if (local === "messageFlow") {
        messageFlows += 1;
      } else if (SUB_PROCESS_LOCALS.has(local)) {
        subProcesses += 1;
        flowNodes += 1;
      } else if (isFlowNode(local)) {
        flowNodes += 1;
      }
    } else if (ns === BPMN_DI_NS && local === "BPMNDiagram") {
      diagrams += 1;
    }

    if (tag.selfClosing) {
      stack.pop();
      scopes.pop();
    }
  }
  if (stack.length !== 0) return { ok: false, code: "bpmn-xml-unreadable" };
  return {
    ok: true,
    counts: { pools: poolsMax, messageFlows, subProcesses, diagrams, flowNodes },
  };
}
