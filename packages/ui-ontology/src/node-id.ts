import { createHash } from "node:crypto";

export const UI_ID_PREFIX = Object.freeze({
  "Component": "uc:",
  "ComponentPort": "uport:",
  "Framework": "ufw:",
  "Contract": "uct:",
  "Prop": "uprop:",
  "Slot": "uslot:",
  "Event": "uevt:",
  "TokenSet": "utset:",
  "Token": "utok:",
  "Theme": "uthm:",
  "Icon": "uico:",
  "ViewLayout": "ulay:",
  "ComposedView": "uview:",
  "Package": "upkg:",
  "PackageRelease": "urel:",
  "DocPage": "udoc:",
  "RenderCatalog": "ucat:",
  "UiResource": "uui:",
  "McpTool": "utool:",
  "PresentationForm": "uform:"
} as const);

export type UiNodeType = keyof typeof UI_ID_PREFIX;

/** Delimiter-safe tuple encoding matching JCS for Unicode scalar strings.
 * The truncated SHA-256 follows engram's convention; hash collisions remain
 * theoretically possible. Locators are attributes, never identity seeds.
 */
export function uiNodeId(repoKey: string, nodeType: UiNodeType, seedTuple: readonly string[]): string {
  if (!Object.hasOwn(UI_ID_PREFIX, nodeType)) throw new TypeError("Unknown ui node type");
  const tuple = ["ui@1", repoKey, nodeType, ...seedTuple];
  for (const part of tuple) {
    if (typeof part !== "string" || !part.isWellFormed()) {
      throw new TypeError("Node identity parts must be well-formed Unicode strings");
    }
  }
  const hex = createHash("sha256").update(JSON.stringify(tuple), "utf8").digest("hex").slice(0, 32);
  return UI_ID_PREFIX[nodeType] + hex;
}
