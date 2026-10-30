/**
 * CL-3a witness 14 — end-of-field anchor affinity (spec §8 CL-3 (14),
 * §5.2 R-ANCH-2: end-of-field `assoc < 0`).
 *
 * RED on 7a75a861: `./collab-selection.js` does not exist.
 */
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import {
  createRelativePositionFromTypeIndex,
  createAbsolutePositionFromRelativePosition,
  relativePositionToJSON,
  createRelativePositionFromJSON,
} from "yjs";
import {
  mintEndOfFieldAnchor,
  resolveAnchorToLinear,
  insertThroughAnchor,
} from "./collab-selection.js";
import { seedFieldFromDocument } from "./collab-codec.js";

function seedField(): { doc: Y.Doc; text: Y.Text } {
  const doc = new Y.Doc();
  const text = doc.getText("field:body");
  const meta = doc.getMap("fieldmeta:body");
  seedFieldFromDocument(text, meta, "body", {
    format: "focus.markdown.p0@1",
    blocks: [{ paragraphId: "paragraph:1", kind: "paragraph", text: "abc" }],
  });
  return { doc, text };
}

describe("CL-3-14 end-of-field anchor affinity", () => {
  it("an end-of-field anchor stays before concurrently appended text", () => {
    const { text } = seedField();
    const endIndex = text.length;
    // Anchor minted at the field end with assoc < 0 against the then-last item.
    const anchor = mintEndOfFieldAnchor(text, endIndex);
    const parsed = createRelativePositionFromJSON(JSON.parse(anchor) as never);
    expect(parsed.assoc < 0).toBe(true);

    // Concurrent append at the field end (another replica's insert).
    text.insert(text.length, "ZZ");

    // The anchor still resolves immediately after the previously last item,
    // before the appended text.
    const resolved = resolveAnchorToLinear(text, anchor);
    expect(resolved).toBe(endIndex);

    // An insert through that anchor lands before the appended text.
    insertThroughAnchor(text, anchor, "Q");
    expect(text.toString()).toBe("abcQZZ");

    // The JSON wire carries no numeric offset.
    const wire = JSON.parse(anchor) as Record<string, unknown>;
    expect("index" in wire).toBe(false);
    expect("offset" in wire).toBe(false);
  });

  it("assoc < 0 binds to the previously last item (Yjs semantics)", () => {
    const { doc, text } = seedField();
    const before = text.length;
    const rpos = createRelativePositionFromTypeIndex(text, before, -1);
    const json = JSON.stringify(relativePositionToJSON(rpos));
    text.insert(text.length, "TAIL");
    const resolved = createAbsolutePositionFromRelativePosition(
      createRelativePositionFromJSON(JSON.parse(json) as never),
      doc,
    );
    // With assoc < 0 the position binds to the previously last item: it
    // resolves before the appended tail, not at the moving end.
    expect(resolved?.index).toBe(before);
  });
});
