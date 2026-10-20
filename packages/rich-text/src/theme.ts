// DS token bindings for the editor surface (spec §5.8).
//
// The neutral core exports the mapping as data (mirroring
// `packages/codemirror/src/theme.ts`); the framework adapter applies it as
// a stylesheet in RT-1. All visual styling reads DS tokens: no colour,
// spacing, radius, font or motion value is hard-coded where a `--st-*`
// token exists. Theme changes resolve through CSS with no remount.

/** Component anatomy token prefix, following the
    `--st-component-<name>-…` pattern with semantic fallbacks. */
export const RICH_TEXT_TOKEN_PREFIX = "--st-component-richTextEditor" as const;

/** One style target of the editor surface: the ProseMirror hook the
    adapter styles, the component token read first, and the semantic token
    used while a component token is missing. */
export interface RichTextStyleBinding {
  /** ProseMirror hook or editor region the adapter stylesheet targets. */
  target: string;
  /** Component anatomy token (may be absent from the theme build). */
  token: string;
  /** Semantic fallback token, always present in the DS theme. */
  fallback: string;
}

/** ProseMirror class mapping for the editor surface: editor surface, caret,
    selection, placeholder, preserved-block chrome, focus outline. Data only;
    the Svelte adapter ships it as the subpath stylesheet (spec §5.8, §8). */
export const RICH_TEXT_CLASS_MAPPING: readonly RichTextStyleBinding[] =
  Object.freeze([
    {
      target: "editor surface (.ProseMirror)",
      token: `${RICH_TEXT_TOKEN_PREFIX}-surface`,
      fallback: "var(--st-semantic-surface-default)",
    },
    {
      target: "caret (caret-color)",
      token: `${RICH_TEXT_TOKEN_PREFIX}-caret`,
      fallback: "var(--st-semantic-text-primary)",
    },
    {
      target: "selection (background)",
      token: `${RICH_TEXT_TOKEN_PREFIX}-selection`,
      fallback: "var(--st-semantic-action-primary)",
    },
    {
      target: "placeholder (.ProseMirror-p-placeholder)",
      token: `${RICH_TEXT_TOKEN_PREFIX}-placeholder`,
      fallback: "var(--st-semantic-text-muted)",
    },
    {
      target: "preserved-block chrome ([data-preserved-block])",
      token: `${RICH_TEXT_TOKEN_PREFIX}-preservedBlock`,
      fallback: "var(--st-semantic-surface-subtle)",
    },
    {
      target: "focus outline (:focus-visible)",
      token: `${RICH_TEXT_TOKEN_PREFIX}-focusOutline`,
      fallback: "var(--st-semantic-border-strong)",
    },
  ]);
