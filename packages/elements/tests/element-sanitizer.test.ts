// @vitest-environment jsdom
/**
 * The DOMPurify restriction witness of review 1 (follow-up taken now, U-14):
 * the only string that ever enters the DOM as markup is the prose the
 * minimal Markdown renderer produces (focus-renderer.ts, §6.4 defense in
 * depth). The sanitizer is restricted to the EXACT tag and attribute subset
 * `renderMarkdown` emits — nothing more:
 *
 *   tags       p, ul, li, code, a, strong, em
 *   attributes  href (anchors only)
 *   schemes    https (the package's own rule: renderMarkdown emits only
 *              https anchors — minimal-markdown.ts §docstring)
 *   data attributes  never (ALLOW_DATA_ATTR: false)
 *
 * DOMPurify UNWRAPS a disallowed tag but keeps its allowed children, so the
 * witness asserts the real invariant: every surviving tag is in the emitted
 * subset, no non-https href survives, and no handler/data attribute does.
 * The samples below attack the SANITIZER layer directly (what it would keep
 * if `renderMarkdown` ever regressed and emitted raw HTML) and the composed
 * pipeline (hostile Markdown through renderMarkdownToSafeHtml, and through
 * the real renderDossier prose block).
 */

import { describe, expect, it } from "vitest";

import { renderMarkdown } from "../src/element/markdown/minimal-markdown.js";
import { renderDossier, renderMarkdownToSafeHtml } from "../src/element/dom/engines/focus-renderer.js";

const EMITTED_TAGS = new Set(["p", "ul", "li", "code", "a", "strong", "em"]);

function tagsOf(html: string): string[] {
  const container = document.createElement("div");
  container.innerHTML = html;
  return Array.from(container.querySelectorAll("*")).map((node) => node.tagName.toLowerCase());
}

describe("the DOMPurify restriction (U-14, review 1 follow-up)", () => {
  it("keeps exactly the tags renderMarkdown emits", () => {
    const markup = "<p>plain</p><ul><li>item <strong>bold</strong> and <em>italic</em></li></ul><code>x</code><a href=\"https://example.com\">link</a>";
    const tags = tagsOf(renderMarkdownToSafeHtml(markup));
    expect(new Set(tags)).toEqual(EMITTED_TAGS);
  });

  it("keeps no tag outside the emitted subset (DOMPurify unwraps, so check the survivors)", () => {
    const hostile = "<h1>heading</h1><h2>h2</h2><blockquote>quote</blockquote><ol><li>ordered</li></ol><pre><code>block</code></pre><br><table><tr><td>cell</td></tr></table><div>div</div><span>span</span><img src=\"https://example.com/x.png\"><p>kept</p>";
    const tags = tagsOf(renderMarkdownToSafeHtml(hostile));
    for (const tag of tags) {
      expect(EMITTED_TAGS.has(tag)).toBe(true);
    }
    for (const forbidden of ["h1", "h2", "blockquote", "ol", "pre", "br", "table", "tr", "td", "div", "span", "img"]) {
      expect(tags).not.toContain(forbidden);
    }
    expect(tags).toContain("p");
  });

  it("strips event handlers, style, and data attributes, and keeps no script, svg or iframe", () => {
    const hostile = '<p onclick="alert(1)" onerror="alert(2)" style="color:red" data-st-evil="1" data-foo="2">text</p><script>alert(3)</script><svg onload="alert(4)"></svg><iframe src="https://example.com"></iframe>';
    const out = renderMarkdownToSafeHtml(hostile);
    expect(out).not.toContain("onclick");
    expect(out).not.toContain("onerror");
    expect(out).not.toContain("onload");
    expect(out).not.toContain("style=");
    expect(out).not.toContain("data-st-evil");
    expect(out).not.toContain("data-foo");
    expect(out).not.toContain("<script");
    expect(out).not.toContain("<svg");
    expect(out).not.toContain("<iframe");
    expect(out).toContain("text");
  });

  it("keeps only https hrefs — every other scheme loses the href", () => {
    const hostile = '<a href="https://example.com/ok">https</a><a href="http://example.com/http">http</a><a href="mailto:a@b.cd">mailto</a><a href="javascript:alert(1)">js</a><a href="data:text/html,x">data</a><a href="/relative">rel</a>';
    const container = document.createElement("div");
    container.innerHTML = renderMarkdownToSafeHtml(hostile);
    const hrefs = Array.from(container.querySelectorAll("a"))
      .map((anchor) => anchor.getAttribute("href"))
      .filter((href): href is string => href !== null);
    expect(hrefs).toEqual(["https://example.com/ok"]);
  });

  it("the composed pipeline: a hostile MARKDOWN sample renders only the safe subset", () => {
    const hostileMarkdown = [
      "# heading that must stay text",
      "<script>alert('xss')</script> and <img src=x onerror=alert(1)>",
      "[legit](https://example.com/a) vs [evil](javascript:alert(2)) vs [data](data:text/html,z) vs [rel](/oops)",
      "- bullet with <b onmouseover=alert(3)>bold?</b>",
      "**bold** and *italic* and `code`",
      "<a href=\"https://example.com/b\" onclick=\"alert(4)\">inline html link</a>",
    ].join("\n\n");
    const html = renderMarkdownToSafeHtml(renderMarkdown(hostileMarkdown));
    const container = document.createElement("div");
    container.innerHTML = html;
    const tags = new Set(Array.from(container.querySelectorAll("*")).map((node) => node.tagName.toLowerCase()));
    expect(Array.from(tags).sort()).toEqual(["a", "code", "em", "li", "p", "strong", "ul"]);
    // The literal text of a non-https link stays escaped TEXT (no anchor), and
    // the one surviving anchor is https-only.
    const anchors = Array.from(container.querySelectorAll("a"));
    expect(anchors.length).toBe(1);
    expect(anchors[0]!.getAttribute("href")).toBe("https://example.com/a");
    for (const tag of tags) {
      expect(EMITTED_TAGS.has(tag)).toBe(true);
    }
  });

  it("the real renderer's prose block uses the same restriction (renderDossier)", () => {
    const target = document.createElement("div");
    const stop = renderDossier(
      target,
      {
        title: "Hostile",
        sections: [
          {
            kind: "prose",
            markdown: "text with <script>alert(1)</script> and <h1>a heading</h1> and [x](javascript:alert(2))",
          },
        ],
      },
      () => {},
    );
    const prose = target.querySelector(".st-dossier__prose");
    expect(prose).not.toBeNull();
    const tags = Array.from(prose!.querySelectorAll("*")).map((node) => node.tagName.toLowerCase());
    for (const tag of tags) {
      expect(EMITTED_TAGS.has(tag)).toBe(true);
    }
    expect(prose!.innerHTML).not.toContain("<script");
    expect(prose!.innerHTML).not.toContain("<h1");
    expect(prose!.querySelectorAll("a[href]:not([href^=\"https://\"])")).toHaveLength(0);
    stop();
  });
});
