# `@sentropic/design-system-svelte`

Svelte implementation of the Sentropic design-system component catalog. The package ships ESM JavaScript, TypeScript declarations, and the shared component CSS.

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
