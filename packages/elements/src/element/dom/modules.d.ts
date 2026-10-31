/**
 * Ambient module shapes of the DOM half (checked by tsconfig.dom.json, which
 * includes this directory): the wrapper `.svelte` components are compiled by
 * vite + svelte — never by tsc — so their side-effect imports and the
 * `ErrorPanel` component import need this wildcard; the theme stylesheets
 * load as raw text through vite's `?raw` suffix so the wrapper can re-scope
 * and adopt them (theme.ts). The `types` reference pulls svelte's own
 * ambient rune declarations (`$state`, `$derived`, `$effect`) into the
 * program, so `element-runtime.svelte.ts` type-checks under plain tsc.
 */
/// <reference types="svelte" />

declare module "*.svelte" {
  const component: unknown;
  export default component;
}

declare module "*?raw" {
  const text: string;
  export default text;
}
