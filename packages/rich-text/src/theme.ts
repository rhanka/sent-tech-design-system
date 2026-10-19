// DS token bindings for the editor surface (spec §5.8).
// RT-0: token-prefix data only. The neutral core exports the mapping as data
// (mirroring `packages/codemirror/src/theme.ts`); the framework adapter
// applies it as a stylesheet in RT-1. All visual styling reads DS tokens:
// no colour, spacing, radius, font or motion value is hard-coded where a
// `--st-*` token exists. Theme changes resolve through CSS with no remount.

/** Component anatomy token prefix, following the
    `--st-component-<name>-…` pattern with semantic fallbacks. */
export const RICH_TEXT_TOKEN_PREFIX = "--st-component-richTextEditor" as const;
