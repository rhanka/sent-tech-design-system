/**
 * The minimal Markdown subset of the `<st-decision-dossier>` element's lazy
 * renderer (§6.2, §6.4, U-14; conductor's L2 scope: the Focus renderer
 * defaults F-R0–F-R7 are lot L6, and L2 renders the document through a
 * minimal lazy renderer so the pilot works end to end).
 *
 * The subset is deliberately small and REPLACED by L6's choice (§6.4: « the
 * Markdown parser and the allowed subset are chosen with the Focus pilot »):
 * paragraphs split on blank lines, `**bold**`, `*italic*`, `` `code` ``,
 * `[text](https://…)` links and `- ` bullet lists. Everything else is TEXT.
 *
 * Pure half: raw HTML in the source is ESCAPED here, and the DOM half
 * (`src/element/dom`) passes this module's output through DOMPurify before
 * insertion anyway (§6.4 defense in depth; U-14: DOMPurify 3.4.15 is the
 * chosen sanitizer, pinned, its license recorded by `licensing:check`).
 * Only `https:` links become anchors; every other scheme — `javascript:`,
 * `data:`, relative — stays literal text.
 */

/** Escape one text run for element content and attribute positions. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** One inline pass: code spans first (their content is never re-parsed). */
function renderInline(text: string): string {
  const escapes: string[] = [];
  const stash = (html: string): string => {
    escapes.push(html);
    return `\u0000${escapes.length - 1}\u0000`;
  };
  let out = escapeHtml(text);
  // `code` — content stays escaped, no nested inline.
  out = out.replace(/`([^`]+)`/g, (_match, code: string) => stash(`<code>${code}</code>`));
  // [text](https://…) — only the https scheme becomes an anchor.
  out = out.replace(/\[([^\]]*)\]\((https:\/\/[^)\s]+)\)/g, (_match, label: string, href: string) => {
    const safeHref = href.replace(/"/g, "%22");
    return stash(`<a href="${safeHref}">${label}</a>`);
  });
  // **bold**, then *italic*.
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return out.replace(/\u0000(\d+)\u0000/g, (_match, index: string) => escapes[Number(index)] ?? "");
}

/** One line by index, empty past the end (the callers bound-check first). */
function lineAt(lines: readonly string[], index: number): string {
  return lines[index] ?? "";
}

/** Does one line look like a bullet item (`- text`)? */
function isBullet(line: string): boolean {
  return /^- /.test(line);
}

/**
 * Render one Markdown source in the minimal subset. Pure: no DOM, no
 * sanitizer — the caller sanitizes (the DOM half routes this through
 * DOMPurify before insertion, §6.4).
 */
export function renderMarkdown(source: string): string {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: string[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lineAt(lines, index);
    if (line.trim() === "") {
      index += 1;
      continue;
    }
    if (isBullet(line)) {
      const items: string[] = [];
      while (index < lines.length && isBullet(lineAt(lines, index))) {
        items.push(`<li>${renderInline(lineAt(lines, index).slice(2))}</li>`);
        index += 1;
      }
      blocks.push(`<ul>\n${items.join("\n")}\n</ul>`);
      continue;
    }
    const paragraph: string[] = [];
    while (index < lines.length) {
      const current = lineAt(lines, index);
      if (current.trim() === "" || isBullet(current)) break;
      paragraph.push(renderInline(current));
      index += 1;
    }
    blocks.push(`<p>${paragraph.join("\n")}</p>`);
  }
  return blocks.join("\n");
}
