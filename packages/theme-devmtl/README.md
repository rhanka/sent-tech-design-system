# `@sentropic/design-system-theme-devmtl`

Sentropic design-system theme (`devmtl`, **v0 light**) for the `/dev/mtl` keynote companion pages (Focus decision dossiers, poll & simulation views, sync/comment screens).

> Scope of v0: light mode and foundation/semantic/component `--st-*` custom properties via `createComponent`. Dark mode and custom hand-drawn border refinements will follow in a later pass.

## 1. Use via npm / TypeScript (`devmtlTheme`)

```ts
import { compileTheme, compileThemeStyleTag } from "@sentropic/design-system-themes";
import { devmtlTheme } from "@sentropic/design-system-theme-devmtl";

const css = compileTheme(devmtlTheme);
const styleTag = compileThemeStyleTag(devmtlTheme);
```

## 2. Use via static CSS (`css/devmtl.css`)

Include or link `packages/theme-devmtl/css/devmtl.css` (also exported as `@sentropic/design-system-theme-devmtl/css/devmtl.css`):

```html
<link rel="stylesheet" href="devmtl.css" />
```

or inline its contents inside a `<style>` tag.

`css/devmtl.css` is generated from `src/index.ts` through `compileThemeWithModes` (the same compiler path as `packages/themes/css/sent-tech.css`) and defines every `--st-*` foundation, semantic, and component variable on:

- `:root`
- `[data-theme="devmtl"]`
- `[data-st-theme="devmtl"]`

Set `data-theme="devmtl"` (or `data-st-theme="devmtl"`) on `<html>` or on a container element:

```html
<html lang="fr" data-theme="devmtl">
```

## 3. Focus decision dossiers (`h2a`)

A Focus decision dossier renders in a standalone HTML shell and **picks up this theme only if the dossier builder on the `h2a` side inlines `packages/theme-devmtl/css/devmtl.css`** into the generated document.

## Scripts

```bash
npm --workspace packages/theme-devmtl run build   # tsc + regenerate css/devmtl.css
npm --workspace packages/theme-devmtl run check   # tsc --noEmit
npm --workspace packages/theme-devmtl run test    # vitest (including css/devmtl.css freshness)
```
