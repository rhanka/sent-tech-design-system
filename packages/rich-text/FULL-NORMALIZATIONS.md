# Full-profile normalization manifest (CL-2F §2.9, host acceptance)

The full Markdown wire (`ds.markdown.full@1`) is canonical. A source that
already uses the canonical spellings round-trips byte-identical; any other
spelling parses to the same document and re-emits canonically. Each rule
below names the normalization the W1 receipt may cite per case. No rule
drops a used feature: marks, links, code languages, heading levels, list
starts, quote depths and horizontal rules survive every entry.

Rule implementation: [`src/editor-full-markdown.ts`](./src/editor-full-markdown.ts)
(`FULL_NORMALIZATION_MANIFEST`; the receipt test asserts this file and the
code manifest carry the same rule ids).

| id | normalization |
| --- | --- |
| `F10-M` | Closing fence immediately after an existing trailing LF; empty code has no blank body line. |
| `F16-M` | Terminal hard-break runs of prose text blocks emit no bytes; capture retains them. |
| `UNDERLINE-U` | Underline emits `<u>…</u>`; only the exact attribute-free token pair parses. |
| `HR-DASH` | Horizontal rules emit `---`; `***` and `___` parse to the same atom. |
| `LIST-MARKER` | Bullets emit `- `; `*`/`+` parse to bullets. Ordered items emit `N. `; `N)` parses. |
| `ORDERED-TYPE` | Non-default ordered types stay in capture; the wire uses numeric markers. |
| `SETEXT-ATX` | Setext headings parse and emit as ATX. |
| `EMPHASIS-DELIM` | Bold emits `**`, italic emits `*`; `__`/`…_…` variants parse to the same marks. |
| `INLINE-CODE-FENCE` | Inline code uses a backtick run longer than any internal run, with padding spaces. |
| `AUTOLINK` | Bare-URL links emit `<href>` when label equals href; titles stay optional. |
| `LINE-ENDING` | CRLF/CR normalize to LF before parsing. |
| `SOFTBREAK` | Single newlines inside a paragraph join with a space. |
| `TRAILING-SPACE` | Trailing spaces on a line are trimmed unless they form a parsed hard break. |
| `TRAILING-NL` | Trailing newlines of the source elide on the wire; blocks carry the content. |
| `BLANK-ONLY` | Whitespace-only inputs parse to identified empty blocks and re-emit the canonical blank wire. |
| `LIST-INDENT` | Nested list indentation canonicalizes to two spaces per level. |
| `HARD-BREAK-FORM` | Nonterminal breaks emit backslash + LF; two-space breaks parse to the same run. |

Out of schema (never normalized, never flattened): tables, task lists,
images, raw HTML blocks and hostile payloads become preserved blocks with
verbatim `raw` (or refuse whole on unsafe hrefs / active content).
