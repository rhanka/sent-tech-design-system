# `@sentropic/design-system-svelte`

Svelte implementation of the Sentropic design-system component catalog. The package ships TypeScript declarations, the shared component CSS, and the components themselves as **uncompiled `.svelte` source written in TypeScript** — every component file carries `<script lang="ts">`.

That last part has a consequence worth reading before you file a bug: **your build must preprocess this package's `.svelte` files, not just compile them.** See [TypeScript source, and what your build must do](#typescript-source-and-what-your-build-must-do).

## Installation

```bash
npm install @sentropic/design-system-svelte @sentropic/design-system-themes
```

Svelte is a peer dependency:

```bash
npm install svelte
```

## Usage

Import the package CSS once at the app or preview boundary, then render components inside `ThemeProvider`.

```svelte
<script>
  import { Button, Card, ThemeProvider } from "@sentropic/design-system-svelte";
  import "@sentropic/design-system-svelte/styles.css";
</script>

<ThemeProvider>
  <Card>
    <strong>Release plan</strong>
    <Button>Open plan</Button>
  </Card>
</ThemeProvider>
```

`ThemeProvider` defaults to the Sent Tech theme. Tenant themes can be supplied from `@sentropic/design-system-themes`, `@sentropic/design-system-theme-dsfr`, `@sentropic/design-system-theme-canada`, or `@sentropic/design-system-theme-quebec`.

```svelte
<script>
  import { ThemeProvider } from "@sentropic/design-system-svelte";
  import { dsfrTheme } from "@sentropic/design-system-theme-dsfr";
</script>

<ThemeProvider theme={dsfrTheme}>
  <!-- your content -->
</ThemeProvider>
```

## Exports

- `@sentropic/design-system-svelte`: all public Svelte components and TypeScript props.
- `@sentropic/design-system-svelte/styles.css`: component CSS consumed by every theme.

The package includes declarations through `dist/index.d.ts` and marks `dist/styles.css` as a side effect so bundlers keep the stylesheet import.

## Build

```bash
npm --workspace @sentropic/design-system-svelte run build
npm --workspace @sentropic/design-system-svelte run test
```

Publishing is handled by `.github/workflows/svelte-publish.yml` with a `svelte-v*` tag.

## TypeScript source, and what your build must do

The `.svelte` files in `dist/` are **source**, not compiled output. Each one begins with `<script lang="ts">` and contains type annotations. A Svelte-aware build therefore has to do two distinct things to them:

1. **preprocess** — strip the TypeScript (`vitePreprocess()` from `@sveltejs/vite-plugin-svelte`, or an equivalent);
2. **compile** — turn the result into a component.

Most setups do the second to dependencies but not the first, because preprocessing is commonly scoped to your own `src/`. When that happens the compiler receives TypeScript it cannot parse, and the error points at *our* file:

```
RollupError: Parse failure: Expected ',', got '?'
  at node_modules/@sentropic/design-system-svelte/dist/Accordion.svelte
```

**That error is a build-configuration symptom, not a broken package.** If you hit it, before filing anything, compare your copy against what npm actually served:

```bash
sha256sum node_modules/@sentropic/design-system-svelte/dist/Accordion.svelte
head -1 node_modules/@sentropic/design-system-svelte/dist/Accordion.svelte   # <script lang="ts" module>
```

If `lang="ts"` is on line 1 and the annotations are intact, the file on disk is fine and something in your pipeline is transforming it in flight. Usual suspects: a stale `node_modules/.vite` prebundle cache, the package being externalized so your Svelte plugin never sees it, or preprocessing configured only for your own sources.

This bites hardest under **vitest with jsdom**, where dependencies are externalized by default and never reach your Svelte plugin at all.

Our own packaging test preprocesses and compiles all 220 published `.svelte` files on every release (`scripts/smoke-pack.mjs`), so a genuinely unparseable file cannot ship. What that test does *not* do is reproduce every consumer bundler configuration — if you find an arrangement where a correct tarball still fails to build, that is worth reporting, and please include the `sha256sum` above.

