/**
 * The minimal Markdown subset of the `<st-decision-dossier>` element's lazy
 * renderer (§6.2, §6.4, §14 L2; the conductor's L2 scope: the Focus renderer
 * defaults F-R0–F-R7 are lot L6, and L2 renders the document through a
 * minimal lazy renderer with Markdown sanitized by DOMPurify).
 *
 * The subset is deliberately small and REPLACED by L6's choice (§6.4: "the
 * Markdown parser and the allowed subset are chosen with the Focus pilot"):
 * paragraphs, **bold**, *italic*, `code`, [text](https://…) links and
 * - bullet lists. Raw HTML in the source is ESCAPED here, and the DOM half
 * still passes the output through DOMPurify before insertion (§6.4
 * defense-in-depth, U-14: DOMPurify is the chosen sanitizer, pinned 3.4.15).
 *
 * RED HISTORY (observed 2026-11-05, before the implementation existed): the
 * suite failed at import — `src/element/markdown/minimal-markdown.js` did
 * not exist (vitest: "Failed to resolve import").
 */

import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../src/element/markdown/minimal-markdown.js";

describe("the minimal Markdown subset", () => {
  it("splits paragraphs on blank lines", () => {
    expect(renderMarkdown("First paragraph.\n\nSecond paragraph.")).toBe(
      "<p>First paragraph.</p>\n<p>Second paragraph.</p>",
    );
  });

  it("renders the inline set: bold, italic, code and https links", () => {
    expect(renderMarkdown("**bold** and *italic* and `code`")).toBe(
      "<p><strong>bold</strong> and <em>italic</em> and <code>code</code></p>",
    );
    expect(renderMarkdown("see [the spec](https://example.com/spec)")).toBe(
      '<p>see <a href="https://example.com/spec">the spec</a></p>',
    );
  });

  it("refuses every non-https link scheme (javascript:, data:, relative)", () => {
    expect(renderMarkdown("[x](javascript:alert(1))")).toBe("<p>[x](javascript:alert(1))</p>");
    expect(renderMarkdown("[x](data:text/html,nope)")).toBe("<p>[x](data:text/html,nope)</p>");
    expect(renderMarkdown("[x](/relative)")).toBe("<p>[x](/relative)</p>");
  });

  it("escapes raw HTML in the source — a script never survives as markup", () => {
    const out = renderMarkdown("hello <script>alert(1)</script> <b>bold?</b>");
    expect(out).not.toContain("<script>");
    expect(out).not.toContain("<b>");
    expect(out).toContain("&lt;script&gt;");
    expect(out).toContain("&lt;b&gt;");
  });

  it("renders a bullet list as a ul of lis", () => {
    expect(renderMarkdown("- one\n- two\n\nafter")).toBe(
      "<ul>\n<li>one</li>\n<li>two</li>\n</ul>\n<p>after</p>",
    );
  });

  it("escapes an attribute-breaking quote inside a link text", () => {
    expect(renderMarkdown('["quoted"](https://example.com)')).toContain("&quot;");
  });
});
