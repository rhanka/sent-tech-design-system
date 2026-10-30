// Full-profile paste policy for the "./editor" entry (CL-2F §2.8 P matrix,
// R-FULL-URL-1).
//
// HTML payloads enter through the full-schema DOMParser after sanitizing:
// scripts, event handlers, active content and unsafe hrefs refuse the whole
// payload; benign underline tags/styles map to mark data; images degrade to
// their alt text. Tables, task lists and other non-schema structures refuse
// whole (never silently flattened). Plain/Markdown payloads parse through
// the full Markdown bridge; unsafe hrefs or preserved blocks refuse whole.

import { DOMParser, Fragment, Slice } from "@tiptap/pm/model";
import type { JSONContent } from "@tiptap/core";
import type { Schema } from "@tiptap/pm/model";
import { isAllowedHref } from "./collaboration.js";
import { PARAGRAPH_ID_ATTRIBUTE } from "./identity.js";
import {
  parseFullMarkdown,
  serializeFullDocument,
} from "./editor-full-markdown.js";
import { fullDocumentToProseMirror } from "./editor-full-document.js";

export type FullPastePlan =
  | { outcome: "refuse"; rejectedKinds: string[] }
  | { outcome: "insert"; blocks: JSONContent[]; imageReported: boolean };

const FULL_REFUSAL_SELECTORS: { selector: string; kind: string }[] = [
  { selector: "table", kind: "table" },
  { selector: "[data-type='taskItem'], li[data-checked]", kind: "list" },
  { selector: "figure", kind: "image" },
  { selector: "video,audio,canvas,picture,iframe,object,embed,form,template", kind: "rawHtml" },
];

const FULL_INERT_SELECTORS = [
  "script",
  "style",
  "noscript",
  "link",
  "meta",
  "title",
].join(",");

function reportKind(into: string[], kind: string): void {
  if (!into.includes(kind)) into.push(kind);
}

/** Sanitize pasted HTML for the full schema: strip identities, inert
    elements, event handlers and unsafe hrefs; degrade images to alt text. */
export function sanitizeFullPastedHtml(html: string): {
  html: string;
  imageSeen: boolean;
  refusedKinds: string[];
} {
  const refusedKinds: string[] = [];
  const template = document.createElement("template");
  template.innerHTML = html;
  const root = template.content;

  for (const inert of root.querySelectorAll(FULL_INERT_SELECTORS)) {
    const tag = inert.tagName.toLowerCase();
    if (tag === "script" || tag === "style") {
      reportKind(refusedKinds, "rawHtml");
    }
    inert.remove();
  }
  if (refusedKinds.length > 0) {
    return { html: "", imageSeen: false, refusedKinds };
  }
  for (const { selector, kind } of FULL_REFUSAL_SELECTORS) {
    if (root.querySelector(selector) !== null) {
      reportKind(refusedKinds, kind);
    }
  }
  if (refusedKinds.length > 0) {
    return { html: "", imageSeen: false, refusedKinds };
  }

  let imageSeen = false;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  const elements: Element[] = [];
  while (walker.nextNode() !== null) {
    elements.push(walker.currentNode as Element);
  }
  for (const element of elements) {
    // NOTE: elements live in a disconnected template fragment, where
    // `isConnected` is always false. The static list plus the inert-element
    // removal earlier keep this loop safe without a liveness guard.
    // Strip event handlers and foreign identities on every element.
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on")) {
        reportKind(refusedKinds, "rawHtml");
      } else if (
        name === "data-paragraph-id" ||
        name === "data-preserved-block" ||
        name === "data-list-run-id" ||
        name === "id"
      ) {
        element.removeAttribute(attribute.name);
      } else if (
        (name === "href" || name === "src" || name === "xlink:href") &&
        !isAllowedHref(attribute.value)
      ) {
        reportKind(refusedKinds, "link");
      } else if (name === "class" || name === "style") {
        const tag = element.tagName.toLowerCase();
        const keepUnderline =
          tag === "u" ||
          (name === "style" && /text-decoration\s*:[^;]*underline/i.test(attribute.value));
        if (!keepUnderline) element.removeAttribute(attribute.name);
      }
    }
    const tag = element.tagName.toLowerCase();
    if (tag === "img") {
      imageSeen = true;
      const alt = element.getAttribute("alt") ?? "";
      element.replaceWith(document.createTextNode(alt));
    }
  }
  if (refusedKinds.length > 0) {
    return { html: "", imageSeen, refusedKinds };
  }
  const container = document.createElement("div");
  container.appendChild(root.cloneNode(true));
  return { html: container.innerHTML, imageSeen, refusedKinds: [] };
}

