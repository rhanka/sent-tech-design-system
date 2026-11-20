// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import {
  createAnchor,
  createAnchorFromElement,
  createAnchorFromRegion,
  createAnchorFromSelection,
  createFixtureCommentsAdapter,
  decodeAnchor,
  encodeAnchor,
  groupCommentsIntoThreads,
  resolveAnchor,
  type TextAnchorPayload,
} from "../src/index.js";
import { RENDER_V1_HTML, RENDER_V2_HTML } from "./fixtures/anchors.js";

function mountRoot(html: string): Element {
  document.body.innerHTML = html;
  const root = document.querySelector("[data-review-root]");
  if (!root) throw new Error("Missing [data-review-root] in fixture");
  return root;
}

function createRangeForSubstring(root: Element, needle: string, occurrence = 0): Range {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const segments: Array<{ node: Text; start: number; end: number }> = [];
  let full = "";
  let current = walker.nextNode();
  while (current) {
    const textNode = current as Text;
    const len = textNode.data.length;
    segments.push({ node: textNode, start: full.length, end: full.length + len });
    full += textNode.data;
    current = walker.nextNode();
  }

  let searchFrom = 0;
  let foundAt = -1;
  for (let i = 0; i <= occurrence; i++) {
    foundAt = full.indexOf(needle, searchFrom);
    if (foundAt === -1) throw new Error(`Substring "${needle}" (occ ${occurrence}) not found`);
    searchFrom = foundAt + 1;
  }

  const endAt = foundAt + needle.length;
  const range = document.createRange();
  let startSet = false;
  for (const seg of segments) {
    if (!startSet && foundAt >= seg.start && foundAt < seg.end) {
      range.setStart(seg.node, foundAt - seg.start);
      startSet = true;
    }
    if (endAt > seg.start && endAt <= seg.end) {
      range.setEnd(seg.node, endAt - seg.start);
      break;
    }
  }
  return range;
}

describe("DS-2 DOM anchor capture (createAnchorFromSelection / createAnchorFromElement / createAnchor)", () => {
  it("should capture a text anchor across inline markup with quote, prefix/suffix, pos, sel, aid, and v", () => {
    const root = mountRoot(RENDER_V1_HTML);
    const range = createRangeForSubstring(root, "revenue grew 18% across");
    const anchor = createAnchorFromSelection(root, range, "v1");

    expect(anchor).not.toBeNull();
    expect(anchor!.t).toBe("text");
    expect(anchor!.q.exact).toBe("revenue grew 18% across");
    expect(anchor!.q.prefix).toContain("Executive summary: ");
    expect(anchor!.q.suffix).toContain(" core lines.");
    expect(anchor!.pos).toBeDefined();
    expect(anchor!.pos!.end - anchor!.pos!.start).toBe("revenue grew 18% across".length);
    expect(anchor!.aid).toBe("sec-exec");
    expect(anchor!.sel).toBe("section:nth-of-type(1) > p:nth-of-type(1)");
    expect(anchor!.v).toBe("v1");

    // Unified createAnchor dispatcher matches createAnchorFromSelection
    expect(createAnchor(root, range, "v1")).toEqual(anchor);

    // Real DOM Selection also works verbatim
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      expect(createAnchorFromSelection(root, selection, "v1")).toEqual(anchor);
      selection.removeAllRanges();
    }

    // Round-trip through sectionKey
    const encoded = encodeAnchor(anchor!);
    expect(decodeAnchor(encoded)).toEqual(anchor);
  });

  it("should return null for collapsed or out-of-root selections", () => {
    const root = mountRoot(RENDER_V1_HTML);
    const range = document.createRange();
    const h1 = root.querySelector("h1")!;
    range.setStart(h1.firstChild!, 2);
    range.setEnd(h1.firstChild!, 2);
    expect(createAnchorFromSelection(root, range, "v1")).toBeNull();

    const outside = document.createElement("p");
    outside.textContent = "Outside root";
    document.body.appendChild(outside);
    const outsideRange = document.createRange();
    outsideRange.selectNodeContents(outside);
    expect(createAnchorFromSelection(root, outsideRange, "v1")).toBeNull();
  });

  it("should capture element and region anchors", () => {
    const root = mountRoot(RENDER_V1_HTML);
    const figure = root.querySelector("figure")!;
    const elAnchor = createAnchorFromElement(root, figure, "v1");

    expect(elAnchor).toEqual({
      t: "element",
      sel: "section:nth-of-type(2) > figure:nth-of-type(1)",
      aid: "fig-margin",
      v: "v1",
    });
    expect(createAnchor(root, figure, "v1")).toEqual(elAnchor);

    const blockquote = root.querySelector("blockquote")!;
    const noAidAnchor = createAnchorFromElement(root, blockquote, "v1");
    expect(noAidAnchor).toEqual({
      t: "element",
      sel: "section:nth-of-type(2) > blockquote:nth-of-type(1)",
      v: "v1",
    });

    const region = createAnchorFromRegion({ x: 0.1, y: 0.2, width: 0.3, height: 0.4 }, "v1");
    expect(region).toEqual({
      t: "region",
      rect: { x: 0.1, y: 0.2, width: 0.3, height: 0.4 },
      v: "v1",
    });
  });
});

