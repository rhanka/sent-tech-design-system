# `@sentropic/design-system-vue`

Vue 3 implementation of the Sentropic design-system component catalog. The package ships ESM JavaScript, TypeScript declarations, and the shared component CSS.

## Installation

```bash
npm install @sentropic/design-system-vue @sentropic/design-system-themes
```

Vue 3 is a peer dependency:

```bash
npm install vue
```

## Usage

Import the package CSS once at the app or preview boundary, then render components inside `ThemeProvider`.

```vue
<script setup>
import { Button, Card, ThemeProvider } from "@sentropic/design-system-vue";
import "@sentropic/design-system-vue/styles.css";
</script>

<template>
  <ThemeProvider>
    <Card>
      <strong>Release plan</strong>
      <Button>Open plan</Button>
    </Card>
  </ThemeProvider>
</template>
```

`ThemeProvider` defaults to the Sent Tech theme. Tenant themes can be supplied from `@sentropic/design-system-themes`, `@sentropic/design-system-theme-dsfr`, or `@sentropic/design-system-theme-carbon`.

```vue
<script setup>
import { ThemeProvider } from "@sentropic/design-system-vue";
import { carbonTheme } from "@sentropic/design-system-theme-carbon";
</script>

<template>
  <ThemeProvider :theme="carbonTheme">
    <!-- your content -->
  </ThemeProvider>
</template>
```

## Exports

- `@sentropic/design-system-vue`: all public Vue components and TypeScript props.
- `@sentropic/design-system-vue/styles.css`: component CSS consumed by every theme.

The package includes declarations through `dist/index.d.ts` and marks `dist/styles.css` as a side effect so bundlers keep the stylesheet import.

## Build

```bash
npm --workspace @sentropic/design-system-vue run build
npm --workspace @sentropic/design-system-vue run test
```

Publishing is handled by `.github/workflows/vue-publish.yml` with a `vue-v*` tag.