/** Plan an HTML paste against the full schema. */
export function planFullHtmlPaste(
  schema: Schema,
  html: string,
  allocateId: () => string,
): FullPastePlan {
  const sanitized = sanitizeFullPastedHtml(html);
  if (sanitized.refusedKinds.length > 0) {
    return { outcome: "refuse", rejectedKinds: sanitized.refusedKinds };
  }
  let sliceHtml = sanitized.html;
  if (sliceHtml === "") return { outcome: "insert", blocks: [], imageReported: sanitized.imageSeen };
  // Underline spans that only carry presentation classes become <u> so the
  // underline mark survives class stripping (F14).
  const template = document.createElement("template");
  template.innerHTML = sliceHtml;
  const root = template.content;
  for (const span of root.querySelectorAll("span")) {
    const style = span.getAttribute("style") ?? "";
    if (/text-decoration\s*:[^;]*underline/i.test(style)) {
      const replacement = document.createElement("u");
      replacement.textContent = span.textContent;
      span.replaceWith(replacement);
    }
  }
  const container = document.createElement("div");
  container.appendChild(root.cloneNode(true));
  sliceHtml = container.innerHTML;
  const parser = DOMParser.fromSchema(schema);
  const templateDoc = document.createElement("template");
  templateDoc.innerHTML = sliceHtml;
  const parsed = parser.parseSlice(templateDoc.content);
  const blocks: JSONContent[] = [];
  parsed.content.forEach((node) => {
    if (node.type.name === "text") {
      if ((node.textContent ?? "") === "") return;
      blocks.push({
        type: "paragraph",
        attrs: { [PARAGRAPH_ID_ATTRIBUTE]: allocateId() },
        content: [{ type: "text", text: node.textContent }],
      });
      return;
    }
    const json = node.toJSON() as JSONContent;
    stripFullIdentityAttributes(json, allocateId);
    blocks.push(json);
  });
  return { outcome: "insert", blocks, imageReported: sanitized.imageSeen };
}

/** Strip pasted identity attributes (never trusted) and renew them. */
export function stripFullIdentityAttributes(node: JSONContent, allocateId: () => string): void {
  const attrs = (node.attrs ?? {}) as Record<string, unknown>;
  if (PARAGRAPH_ID_ATTRIBUTE in attrs) {
    attrs[PARAGRAPH_ID_ATTRIBUTE] = allocateId();
    node.attrs = attrs;
  }
  if ("listRunId" in attrs) {
    attrs["listRunId"] = "";
    node.attrs = attrs;
  }
  for (const child of (node.content ?? []) as JSONContent[]) {
    stripFullIdentityAttributes(child, allocateId);
  }
}

/** Plan a plain-text/Markdown paste through the full bridge. */
export function planFullTextPaste(text: string, allocateId: () => string): FullPastePlan {
  if (text === "") return { outcome: "insert", blocks: [], imageReported: false };
  const parsed = parseFullMarkdown(text, allocateId);
  if (parsed.document === null) {
    return { outcome: "refuse", rejectedKinds: parsed.refusedKinds };
  }
  const preserved = parsed.document.blocks.filter((block) => block.kind === "preserved");
  if (preserved.length > 0) {
    return {
      outcome: "refuse",
      rejectedKinds: [...new Set(preserved.map((block) => block.preservedKind ?? "preserved"))],
    };
  }
  const json = fullDocumentToProseMirror(parsed.document, allocateId);
  return {
    outcome: "insert",
    blocks: [...((json.content ?? []) as JSONContent[])],
    imageReported: false,
  };
}

/** Build a ProseMirror slice from planned full blocks. */
export function sliceForFullBlocks(
  schema: Schema,
  blocks: readonly JSONContent[],
): Slice {
  const nodes = blocks.map((block) => schema.nodeFromJSON(block));
  return new Slice(Fragment.from(nodes), 0, 0);
}