describe("DS-2 resolveAnchor (re-attach after re-render, priority ladder, orphan)", () => {
  it("should re-attach anchors after re-render via aid, text-quote, fuzzy-quote, and orphan unresolvable ones", () => {
    const rootV1 = mountRoot(RENDER_V1_HTML);

    // Capture 5 anchors on v1
    const aidTextAnchor = createAnchorFromSelection(
      rootV1,
      createRangeForSubstring(rootV1, "revenue grew 18%"),
      "v1",
    )!;
    const duplicateQuoteAnchor = createAnchorFromSelection(
      rootV1,
      createRangeForSubstring(rootV1, "Status: Approved", 1),
      "v1",
    )!;
    const fuzzyTextAnchor = createAnchorFromSelection(
      rootV1,
      createRangeForSubstring(rootV1, "Key   FINDING"),
      "v1",
    )!;
    const deletedTextAnchor = createAnchorFromSelection(
      rootV1,
      createRangeForSubstring(rootV1, "Obsolete paragraph"),
      "v1",
    )!;
    const aidElementAnchor = createAnchorFromElement(
      rootV1,
      rootV1.querySelector("figure")!,
      "v1",
    )!;
    const deletedElementAnchor = createAnchorFromElement(
      rootV1,
      rootV1.querySelector("blockquote")!,
      "v1",
    )!;

    // Re-render DOM to v2!
    const rootV2 = mountRoot(RENDER_V2_HTML);
    const htmlBefore = rootV2.innerHTML;

    // 1. aid-backed text anchor moved to bottom -> re-attaches via aid with exact Range
    const rAidText = resolveAnchor(rootV2, aidTextAnchor, { artifactVersion: "v2" });
    expect(rAidText.status).toBe("resolved");
    if (rAidText.status === "resolved") {
      expect(rAidText.strategy).toBe("aid");
      expect(rAidText.range?.toString()).toBe("revenue grew 18%");
      expect(rAidText.versionChanged).toBe(true);
    }

    // 2. Duplicate quote disambiguated by prefix/suffix after DOM shift -> text-quote
    const rDup = resolveAnchor(rootV2, duplicateQuoteAnchor, { artifactVersion: "v2" });
    expect(rDup.status).toBe("resolved");
    if (rDup.status === "resolved") {
      expect(rDup.strategy).toBe("text-quote");
      expect(rDup.range?.toString()).toBe("Status: Approved");
      expect(rDup.element.textContent).toContain("internal circulation");
    }

    // 3. Whitespace/case-changed quote after DOM shift -> fuzzy-quote
    const rFuzzy = resolveAnchor(rootV2, fuzzyTextAnchor, { artifactVersion: "v2" });
    expect(rFuzzy.status).toBe("resolved");
    if (rFuzzy.status === "resolved") {
      expect(rFuzzy.strategy).toBe("fuzzy-quote");
      expect(rFuzzy.range?.toString()).toBe("key finding");
    }

    // 4. Deleted paragraph's text anchor MUST orphan (even though another <p> shifted into its slot!)
    const rDeletedText = resolveAnchor(rootV2, deletedTextAnchor, { artifactVersion: "v2" });
    expect(rDeletedText.status).toBe("orphan");

    // 5. aid-backed element moved inside a new wrapper -> re-attaches via aid
    const rAidEl = resolveAnchor(rootV2, aidElementAnchor, { artifactVersion: "v2" });
    expect(rAidEl.status).toBe("resolved");
    if (rAidEl.status === "resolved") {
      expect(rAidEl.strategy).toBe("aid");
      expect(rAidEl.element.tagName.toLowerCase()).toBe("figure");
    }

    // 6. Removed element without aid -> orphan
    const rDeletedEl = resolveAnchor(rootV2, deletedElementAnchor, { artifactVersion: "v2" });
    expect(rDeletedEl.status).toBe("orphan");

    // resolveAnchor MUST never mutate the artifact DOM
    expect(rootV2.innerHTML).toBe(htmlBefore);
  });

  it("should tie-break identical quotes with identical context by nearest pos.start", () => {
    const root = mountRoot(`
      <div data-review-root>
        <p>Item: alpha</p>
        <p>Item: alpha</p>
        <p>Item: alpha</p>
      </div>
    `);

    const thirdRange = createRangeForSubstring(root, "alpha", 2);
    const anchor: TextAnchorPayload = {
      t: "text",
      q: { exact: "alpha", prefix: "Item: ", suffix: "" },
      pos: {
        start: createAnchorFromSelection(root, thirdRange, "v1")!.pos!.start,
        end: createAnchorFromSelection(root, thirdRange, "v1")!.pos!.end,
      },
      v: "v1",
    };

    const resolved = resolveAnchor(root, anchor);
    expect(resolved.status).toBe("resolved");
    if (resolved.status === "resolved") {
      expect(resolved.strategy).toBe("text-quote");
      const paragraphs = root.querySelectorAll("p");
      expect(resolved.element).toBe(paragraphs[2]);
    }
  });

  it("should use selector step (step 3) before global fuzzy scan (step 4) when sel contains fuzzy quote", () => {
    const root = mountRoot(`
      <div data-review-root>
        <p>hello world</p>
        <p>hello world</p>
      </div>
    `);

    const anchor: TextAnchorPayload = {
      t: "text",
      q: { exact: "HELLO   WORLD" },
      sel: "p:nth-of-type(2)",
      v: "v1",
    };

    const resolved = resolveAnchor(root, anchor);
    expect(resolved.status).toBe("resolved");
    if (resolved.status === "resolved") {
      expect(resolved.strategy).toBe("selector");
      expect(resolved.element).toBe(root.querySelectorAll("p")[1]);
      expect(resolved.range?.toString()).toBe("hello world");
    }
  });

  it("should never orphan solely because artifactVersion changed, and resolve region anchors against root", () => {
    const root = mountRoot(RENDER_V1_HTML);
    const elAnchor = createAnchorFromElement(root, root.querySelector("blockquote")!, "v1")!;
    const regionAnchor = createAnchorFromRegion({ x: 0.2, y: 0.3, width: 0.4, height: 0.2 }, "v1");

    const rEl = resolveAnchor(root, elAnchor, { artifactVersion: "v99" });
    expect(rEl.status).toBe("resolved");
    if (rEl.status === "resolved") {
      expect(rEl.strategy).toBe("selector");
      expect(rEl.versionChanged).toBe(true);
    }

    const rRegion = resolveAnchor(root, regionAnchor, { artifactVersion: "v99" });
    expect(rRegion.status).toBe("resolved");
    if (rRegion.status === "resolved" && rRegion.kind === "region") {
      expect(rRegion.strategy).toBe("region");
      expect(rRegion.element).toBe(root);
      expect(rRegion.rect).toEqual(regionAnchor.rect);
      expect(rRegion.versionChanged).toBe(true);
    }
  });

  it("should automatically decode a1: sectionKeys in groupCommentsIntoThreads and retain anchor after root deletion", async () => {
    const root = mountRoot(RENDER_V1_HTML);
    const anchor = createAnchorFromSelection(
      root,
      createRangeForSubstring(root, "revenue grew 18%"),
      "v1",
    )!;
    const sectionKey = encodeAnchor(anchor);

    const fixture = createFixtureCommentsAdapter({
      caller: { userId: "user-alice" },
    });
    const created = await fixture.adapter.create({
      tenant: "ws-1",
      target: { kind: "artifact", id: "art-1", sectionKey },
      body: "Verify figure",
    });

    fixture.setCaller({ userId: "user-bob" });
    await fixture.adapter.reply({
      tenant: "ws-1",
      target: { kind: "artifact", id: "art-1" },
      threadId: created.threadId,
      body: "Confirmed against ledger",
    });

    // Delete root row -> remaining reply still carries sectionKey and decodes into ReviewThread.anchor!
    fixture.setCaller({ userId: "user-alice" });
    await fixture.adapter.remove("ws-1", created.id);

    const rows = await fixture.adapter.list("ws-1", { kind: "artifact", id: "art-1" });
    const threads = groupCommentsIntoThreads(rows);
    expect(threads).toHaveLength(1);
    expect(threads[0]?.anchor).toEqual(anchor);

    const resolved = resolveAnchor(root, threads[0]!.anchor!);
    expect(resolved.status).toBe("resolved");
  });

  it("should keep a text anchor attached to its explicit data-anchor-id block (range: null) when inner text is completely rewritten", () => {
    const rootV1 = mountRoot(
      `<div data-review-root><section data-anchor-id="sec-risks"><p>Original risk assessment wording.</p></section></div>`,
    );
    const anchor = createAnchorFromSelection(
      rootV1,
      createRangeForSubstring(rootV1, "Original risk assessment"),
      "v1",
    )!;

    const rootV2 = mountRoot(
      `<div data-review-root><section data-anchor-id="sec-risks"><p>Completely rewritten mitigation plan.</p></section></div>`,
    );
    const resolved = resolveAnchor(rootV2, anchor, { artifactVersion: "v2" });
    expect(resolved.status).toBe("resolved");
    if (resolved.status === "resolved") {
      expect(resolved.strategy).toBe("aid");
      expect(resolved.element.getAttribute("data-anchor-id")).toBe("sec-risks");
      expect(resolved.range).toBeNull();
      expect(resolved.versionChanged).toBe(true);
    }
  });
});
